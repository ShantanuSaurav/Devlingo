/**
 * Sandboxed JavaScript test runner. Spawned as a short-lived child process by
 * the /api/execute route so that a runaway loop or a thrown stack cannot take
 * the API server with it.
 *
 * Contract: JSON payload on stdin, JSON result on stdout, nothing else.
 *   in  { code, entryFunction, testCases: [{input, expected}], gradingPath }
 *   out { status, stdout, stderr, testResults }
 */
import vm from 'node:vm';

const CASE_TIMEOUT_MS = 2000;
const SETUP_TIMEOUT_MS = 3000;
const MAX_LOG_CHARS = 8000;

function readStdin() {
  return new Promise((resolve, reject) => {
    let buf = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      buf += chunk;
    });
    process.stdin.on('end', () => resolve(buf));
    process.stdin.on('error', reject);
  });
}

function makeSandbox(logs) {
  const push = (level) => (...args) => {
    if (logs.text.length > MAX_LOG_CHARS) return;
    const line = args
      .map((a) => {
        if (typeof a === 'string') return a;
        try {
          return JSON.stringify(a);
        } catch {
          return String(a);
        }
      })
      .join(' ');
    logs.text += (logs.text ? '\n' : '') + (level === 'error' ? 'error: ' : '') + line;
  };

  // An explicit allow-list. No require, no process, no fs, no fetch.
  return {
    console: { log: push('log'), info: push('log'), warn: push('log'), error: push('error'), debug: push('log') },
    Math,
    JSON,
    Object,
    Array,
    String,
    Number,
    Boolean,
    Map,
    Set,
    WeakMap,
    WeakSet,
    Date,
    RegExp,
    Error,
    TypeError,
    RangeError,
    SyntaxError,
    Promise,
    Symbol,
    BigInt,
    Infinity,
    NaN,
    isNaN,
    isFinite,
    parseInt,
    parseFloat,
    encodeURIComponent,
    decodeURIComponent,
    structuredClone
  };
}

async function main() {
  const raw = await readStdin();
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch (e) {
    process.stdout.write(JSON.stringify({ status: 'error', stderr: 'Malformed runner payload' }));
    return;
  }

  const { code, entryFunction, testCases = [], gradingPath } = payload;
  const grading = await import(gradingPath);

  const logs = { text: '' };
  const sandbox = makeSandbox(logs);
  const context = vm.createContext(sandbox);

  // 1. Evaluate the submission.
  let hasEntry = false;
  try {
    new vm.Script(String(code), { filename: 'submission.js' }).runInContext(context, {
      timeout: SETUP_TIMEOUT_MS
    });
    if (entryFunction) {
      hasEntry = new vm.Script(
        `globalThis.__entry = typeof ${entryFunction} === 'function' ? ${entryFunction} : null;` +
          `globalThis.__entry !== null`,
        { filename: 'entry.js' }
      ).runInContext(context, { timeout: 1000 });
    }
  } catch (e) {
    const timedOut = /timed out/i.test(e?.message ?? '');
    process.stdout.write(
      JSON.stringify({
        status: 'error',
        stdout: logs.text,
        stderr: timedOut
          ? `Your code ran for over ${SETUP_TIMEOUT_MS}ms without finishing. That usually means a loop whose condition never becomes false.`
          : `${e.name ?? 'Error'}: ${e.message}`,
        testResults: []
      })
    );
    return;
  }

  // 2. No test cases means "just run it and show me the output".
  if (!testCases.length) {
    process.stdout.write(
      JSON.stringify({
        status: 'passed',
        stdout: logs.text,
        testResults: []
      })
    );
    return;
  }

  if (!hasEntry) {
    process.stdout.write(
      JSON.stringify({
        status: 'error',
        stdout: logs.text,
        stderr: `ReferenceError: no function named "${entryFunction}" was defined. Check the spelling and make sure it is declared at the top level.`,
        testResults: []
      })
    );
    return;
  }

  // 3. Run every case, isolating failures so one bad case still reports the rest.
  const testResults = [];
  let allPassed = true;

  for (const tc of testCases) {
    const before = logs.text.length;
    const started = process.hrtime.bigint();
    try {
      // Invoke *inside* the context so the vm timeout actually bounds the call.
      // A host-side `entry(...)` would spin forever on an infinite loop.
      const actual = new vm.Script(`__entry(...[${tc.input}])`, { filename: 'case.js' }).runInContext(
        context,
        { timeout: CASE_TIMEOUT_MS }
      );
      const elapsed = Number(process.hrtime.bigint() - started) / 1e6;

      if (actual && typeof actual.then === 'function') {
        throw new Error('async functions are not supported in this challenge - return a value directly');
      }

      const passed = grading.matchesExpected(actual, tc.expected);
      if (!passed) allPassed = false;
      testResults.push({
        input: tc.input,
        expected: tc.expected,
        actual: grading.displayValue(actual),
        passed,
        logs: logs.text.slice(before),
        timeMs: Math.round(elapsed * 100) / 100
      });
    } catch (e) {
      allPassed = false;
      const message =
        e && e.message && /Script execution timed out/i.test(e.message)
          ? `timed out after ${CASE_TIMEOUT_MS}ms - is there an infinite loop?`
          : `${e?.name ?? 'Error'}: ${e?.message ?? String(e)}`;
      testResults.push({
        input: tc.input,
        expected: tc.expected,
        actual: message,
        passed: false,
        logs: logs.text.slice(before)
      });
    }
  }

  process.stdout.write(
    JSON.stringify({
      status: allPassed ? 'passed' : 'failed',
      stdout: logs.text,
      testResults
    })
  );
}

main().catch((e) => {
  process.stdout.write(JSON.stringify({ status: 'error', stderr: String(e?.message ?? e) }));
});
