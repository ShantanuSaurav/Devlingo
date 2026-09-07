import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ExecutionResult, SupportedLanguage } from '../types';

const SNIPPETS: Record<SupportedLanguage, Record<string, string>> = {
  javascript: {
    transform: `// CodeQuest Live Online Compiler (JavaScript)
function solveChallenge(items) {
  console.log("Input items:", items);
  const transformed = items.map(n => n * 3);
  return transformed.filter(n => n > 6);
}

const output = solveChallenge([1, 2, 3, 4, 5]);
console.log("Result output:", output);`,
    twoSum: `// Two Sum Algorithm in O(n) Time
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

const indices = twoSum([2, 7, 11, 15], 9);
console.log("Two Sum Indices:", indices);`
  },
  python: {
    fibonacci: `# CodeQuest Live Online Compiler (Python 3 Wasm)
import math

def fibonacci(n):
    a, b = 0, 1
    seq = []
    for _ in range(n):
        seq.append(a)
        a, b = b, a + b
    return seq

print("Fibonacci Sequence:", fibonacci(8))
print("Square root of 144:", math.isqrt(144))
print("Done! Real CPython in WebAssembly.")`,
    reverse: `# String & Word Reversal in Python
def reverse_words(sentence):
    words = sentence.split()
    return " ".join(reversed(words))

msg = reverse_words("learn build code everyday")
print("Reversed:", msg)`
  },
  java: {
    main: `// CodeQuest Online Compiler (Java 17 / OpenJDK)
import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java in CodeQuest!");
        
        List<String> topics = Arrays.asList("Spring Boot", "JVM", "Multithreading", "Data Structures");
        System.out.println("Topics to master: " + topics);
        
        int sum = 0;
        for (int i = 1; i <= 10; i++) {
            sum += i;
        }
        System.out.println("Sum 1..10: " + sum);
    }
}`,
    fibonacci: `// Java Algorithm: Recursive & Iterative Fibonacci
public class Main {
    public static int fib(int n) {
        if (n <= 1) return n;
        return fib(n - 1) + fib(n - 2);
    }

    public static void main(String[] args) {
        System.out.println("Java Fibonacci Calculator:");
        for (int i = 0; i <= 7; i++) {
            System.out.println("fib(" + i + ") = " + fib(i));
        }
    }
}`
  },
  c: {
    main: `// CodeQuest Online Compiler (C / GCC)
#include <stdio.h>

int main() {
    printf("Hello from C in CodeQuest!\n");
    printf("Blazing fast low-level performance.\n");
    
    int numbers[] = {10, 20, 30, 40, 50};
    int total = 0;
    
    for (int i = 0; i < 5; i++) {
        total += numbers[i];
    }
    
    printf("Total sum: %d\n", total);
    return 0;
}`,
    fibonacci: `// C Language: Fibonacci Sequence
#include <stdio.h>

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    printf("C Fibonacci Calculation:\n");
    for (int i = 0; i < 8; i++) {
        printf("fib(%d) = %d\n", i, fibonacci(i));
    }
    return 0;
}`
  },
  cpp: {
    main: `// CodeQuest Online Compiler (C++)
#include <iostream>
#include <vector>

int main() {
    std::cout << "Hello from C++ in CodeQuest!" << std::endl;
    std::vector<int> v = {1, 2, 3, 4, 5};
    int sum = 0;
    for (int n : v) sum += n;
    std::cout << "Sum: " << sum << std::endl;
    return 0;
}`
  },
  go: {
    main: `// CodeQuest Online Compiler (Go)
package main
import "fmt"

func main() {
    fmt.Println("Hello from Go in CodeQuest!")
}`
  }
};

const FILE_NAMES: Record<SupportedLanguage, string> = {
  javascript: 'playground.js',
  python: 'playground.py',
  java: 'Main.java',
  c: 'main.c',
  cpp: 'main.cpp',
  go: 'main.go'
};

export const EditorShowcase: React.FC = () => {
  const { executeCode, openPractice, celebrate } = useGame();

  const [language, setLanguage] = useState<SupportedLanguage>('javascript');
  const [code, setCode] = useState<string>(SNIPPETS.javascript.transform);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string>('Click "▶ Run Code" to execute code in the sandbox.');
  const [executionTime, setExecutionTime] = useState<string>('');
  const [hasError, setHasError] = useState(false);

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    const snippetsForLang = SNIPPETS[newLang];
    const firstKey = Object.keys(snippetsForLang)[0];
    const defaultSnippet = snippetsForLang[firstKey] || '';
    setCode(defaultSnippet);
    setOutput(`Switched language to ${newLang.toUpperCase()}. Ready to run.`);
    setHasError(false);
    setExecutionTime('');
  };

  const handleRun = async () => {
    setIsRunning(true);
    setHasError(false);
    setOutput('Compiling and executing in sandbox...');

    try {
      const res: ExecutionResult = await executeCode(code, language);

      if (res.status === 'error' || res.stderr) {
        setHasError(true);
        setOutput(res.stderr || 'Execution failed with an unknown error.');
      } else {
        setHasError(false);
        setOutput(res.stdout || 'Program exited successfully with code 0 (no output printed).');
        celebrate();
      }

      if (res.time) {
        setExecutionTime(res.time);
      }
    } catch (err: any) {
      setHasError(true);
      setOutput(`Runtime Error: ${err.message || String(err)}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <section className="editor-section" id="compiler">
      <div className="section-head">
        <div>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: 'var(--accent-2)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            display: 'block',
            marginBottom: '0.3rem'
          }}>
            Multi-Language Sandbox
          </span>
          <h2 className="section-title">Online Compiler & Code Playground</h2>
        </div>
        <p className="section-sub">
          Write and run real code in JavaScript, Python, Java, and C instantly in your browser.
        </p>
      </div>

      <div className="editor-grid">
        {/* Code Editor Window */}
        <div className="editor-window">
          <div className="editor-titlebar" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="dot dot-red"></span>
              <span className="dot dot-yellow"></span>
              <span className="dot dot-green"></span>
              <span className="editor-filename">
                {FILE_NAMES[language]}
              </span>
            </div>

            {/* Language & Template Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: '4px', border: '1px solid var(--line)', padding: '2px' }}>
                {(['javascript', 'python', 'java', 'c'] as SupportedLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    style={{
                      padding: '0.25rem 0.6rem',
                      fontSize: '0.78rem',
                      fontFamily: 'var(--font-mono)',
                      borderRadius: '3px',
                      background: language === lang ? 'var(--accent)' : 'transparent',
                      color: language === lang ? '#fff' : 'var(--ink-dim)',
                      fontWeight: language === lang ? 600 : 400
                    }}
                    onClick={() => handleLanguageChange(lang)}
                  >
                    {lang === 'javascript' ? 'JS' : lang.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Quick Snippets */}
              <select
                aria-label="Preset Snippet"
                onChange={(e) => {
                  const val = e.target.value;
                  if (SNIPPETS[language] && SNIPPETS[language][val]) {
                    setCode(SNIPPETS[language][val]);
                  }
                }}
                style={{
                  background: 'var(--bg)',
                  color: 'var(--ink)',
                  border: '1px solid var(--line)',
                  borderRadius: '4px',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                <option value="">Snippets ▾</option>
                {Object.keys(SNIPPETS[language] || {}).map((key) => (
                  <option key={key} value={key}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Code Textarea Editor */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            style={{
              width: '100%',
              minHeight: '300px',
              background: 'transparent',
              color: 'var(--ink)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.92rem',
              lineHeight: 1.7,
              border: 'none',
              padding: '1.2rem',
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />

          {/* Action Bar */}
          <div style={{
            padding: '0.75rem 1.2rem',
            borderTop: '1px solid var(--line-soft)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg)'
          }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)' }}>
              Language: {language === 'javascript' ? 'JavaScript (Node.js)' : language === 'python' ? 'Python 3 (Pyodide Wasm)' : language === 'java' ? 'Java 17 (OpenJDK)' : 'C (GCC)'}
            </span>

            <button
              type="button"
              className="btn btn-solid"
              style={{ padding: '0.55rem 1.2rem', fontSize: '0.88rem' }}
              disabled={isRunning}
              onClick={handleRun}
            >
              {isRunning ? 'Compiling...' : '▶ Run Code'}
            </button>
          </div>
        </div>

        {/* Result & Terminal Output Panel */}
        <div className="result-panel" style={{ justifyContent: 'flex-start', padding: '1.4rem' }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line-soft)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
            <strong className="result-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}>
              <span>Terminal Console</span>
              {executionTime && (
                <span style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--ok)',
                  background: 'rgba(0, 184, 115, 0.1)',
                  padding: '2px 6px',
                  borderRadius: '3px'
                }}>
                  {executionTime}
                </span>
              )}
            </strong>

            <span style={{
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              color: hasError ? 'var(--danger)' : 'var(--ok)'
            }}>
              {hasError ? '● Error' : '● Ready'}
            </span>
          </div>

          <pre style={{
            width: '100%',
            flex: 1,
            minHeight: '180px',
            margin: 0,
            padding: '0.85rem',
            background: 'var(--bg)',
            border: `1px solid ${hasError ? 'var(--danger)' : 'var(--line)'}`,
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.86rem',
            lineHeight: 1.6,
            color: hasError ? 'var(--danger)' : 'var(--ink)',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            boxSizing: 'border-box'
          }}>
            {output}
          </pre>

          <div style={{ marginTop: '1rem', width: '100%', paddingTop: '0.8rem', borderTop: '1px solid var(--line-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--ink-dim)' }}>
              Want guided challenges with test grading?
            </span>
            <button
              type="button"
              className="btn btn-line"
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
              onClick={() => openPractice()}
            >
              Open Practice Challenges →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
