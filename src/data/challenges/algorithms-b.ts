import { Challenge } from '../../types';

/**
 * Stage 04 - Algorithms & Problem Solving, batch B.
 * Recursion, memoisation and DP, greedy choices, BFS vs DFS,
 * backtracking, and Big-O of nested loops.
 */
export const challenges: Challenge[] = [
  {
    id: 'stage-4-b01',
    stageId: 'stage-4',
    title: 'Where the recursion stops',
    type: 'output_prediction',
    difficulty: 'easy',
    language: 'javascript',
    prompt: 'What does this program print, line by line from top to bottom?',
    codeSnippet:
      'function countdown(n) {\n' +
      '  if (n === 0) return "done";\n' +
      '  console.log(n);\n' +
      '  return countdown(n - 1);\n' +
      '}\n' +
      '\n' +
      'console.log(countdown(3));',
    options: [
      '3, 2, 1, done',
      '3, 2, 1, 0, done',
      '0, 1, 2, 3, done',
      '3, 2, 1 and then a stack overflow'
    ],
    correctIndex: 0,
    hints: [
      'Look at the order of the statements: which one runs first when n is 0?',
      'Ask yourself which value of n never gets printed.'
    ],
    explanation:
      'The base case is checked first, so when n reaches 0 the function returns "done" without printing 0. That gives 3, 2, 1 from the recursive calls and then "done" from the outer console.log.',
    xpReward: 40,
    tags: ['recursion', 'base-case']
  },
  {
    id: 'stage-4-b02',
    stageId: 'stage-4',
    title: 'Cost of a triangular loop',
    type: 'quiz',
    difficulty: 'easy',
    language: 'javascript',
    prompt:
      'Let n be items.length. What is the time complexity of countPairs in Big-O notation?',
    codeSnippet:
      'function countPairs(items) {\n' +
      '  let pairs = 0;\n' +
      '  for (let i = 0; i < items.length; i++) {\n' +
      '    for (let j = i + 1; j < items.length; j++) {\n' +
      '      pairs++;\n' +
      '    }\n' +
      '  }\n' +
      '  return pairs;\n' +
      '}',
    options: [
      'O(n^2)',
      'O(n)',
      'O(n log n)',
      'O(n^2) in the worst case but O(n) in the best case'
    ],
    correctIndex: 0,
    hints: [
      'Count how many times pairs++ runs in total, then ask which term of that count grows fastest.',
      'Neither loop bound looks at the values inside items, only at how many there are.'
    ],
    explanation:
      'The body runs n(n - 1)/2 times, which expands to (n^2 - n)/2. Big-O keeps only the fastest-growing term and drops constant factors, so the halving and the -n both disappear and the answer is O(n^2). There is also no cheaper best case: neither loop bound and no branch inside depends on the values in items, so the count is fixed by n alone.',
    xpReward: 40,
    tags: ['big-o', 'nested-loops', 'complexity']
  },
  {
    id: 'stage-4-b03',
    stageId: 'stage-4',
    title: 'When greedy picks wrong',
    type: 'output_prediction',
    difficulty: 'medium',
    language: 'javascript',
    prompt:
      'This greedy routine always takes the largest coin that still fits. What does it print for a target of 6 with coins 4, 3 and 1?',
    codeSnippet:
      'function greedyCoins(target, coins) {\n' +
      '  let left = target;\n' +
      '  let used = 0;\n' +
      '  for (const c of coins) {\n' +
      '    while (left >= c) {\n' +
      '      left -= c;\n' +
      '      used++;\n' +
      '    }\n' +
      '  }\n' +
      '  return used;\n' +
      '}\n' +
      '\n' +
      'console.log(greedyCoins(6, [4, 3, 1]));',
    options: ['3', '2', '6', '1'],
    correctIndex: 0,
    hints: [
      'Follow the value of left after the 4 is taken.',
      'Compare the greedy result with the best answer you can find by hand.'
    ],
    explanation:
      'Greedy takes 4 first, leaving 2, which it can only pay with 1 + 1, so it returns 3. The optimal answer is 3 + 3 = 2 coins, so this coin set is a case where the locally best choice blocks the globally best solution.',
    xpReward: 70,
    tags: ['greedy', 'coin-change', 'optimality']
  },
  {
    id: 'stage-4-b04',
    stageId: 'stage-4',
    title: 'Add the memo table',
    type: 'fill_blank',
    difficulty: 'medium',
    language: 'javascript',
    prompt:
      'countPaths(row, col) counts the routes to a cell row steps down and col steps right, moving only down or right. Fill in the blanks so each (row, col) pair is computed once and reused.',
    codeSnippet:
      'function countPaths(row, col, memo = new Map()) {\n' +
      '  if (row === 0 || col === 0) return 1;\n' +
      '  const key = row + "," + col;\n' +
      '  if (memo.___(key)) return memo.get(key);\n' +
      '  const total =\n' +
      '    countPaths(row - 1, col, memo) +\n' +
      '    countPaths(row, col - 1, memo);\n' +
      '  memo.___(key, total);\n' +
      '  return total;\n' +
      '}',
    blanks: [
      { answer: 'has', choices: ['has', 'includes', 'contains', 'hasKey'] },
      { answer: 'set', choices: ['set', 'put', 'add', 'push'] }
    ],
    hints: [
      'A Map answers "do I already know this key?" with one method and records a new entry with another.',
      'Several of the choices are borrowed from Array, Set or maps in other languages.'
    ],
    explanation:
      'A Map tests membership with has(key) and stores with set(key, value); includes belongs to Array, add to Set, and contains, hasKey and put come from other languages. The two coordinates are folded into one string key because a Map compares keys by identity, so a fresh [row, col] array would never match a stored one. With the cache in place each cell is expanded once instead of once per path that reaches it.',
    xpReward: 70,
    tags: ['memoisation', 'recursion', 'map']
  },
  {
    id: 'stage-4-b05',
    stageId: 'stage-4',
    title: 'Give the recursion a floor',
    type: 'fill_blank',
    difficulty: 'easy',
    language: 'javascript',
    prompt:
      'Fill in the blanks so sumTo(n) adds up every whole number from n down to 1 and terminates.',
    codeSnippet:
      'function sumTo(n) {\n' +
      '  if (n ___ 0) return 0;\n' +
      '  return n + sumTo(n ___ 1);\n' +
      '}',
    blanks: [
      { answer: '<=', choices: ['<=', '>', '>=', '!=='] },
      { answer: '-', choices: ['-', '+', '*', '/'] }
    ],
    hints: [
      'Every recursive call must move the argument towards the base case.',
      'Think about what should happen if someone calls sumTo(-3).'
    ],
    explanation:
      'The recursive call must shrink n, so it passes n - 1, and the base case has to catch every value at or below 0 so a negative argument still terminates. Testing n > 0 in the guard would return 0 for real work, and using n === 0 would recurse forever on negatives.',
    xpReward: 40,
    tags: ['recursion', 'base-case', 'termination']
  },
  {
    id: 'stage-4-b06',
    stageId: 'stage-4',
    title: 'Order a breadth-first search',
    type: 'pseudocode_order',
    difficulty: 'medium',
    language: 'pseudocode',
    prompt:
      'Put these pseudocode lines in the order that performs a breadth-first search from start.',
    pseudocodeLines: [
      'CREATE an empty queue AND an empty visited set',
      'ADD start TO queue AND MARK start AS visited',
      'WHILE queue IS NOT EMPTY',
      '    SET node TO REMOVE FROM FRONT OF queue',
      '    FOR EACH neighbour OF node THAT IS NOT VISITED',
      '        MARK neighbour AS visited AND ADD IT TO BACK OF queue',
      '    END FOR',
      'END WHILE'
    ],
    hints: [
      'A node is marked visited at the moment it enters the queue, not when it leaves.',
      'Breadth-first means the oldest node in the queue is processed next.'
    ],
    explanation:
      'BFS removes from the front and appends to the back, so nodes come out in order of distance from start. Marking a neighbour visited as it is enqueued stops the same node being queued twice; swapping the queue for a stack turns the exact same skeleton into DFS.',
    xpReward: 70,
    tags: ['bfs', 'graphs', 'queue']
  },
  {
    id: 'stage-4-b07',
    stageId: 'stage-4',
    title: 'BFS against DFS',
    type: 'multi_select',
    difficulty: 'medium',
    language: 'pseudocode',
    prompt:
      'Which statements about BFS and DFS on an unweighted graph are true? Select every one that applies.',
    options: [
      'BFS reaches every node by a path with the fewest possible edges.',
      'DFS is normally written with an explicit stack, or with the call stack via recursion.',
      'DFS finds the shortest path first because it reaches deep nodes quickly.',
      'On a very wide graph BFS can hold far more nodes in memory at once than DFS.',
      'BFS cannot be run on a graph that contains a cycle.',
      'BFS on an unweighted graph requires a priority queue rather than a plain queue.'
    ],
    correctIndices: [0, 1, 3],
    hints: [
      'Think about what the frontier of each search looks like at any moment.',
      'A visited set is what makes cycles harmless for both searches.'
    ],
    explanation:
      'BFS expands nodes in distance order, so the first time it reaches a node it has used the fewest edges; DFS commits to one branch and may reach a node by a long path first. BFS stores the whole frontier, which is expensive on wide graphs, while DFS stores only the current path. A visited set handles cycles for both, and a plain FIFO queue is enough when every edge costs the same.',
    xpReward: 70,
    tags: ['bfs', 'dfs', 'graphs']
  },
  {
    id: 'stage-4-b08',
    stageId: 'stage-4',
    title: 'Climbing stairs with a cache',
    type: 'code_runner',
    difficulty: 'medium',
    language: 'javascript',
    prompt:
      'You can climb 1 or 2 steps at a time. Return how many distinct ways there are to reach step n. The tests include n = 40, so plain recursion without a cache will be far too slow.',
    starterCode:
      'function climbStairs(n, memo = new Map()) {\n' +
      '  // your code here\n' +
      '  return 0;\n' +
      '}',
    entryFunction: 'climbStairs',
    testCases: [
      { input: '1', expected: '1' },
      { input: '2', expected: '2' },
      { input: '5', expected: '8' },
      { input: '10', expected: '89' },
      { input: '40', expected: '165580141' }
    ],
    solutionCode:
      'function climbStairs(n, memo = new Map()) {\n' +
      '  if (n <= 2) return n;\n' +
      '  if (memo.has(n)) return memo.get(n);\n' +
      '  const ways = climbStairs(n - 1, memo) + climbStairs(n - 2, memo);\n' +
      '  memo.set(n, ways);\n' +
      '  return ways;\n' +
      '}',
    hints: [
      'The last move onto step n came either from step n - 1 or from step n - 2.',
      'Pass the same memo down into both recursive calls so the cache is shared.'
    ],
    explanation:
      'Every way to reach step n ends with a 1-step or a 2-step move, so ways(n) = ways(n - 1) + ways(n - 2) with ways(1) = 1 and ways(2) = 2. Without a cache the call tree doubles at every level, roughly O(2^n); memoising each n makes it O(n).',
    xpReward: 70,
    tags: ['dynamic-programming', 'memoisation', 'recursion']
  },
  {
    id: 'stage-4-b09',
    stageId: 'stage-4',
    title: 'Backtracking that never backtracks',
    type: 'debug',
    difficulty: 'hard',
    language: 'javascript',
    prompt:
      'This function should count every permutation of the input, but it always returns 1. Find the bug and fix it.',
    starterCode:
      'function countPermutations(nums) {\n' +
      '  const used = new Array(nums.length).fill(false);\n' +
      '  let count = 0;\n' +
      '  function walk(depth) {\n' +
      '    if (depth === nums.length) {\n' +
      '      count++;\n' +
      '      return;\n' +
      '    }\n' +
      '    for (let i = 0; i < nums.length; i++) {\n' +
      '      if (used[i]) continue;\n' +
      '      used[i] = true;\n' +
      '      walk(depth + 1);\n' +
      '    }\n' +
      '  }\n' +
      '  walk(0);\n' +
      '  return count;\n' +
      '}',
    entryFunction: 'countPermutations',
    testCases: [
      { input: '[1, 2]', expected: '2' },
      { input: '[1, 2, 3]', expected: '6' },
      { input: '[1, 2, 3, 4]', expected: '24' },
      { input: '[7]', expected: '1' }
    ],
    solutionCode:
      'function countPermutations(nums) {\n' +
      '  const used = new Array(nums.length).fill(false);\n' +
      '  let count = 0;\n' +
      '  function walk(depth) {\n' +
      '    if (depth === nums.length) {\n' +
      '      count++;\n' +
      '      return;\n' +
      '    }\n' +
      '    for (let i = 0; i < nums.length; i++) {\n' +
      '      if (used[i]) continue;\n' +
      '      used[i] = true;\n' +
      '      walk(depth + 1);\n' +
      '      used[i] = false;\n' +
      '    }\n' +
      '  }\n' +
      '  walk(0);\n' +
      '  return count;\n' +
      '}',
    hints: [
      'The used array is shared by every branch of the search.',
      'What has to happen to a choice once the recursive call built on it has finished?'
    ],
    explanation:
      'Backtracking is choose, explore, then undo. The loop marks used[i] = true but never clears it, so after the first full branch every slot is stuck at true and no other ordering can start. Restoring used[i] = false after the recursive call returns releases the choice for sibling branches.',
    xpReward: 110,
    tags: ['backtracking', 'recursion', 'debugging']
  },
  {
    id: 'stage-4-b10',
    stageId: 'stage-4',
    title: 'Fewest coins, done properly',
    type: 'code_runner',
    difficulty: 'hard',
    language: 'javascript',
    prompt:
      'Return the smallest number of coins that add up to amount, or -1 when it cannot be made. Coins may be reused any number of times. Greedy is not good enough here.',
    starterCode:
      'function minCoins(coins, amount) {\n' +
      '  // your code here\n' +
      '  return -1;\n' +
      '}',
    entryFunction: 'minCoins',
    testCases: [
      { input: '[1, 3, 4], 6', expected: '2' },
      { input: '[2], 3', expected: '-1' },
      { input: '[1, 5, 10, 25], 30', expected: '2' },
      { input: '[5, 7], 0', expected: '0' },
      { input: '[1, 3, 4], 11', expected: '3' }
    ],
    solutionCode:
      'function minCoins(coins, amount) {\n' +
      '  const best = new Array(amount + 1).fill(Infinity);\n' +
      '  best[0] = 0;\n' +
      '  for (let value = 1; value <= amount; value++) {\n' +
      '    for (const coin of coins) {\n' +
      '      if (coin <= value && best[value - coin] + 1 < best[value]) {\n' +
      '        best[value] = best[value - coin] + 1;\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return best[amount] === Infinity ? -1 : best[amount];\n' +
      '}',
    hints: [
      'Build an array best[v] = fewest coins for value v, filling it from 0 upwards.',
      'best[0] is 0, and any value you never manage to reach should stay at Infinity.'
    ],
    explanation:
      'Solving every smaller amount first turns the problem into best[v] = 1 + min(best[v - coin]) over the coins that fit. Amounts that stay at Infinity are unreachable and map to -1, and the loop is O(amount * coins.length) rather than the exponential search recursion alone would do.',
    xpReward: 110,
    tags: ['dynamic-programming', 'coin-change', 'bottom-up']
  }
];
