import { Stage } from '../types';

export const STAGES_DATA: Stage[] = [
  {
    id: 'stage-1',
    index: '01',
    name: 'Programming Basics',
    state: 'Completed',
    description: 'Variables, types, control flow, and fundamental logic.',
    challenges: [
      {
        id: 'c1-1',
        stageId: 'stage-1',
        title: 'Variable Scoping & Hoisting',
        type: 'quiz',
        language: 'javascript',
        prompt: 'What will be the console output of the following JavaScript snippet?',
        codeSnippet: 'console.log(typeof score);\nvar score = 100;',
        options: [
          'undefined',
          'number',
          'ReferenceError: score is not defined',
          'null'
        ],
        correctIndex: 0,
        explanation: 'Due to var hoisting, the declaration "var score" is hoisted to the top and initialized with "undefined" until execution reaches the assignment.',
        xpReward: 50
      },
      {
        id: 'c1-2',
        stageId: 'stage-1',
        title: 'Strict Equality Truthiness',
        type: 'quiz',
        language: 'javascript',
        prompt: 'Which of the following comparisons evaluates to false in JavaScript?',
        codeSnippet: '// Check type coercion vs strict equality\nconst a = [] == false;\nconst b = [] === false;\nconst c = "" == 0;',
        options: [
          '[] == false',
          '[] === false',
          '"" == 0',
          'null == undefined'
        ],
        correctIndex: 1,
        explanation: '[] === false checks both type and value without coercion. An empty array is an object, so object === boolean is strictly false.',
        xpReward: 50
      }
    ]
  },
  {
    id: 'stage-2',
    index: '02',
    name: 'Python Fundamentals',
    state: 'Completed',
    description: 'Lists, dictionaries, comprehensions, and clean idiomatic Python.',
    challenges: [
      {
        id: 'c2-1',
        stageId: 'stage-2',
        title: 'List Comprehension Magic',
        type: 'quiz',
        language: 'python',
        prompt: 'What does this Python list comprehension produce?',
        codeSnippet: 'nums = [1, 2, 3, 4, 5]\nres = [x * 2 for x in nums if x % 2 != 0]\nprint(res)',
        options: [
          '[2, 6, 10]',
          '[4, 8]',
          '[2, 4, 6, 8, 10]',
          '[1, 3, 5]'
        ],
        correctIndex: 0,
        explanation: 'It filters for odd numbers (1, 3, 5) and multiplies each by 2, resulting in [2, 6, 10].',
        xpReward: 60
      },
      {
        id: 'c2-2',
        stageId: 'stage-2',
        title: 'Online Code Runner: Word Reversal',
        type: 'code_runner',
        language: 'python',
        prompt: 'Complete the function `reverse_words(sentence)` that returns the words in reverse order.',
        starterCode: 'def reverse_words(sentence: str) -> str:\n    # Write your solution here\n    words = sentence.split()\n    return " ".join(reversed(words))\n',
        entryFunction: 'reverse_words',
        testCases: [
          { input: '"hello world"', expected: '"world hello"' },
          { input: '"code build learn"', expected: '"learn build code"' }
        ],
        explanation: 'Splitting on whitespace and joining in reverse order runs in linear O(n) time.',
        xpReward: 80
      }
    ]
  },
  {
    id: 'stage-3',
    index: '03',
    name: 'Problem Solving',
    state: 'In progress',
    description: 'Two pointers, hash tables, stack patterns, and asymptotic optimization.',
    challenges: [
      {
        id: 'c3-1',
        stageId: 'stage-3',
        title: 'Online Code Runner: Two Sum O(n)',
        type: 'code_runner',
        language: 'javascript',
        prompt: 'Given an array of numbers and a target, return indices of the two numbers that add up to target.',
        starterCode: 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}',
        entryFunction: 'twoSum',
        testCases: [
          { input: '[2, 7, 11, 15], 9', expected: '[0, 1]' },
          { input: '[3, 2, 4], 6', expected: '[1, 2]' },
          { input: '[3, 3], 6', expected: '[0, 1]' }
        ],
        explanation: 'A Hash Map allows storing complements (target - num) and querying them in O(1) average time, giving an overall O(n) scan!',
        xpReward: 100
      },
      {
        id: 'c3-2',
        stageId: 'stage-3',
        title: 'Loop Invariants & Edge Cases',
        type: 'quiz',
        language: 'javascript',
        prompt: 'In binary search while (left <= right), what is the standard fix to prevent integer overflow when calculating midpoint?',
        codeSnippet: 'int mid = (left + right) / 2; // Can overflow if left + right > MAX_INT',
        options: [
          'int mid = left + (right - left) / 2;',
          'int mid = (left * right) / 2;',
          'int mid = right - left / 2;',
          'int mid = (left + right) >> 2;'
        ],
        correctIndex: 0,
        explanation: 'left + (right - left) / 2 calculates the midpoint without summing two large positive numbers, preventing overflow.',
        xpReward: 75
      }
    ]
  },
  {
    id: 'stage-4',
    index: '04',
    name: 'Web Development',
    state: 'Locked',
    description: 'DOM manipulation, async event loops, modern CSS grid/flex, and API fetching.',
    challenges: [
      {
        id: 'c4-1',
        stageId: 'stage-4',
        title: 'Microtasks vs Macrotasks',
        type: 'quiz',
        language: 'javascript',
        prompt: 'What is logged first when setTimeout(..., 0) and Promise.resolve().then(...) are called in sequence?',
        codeSnippet: 'setTimeout(() => console.log("Timeout"), 0);\nPromise.resolve().then(() => console.log("Promise"));\nconsole.log("Sync");',
        options: [
          '"Sync", then "Promise", then "Timeout"',
          '"Sync", then "Timeout", then "Promise"',
          '"Promise", then "Sync", then "Timeout"',
          '"Timeout", then "Promise", then "Sync"'
        ],
        correctIndex: 0,
        explanation: 'Synchronous code runs first. Then the microtask queue (Promises) is emptied before the macrotask queue (setTimeout) is processed.',
        xpReward: 80
      }
    ]
  },
  {
    id: 'stage-5',
    index: '05',
    name: 'Backend Development',
    state: 'Locked',
    isPremium: true,
    description: 'RESTful architecture, databases, auth, security, and concurrency.',
    challenges: [
      {
        id: 'c5-1',
        stageId: 'stage-5',
        title: 'Idempotency in HTTP Methods',
        type: 'quiz',
        language: 'javascript',
        prompt: 'Which HTTP method is defined as idempotent according to the HTTP specification?',
        options: [
          'PUT',
          'POST',
          'PATCH',
          'CONNECT'
        ],
        correctIndex: 0,
        explanation: 'PUT and DELETE are idempotent; executing them multiple times with the same payload results in the same resource state. POST is not idempotent.',
        xpReward: 80
      }
    ]
  },
  {
    id: 'stage-6',
    index: '06',
    name: 'Build Real Projects',
    state: 'Locked',
    isPremium: true,
    description: 'Full-stack integration, production deployments, testing, and CI/CD.',
    challenges: [
      {
        id: 'c6-1',
        stageId: 'stage-6',
        title: 'Zero-Downtime Deployment Strategies',
        type: 'quiz',
        language: 'javascript',
        prompt: 'Which deployment strategy switches router traffic between two identical production environments (current vs new version)?',
        options: [
          'Blue-Green Deployment',
          'Canary Deployment',
          'Rolling Deployment',
          'Shadow Deployment'
        ],
        correctIndex: 0,
        explanation: 'Blue-Green deployment provisions a new identical environment (Green), tests it, and redirects live router traffic instantly from Blue to Green.',
        xpReward: 100
      }
    ]
  }
];
