/**
 * Code execution.
 *
 * Three real engines, and no pretending:
 *   javascript  -> the local API's Node sandbox, or a Web Worker if it is down
 *   python      -> CPython compiled to WebAssembly (Pyodide), in the browser
 *   everything  -> Judge0, but only when an endpoint is actually configured
 *
 * The previous version faked C and Java by regex-scraping printf/System.out and
 * reporting "compiled successfully". That taught people the wrong thing, so any
 * language without a real engine now returns an honest error instead.
 */
import { ExecutionResult, SupportedLanguage, TestCase, TestResult } from '../types';
import { api } from '../lib/api';
import { displayValue, matchesExpected } from '../lib/grading';

const JUDGE0_URL = import.meta.env.VITE_JUDGE0_API_URL as string | undefined;
const JUDGE0_KEY = import.meta.env.VITE_JUDGE0_API_KEY as string | undefined;
const JUDGE0_HOST = import.meta.env.VITE_JUDGE0_API_HOST as string | undefined;

const JUDGE0_CONFIGURED = Boolean(
  JUDGE0_URL && JUDGE0_KEY && !JUDGE0_URL.includes('your-judge0') && !JUDGE0_KEY.startsWith('your_')
);

const LANGUAGE_IDS: Partial<Record<SupportedLanguage, number>> = {
  javascript: 63,
  typescript: 74,
  python: 71,
  java: 62,
  c: 50,
  cpp: 54,
  go: 60
};

const WORKER_TIMEOUT_MS = 6000;
const PYODIDE_VERSION = '0.26.4';

/* -------------------------------------------------------- browser JS worker */

let workerUnavailable = false;

function runInWorker(
  code: string,
  entryFunction: string | undefined,
  testCases: TestCase[]
): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    let worker: Worker;
    try {
      worker = new Worker(new URL('../lib/sandbox.worker.ts', import.meta.url), { type: 'module' });
    } catch (e: any) {
      workerUnavailable = true;
      resolve({
        status: 'error',
        stderr: `Could not start the browser sandbox: ${e?.message ?? e}`,
        engine: 'none',
        testResults: []
      });
      return;
    }

    const started = performance.now();
    let settled = false;

    const finish = (result: ExecutionResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.terminate();
      resolve({
        ...result,
        engine: 'browser-worker',
        time: `${(performance.now() - started).toFixed(0)}ms (browser sandbox)`
      });
    };

    // Terminating the worker is the only way to stop synchronous JavaScript.
    const timer = setTimeout(() => {
      finish({
        status: 'error',
        stderr: `Execution timed out after ${WORKER_TIMEOUT_MS}ms. Check for a loop that never ends.`,
        testResults: []
      });
    }, WORKER_TIMEOUT_MS);

    worker.onmessage = (event: MessageEvent<ExecutionResult>) => finish(event.data);
    worker.onerror = (event) => {
      finish({
        status: 'error',
        stderr: event.message || 'The browser sandbox crashed.',
        testResults: []
      });
    };

    worker.postMessage({ code, entryFunction, testCases });
  });
}

/* ------------------------------------------------------------------ Pyodide */

let pyodideInstance: any = null;
let pyodidePromise: Promise<any> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') resolve();
      else {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Failed to load ' + src)));
      }
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = () => reject(new Error(`Could not download the Python runtime from ${src}`));
    document.head.appendChild(script);
  });
}

async function getPyodide(onProgress?: (message: string) => void): Promise<any> {
  if (pyodideInstance) return pyodideInstance;
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      const indexURL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
      onProgress?.('Downloading the Python runtime (about 10 MB, once per session)...');
      if (!(window as any).loadPyodide) await loadScript(`${indexURL}pyodide.js`);
      onProgress?.('Starting CPython...');
      const instance = await (window as any).loadPyodide({ indexURL });
      pyodideInstance = instance;
      return instance;
    })().catch((err) => {
      pyodidePromise = null;
      throw err;
    });
  }
  return pyodidePromise;
}

/** Is Python ready without a download? Lets the UI warn before a long wait. */
export function isPythonReady(): boolean {
  return pyodideInstance !== null;
}

async function runPython(
  code: string,
  entryFunction: string | undefined,
  testCases: TestCase[],
  onProgress?: (message: string) => void
): Promise<ExecutionResult> {
  const started = performance.now();
  let pyodide: any;
  try {
    pyodide = await getPyodide(onProgress);
  } catch (e: any) {
    return {
      status: 'error',
      stderr:
        `${e?.message ?? e}\n\nPython runs through Pyodide, which is downloaded from a CDN on ` +
        `first use. Check your connection and try again.`,
      engine: 'none',
      testResults: []
    };
  }

  const stdout: string[] = [];
  const stderr: string[] = [];
  pyodide.setStdout({ batched: (msg: string) => stdout.push(msg) });
  pyodide.setStderr({ batched: (msg: string) => stderr.push(msg) });

  const elapsed = () => `${(performance.now() - started).toFixed(0)}ms (CPython ${PYODIDE_VERSION} Wasm)`;

  try {
    await pyodide.runPythonAsync(code);
  } catch (e: any) {
    return {
      status: 'error',
      stdout: stdout.join('\n'),
      stderr: formatPythonError(e),
      engine: 'pyodide',
      time: elapsed(),
      testResults: []
    };
  }

  if (!testCases.length) {
    return {
      status: 'passed',
      stdout: stdout.join('\n') || 'Program finished with no output.',
      engine: 'pyodide',
      time: elapsed(),
      testResults: []
    };
  }

  if (!entryFunction) {
    return {
      status: 'error',
      stderr: 'This challenge has test cases but no entry function was configured.',
      engine: 'pyodide',
      testResults: []
    };
  }

  const defined = pyodide.runPython(
    `callable(globals().get(${JSON.stringify(entryFunction)}))`
  );
  if (!defined) {
    return {
      status: 'error',
      stdout: stdout.join('\n'),
      stderr: `NameError: no function named "${entryFunction}" was defined. Check the spelling and the indentation.`,
      engine: 'pyodide',
      time: elapsed(),
      testResults: []
    };
  }

  // Serialise through JSON so the comparison rules match every other engine.
  pyodide.runPython(`
import json as __cq_json

def __cq_call(__fn_name, __args_src):
    __fn = globals()[__fn_name]
    __args = eval("(" + __args_src + ",)")
    __value = __fn(*__args)
    try:
        return __cq_json.dumps(__value)
    except TypeError:
        return __cq_json.dumps(repr(__value))
`);

  const testResults: TestResult[] = [];
  let allPassed = true;

  for (const tc of testCases) {
    const before = stdout.length;
    const caseStart = performance.now();
    try {
      const json = pyodide.runPython(
        `__cq_call(${JSON.stringify(entryFunction)}, ${JSON.stringify(tc.input)})`
      );
      const actual = JSON.parse(String(json));
      const passed = matchesExpected(actual, tc.expected);
      if (!passed) allPassed = false;
      testResults.push({
        input: tc.input,
        expected: tc.expected,
        actual: displayValue(actual),
        passed,
        logs: stdout.slice(before).join('\n'),
        timeMs: Math.round((performance.now() - caseStart) * 100) / 100
      });
    } catch (e: any) {
      allPassed = false;
      testResults.push({
        input: tc.input,
        expected: tc.expected,
        actual: formatPythonError(e),
        passed: false,
        logs: stdout.slice(before).join('\n')
      });
    }
  }

  return {
    status: allPassed ? 'passed' : 'failed',
    stdout: stdout.join('\n'),
    stderr: stderr.length ? stderr.join('\n') : undefined,
    engine: 'pyodide',
    time: elapsed(),
    testResults
  };
}

/** Pyodide errors arrive with a long JS stack glued on; keep the Python part. */
function formatPythonError(e: any): string {
  const raw = String(e?.message ?? e);
  const marker = raw.indexOf('Traceback (most recent call last)');
  const python = marker >= 0 ? raw.slice(marker) : raw;
  return python.split('\n').slice(0, 12).join('\n').trim();
}

/* ------------------------------------------------------------------ Judge0 */

function encodeBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

function decodeBase64(b64?: string | null): string {
  if (!b64) return '';
  try {
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return '';
  }
}

async function runJudge0(code: string, language: SupportedLanguage): Promise<ExecutionResult> {
  const languageId = LANGUAGE_IDS[language];
  if (!languageId) {
    return {
      status: 'error',
      stderr: `${language} is not supported by the configured compiler.`,
      engine: 'none',
      testResults: []
    };
  }

  const started = performance.now();
  const response = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': JUDGE0_KEY as string,
      'X-RapidAPI-Host': JUDGE0_HOST || 'judge0-ce.p.rapidapi.com'
    },
    body: JSON.stringify({ source_code: encodeBase64(code), language_id: languageId })
  });

  if (!response.ok) {
    throw new Error(`the compiler service replied ${response.status}`);
  }

  const data = await response.json();
  const compileOutput = decodeBase64(data.compile_output);
  const stderr = decodeBase64(data.stderr);
  const stdout = decodeBase64(data.stdout);
  const time = data.time
    ? `${(parseFloat(data.time) * 1000).toFixed(0)}ms (Judge0)`
    : `${(performance.now() - started).toFixed(0)}ms (Judge0)`;

  if (compileOutput.trim()) {
    return { status: 'error', stderr: compileOutput.trim(), engine: 'judge0', time, testResults: [] };
  }
  if (stderr.trim() || (data.status?.id && data.status.id > 3)) {
    return {
      status: 'error',
      stderr: stderr.trim() || data.status?.description || 'Runtime error',
      stdout: stdout.trim() || undefined,
      engine: 'judge0',
      time,
      testResults: []
    };
  }
  return {
    status: 'passed',
    stdout: stdout.trim() || 'Program finished with no output.',
    engine: 'judge0',
    time,
    testResults: []
  };
}

/* -------------------------------------------------------------------- entry */

export interface ExecuteOptions {
  entryFunction?: string;
  testCases?: TestCase[];
  onProgress?: (message: string) => void;
  /** Skip the API round-trip (used by the offline path and by tests). */
  preferLocal?: boolean;
}

export const compilerService = {
  /** Which engine will handle a language, for display in the UI. */
  engineFor(language: SupportedLanguage): string {
    if (language === 'javascript' || language === 'typescript') return 'Node sandbox / browser worker';
    if (language === 'python') return `CPython ${PYODIDE_VERSION} (WebAssembly)`;
    if (JUDGE0_CONFIGURED) return 'Judge0 remote compiler';
    return 'no runtime configured';
  },

  canRun(language: SupportedLanguage): boolean {
    if (language === 'javascript' || language === 'typescript' || language === 'python') return true;
    return JUDGE0_CONFIGURED && Boolean(LANGUAGE_IDS[language]);
  },

  async executeCode(
    code: string,
    language: SupportedLanguage = 'javascript',
    options: ExecuteOptions = {}
  ): Promise<ExecutionResult> {
    const { entryFunction, testCases = [], onProgress, preferLocal = false } = options;

    if (!code.trim()) {
      return { status: 'error', stderr: 'There is no code to run yet.', engine: 'none', testResults: [] };
    }

    if (language === 'python') {
      return runPython(code, entryFunction, testCases, onProgress);
    }

    if (language === 'javascript' || language === 'typescript') {
      // Prefer the server: it is a real process with a hard kill, and it is the
      // same engine the content validator uses. `workerUnavailable` must not
      // gate this branch - if the browser sandbox is broken, the server is the
      // only thing left, so we should try it harder, not skip it.
      if (!preferLocal || workerUnavailable) {
        try {
          const result = await api.execute({ language, code, entryFunction, testCases });
          if (result && result.engine !== 'none') return result;
        } catch {
          /* server down - fall through to the browser sandbox */
        }
      }
      return runInWorker(code, entryFunction, testCases);
    }

    if (JUDGE0_CONFIGURED) {
      try {
        return await runJudge0(code, language);
      } catch (e: any) {
        return {
          status: 'error',
          stderr: `Could not reach the remote compiler: ${e?.message ?? e}`,
          engine: 'none',
          testResults: []
        };
      }
    }

    return {
      status: 'error',
      engine: 'none',
      stderr:
        `There is no ${language} runtime available.\n\n` +
        `JavaScript and Python run locally with no setup. To run ${language}, set ` +
        `VITE_JUDGE0_API_URL and VITE_JUDGE0_API_KEY in .env and restart the dev server.`,
      testResults: []
    };
  }
};
