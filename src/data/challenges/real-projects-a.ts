import { Challenge } from '../../types';

/**
 * Stage 10 - Build Real Projects, batch A.
 * Shipping software that is already live: CI/CD pipelines, blue-green vs
 * canary vs rolling deploys, environment configuration and secrets,
 * production database migrations, feature flags and rollback strategy.
 */
export const challenges: Challenge[] = [
  {
    id: 'stage-10-a01',
    stageId: 'stage-10',
    title: 'A gate placed after the door',
    type: 'quiz',
    difficulty: 'easy',
    language: 'bash',
    prompt:
      'This script runs on every push to main. It has already shipped a release that fails linting. Which single change fixes that?',
    codeSnippet:
      '#!/bin/sh\n' +
      '# ci.sh - runs on every push to main\n' +
      'set -e\n' +
      'npm ci\n' +
      'npm run build\n' +
      'npm test\n' +
      'npm run deploy:prod\n' +
      'npm run lint',
    options: [
      'Move npm run lint above npm run deploy:prod',
      'Replace npm ci with npm install so the lockfile can be updated',
      'Run npm test before npm run build',
      'Remove set -e so a failing check does not abort the script'
    ],
    correctIndex: 0,
    hints: [
      'Ask which of these commands can still change what customers see.',
      'A check that runs after the release has shipped cannot un-ship it.'
    ],
    explanation:
      'A pipeline is a sequence of gates, and every check that is allowed to reject a build must run before the step that publishes it. Linting after the deploy turns a red build into an alert about something users are already running.',
    xpReward: 40,
    tags: ['ci-cd', 'pipelines', 'fail-fast']
  },
  {
    id: 'stage-10-a02',
    stageId: 'stage-10',
    title: 'Every environment variable is a string',
    type: 'output_prediction',
    difficulty: 'easy',
    language: 'javascript',
    prompt: 'The object below is what process.env looks like in staging. What does this print?',
    codeSnippet:
      'const env = {\n' +
      '  PORT: "8080",\n' +
      '  ENABLE_CACHE: "false",\n' +
      '  TIMEOUT: "0"\n' +
      '};\n' +
      'const port = Number(env.PORT) + 1;\n' +
      'const cache = Boolean(env.ENABLE_CACHE);\n' +
      'const timeout = Number(env.TIMEOUT) || 30;\n' +
      'console.log(port, cache, timeout);',
    options: ['8081 true 30', '8081 false 30', '8081 true 0', '8081 false 0'],
    hints: [
      'Boolean() only asks whether the string is empty, not what it says.',
      'The || operator falls through for every falsy value, and 0 is falsy.'
    ],
    correctIndex: 0,
    explanation:
      'Environment variables always arrive as text, so the non-empty string "false" is truthy and Boolean(env.ENABLE_CACHE) is true; a flag has to be compared against the text instead. Number("0") is 0, which is falsy, so || silently replaces a deliberate zero with the default of 30.',
    xpReward: 40,
    tags: ['environment-config', 'coercion', 'twelve-factor']
  },
  {
    id: 'stage-10-a03',
    stageId: 'stage-10',
    title: 'Reading a deployment from its traffic weights',
    type: 'quiz',
    difficulty: 'easy',
    language: 'bash',
    prompt: 'Which deployment strategy does this router script implement?',
    codeSnippet:
      '# each line is applied, then metrics are watched for 10 minutes\n' +
      'set-weight v1.8.0=99 v1.9.0=1\n' +
      'set-weight v1.8.0=90 v1.9.0=10\n' +
      'set-weight v1.8.0=50 v1.9.0=50\n' +
      'set-weight v1.8.0=0  v1.9.0=100',
    options: [
      'Blue-green: two complete environments exist and traffic is cut over in one step',
      'Canary: a small slice of live traffic reaches the new version first and grows only while the metrics stay healthy',
      'Rolling: instances are replaced a batch at a time and every healthy instance serves an equal share',
      'Recreate: the old version is stopped, then the new version is started'
    ],
    correctIndex: 1,
    hints: [
      'Look at how much production traffic the new version gets in the first step.',
      'Two of these strategies never split live traffic between versions on purpose.'
    ],
    explanation:
      'Sending a deliberately small percentage of real traffic to the new version, then widening it only while the error rate holds, is a canary. Blue-green flips all traffic in one step, which is fast to reverse but exposes everyone at once, and rolling swaps instances batch by batch without weighting versions against each other.',
    xpReward: 40,
    tags: ['canary', 'blue-green', 'rolling', 'deployment']
  },
  {
    id: 'stage-10-a04',
    stageId: 'stage-10',
    title: 'Secrets that reached the repository',
    type: 'multi_select',
    difficulty: 'medium',
    language: 'bash',
    prompt:
      'A new service keeps its configuration like this. Which statements about environment configuration and secrets are true? Select every one that applies.',
    codeSnippet:
      '.env            # DATABASE_URL, STRIPE_SECRET_KEY (real values)\n' +
      '.env.example    # DATABASE_URL=, STRIPE_SECRET_KEY=\n' +
      '.gitignore      # node_modules/\n' +
      'src/config.js   # reads process.env at startup',
    options: [
      '.env belongs in .gitignore; only .env.example, holding empty placeholders, is committed',
      'Deleting a leaked key in a later commit is enough, because the file is gone from the default branch',
      'A key that reached a shared repository must be rotated, since it survives in history and in every clone',
      'Prefixing a variable so the bundler exposes it to the browser also keeps its value hidden from users',
      'Per-environment values such as DATABASE_URL should be injected by the environment, not hard-coded per branch',
      'Secrets are safe to commit as long as the repository is private'
    ],
    correctIndices: [0, 2, 4],
    hints: [
      'Ask what a git clone taken yesterday still contains.',
      'Anything the bundler puts into browser code is downloaded by every visitor.'
    ],
    explanation:
      'Git keeps the old blob no matter what a later commit does, and every clone, fork and CI cache already has it, so the only real remedy for a leaked credential is rotating it. Values that differ per environment belong in the environment, which is what lets one build artifact run in staging and production unchanged.',
    xpReward: 70,
    tags: ['secrets', 'environment-config', 'git']
  },
  {
    id: 'stage-10-a05',
    stageId: 'stage-10',
    title: 'Complete the delivery script',
    type: 'fill_blank',
    difficulty: 'easy',
    language: 'bash',
    prompt: 'Fill in the blanks so this pipeline builds reproducibly and only ships from main.',
    codeSnippet:
      '#!/bin/sh\n' +
      'set -e\n' +
      '# install exactly the versions the lockfile pins\n' +
      'npm ___\n' +
      'npm run lint\n' +
      'npm test\n' +
      'npm run build\n' +
      '# only the trunk build is allowed to reach customers\n' +
      'if [ "$BRANCH" = "main" ]; then\n' +
      '  npm run ___ -- --tag "$GIT_SHA"\n' +
      'fi',
    blanks: [
      { answer: 'ci', choices: ['ci', 'install', 'update'] },
      { answer: 'deploy', choices: ['deploy', 'lint', 'test'] }
    ],
    hints: [
      'One npm subcommand refuses to run at all when the lockfile and package.json disagree.',
      'The branch guard wraps the one step that customers can see.'
    ],
    explanation:
      'npm ci installs exactly the tree recorded in package-lock.json and fails if the lockfile is out of sync, so the same commit always produces the same dependency tree; npm install may resolve newer versions and rewrite the lockfile, which makes CI results unreproducible. Every branch runs lint, test and build, but only main is allowed to run the deploy step.',
    xpReward: 40,
    tags: ['ci-cd', 'reproducible-builds', 'branching']
  },
  {
    id: 'stage-10-a06',
    stageId: 'stage-10',
    title: 'Expand before you contract',
    type: 'fill_blank',
    difficulty: 'medium',
    language: 'sql',
    prompt:
      'This migration renames users.email to users.contact_email without downtime. Fill in the blanks.',
    codeSnippet:
      '-- Step 1 runs while the old release still writes to email.\n' +
      'ALTER TABLE users ADD COLUMN contact_email TEXT;\n' +
      'UPDATE users SET contact_email = ___\n' +
      '  WHERE contact_email IS NULL;\n' +
      '\n' +
      '-- Step 2: ship code that writes both columns and reads the new one.\n' +
      '\n' +
      '-- Step 3, in a LATER release, once nothing reads the old column:\n' +
      'ALTER TABLE users ___ COLUMN email;',
    blanks: [
      { answer: 'email', choices: ['email', 'contact_email', 'NULL'] },
      { answer: 'DROP', choices: ['DROP', 'RENAME', 'ADD'] }
    ],
    hints: [
      'The backfill has to copy the values that already exist somewhere.',
      'Step 3 is the contract half of expand/contract, and it deletes something.'
    ],
    explanation:
      'Expand/contract keeps the schema readable by both the old and the new release at every moment: add the nullable column, backfill it from the old one, deploy code that writes both, and only remove the old column in a later release. A rename done in one migration breaks whichever release is still running the instant it lands, and leaves nothing to roll back to.',
    xpReward: 70,
    tags: ['migrations', 'zero-downtime', 'sql']
  },
  {
    id: 'stage-10-a07',
    stageId: 'stage-10',
    title: 'Order the zero-downtime rename',
    type: 'pseudocode_order',
    difficulty: 'medium',
    language: 'pseudocode',
    prompt:
      'Put these steps in the order that renames a live column with no downtime and leaves every intermediate state safe to roll back.',
    pseudocodeLines: [
      'ADD the new nullable column in a migration of its own',
      'DEPLOY the release that writes both the old and the new column',
      'BACKFILL the new column for rows written before that release',
      'VERIFY that the new column agrees with the old one for every row',
      'DEPLOY the release that reads the new column and stops writing the old one',
      'DROP the old column in a migration of a later release'
    ],
    hints: [
      'Start with the change that no running code can notice.',
      'If the backfill ran before dual writes started, rows created during the backfill would be missed.'
    ],
    explanation:
      'Each step has to leave the deployed code and the schema compatible, so any single step can be undone on its own. Starting the dual write before the backfill means new rows are never missed, and the old column is dropped only once no released version still touches it.',
    xpReward: 70,
    tags: ['migrations', 'rollback', 'zero-downtime']
  },
  {
    id: 'stage-10-a08',
    stageId: 'stage-10',
    title: 'Sticky feature flag buckets',
    type: 'code_runner',
    difficulty: 'medium',
    language: 'javascript',
    prompt:
      'Return true when userId should see the feature. Apply the rules in order: if flag.enabled is false nobody sees it; otherwise anyone listed in flag.allowList sees it; otherwise bucket the user with (sum of the character codes of userId) % 100 and return true when that bucket is below flag.rollout.',
    starterCode:
      'function isEnabled(flag, userId) {\n' + '  // your code here\n' + '  return false;\n' + '}',
    entryFunction: 'isEnabled',
    testCases: [
      {
        input: '{"enabled": false, "rollout": 100, "allowList": ["z"]}, "z"',
        expected: 'false'
      },
      {
        input: '{"enabled": true, "rollout": 0, "allowList": ["z"]}, "z"',
        expected: 'true'
      },
      { input: '{"enabled": true, "rollout": 0, "allowList": []}, "z"', expected: 'false' },
      { input: '{"enabled": true, "rollout": 50, "allowList": []}, "z"', expected: 'true' },
      { input: '{"enabled": true, "rollout": 50, "allowList": []}, "a"', expected: 'false' },
      { input: '{"enabled": true, "rollout": 100, "allowList": []}, "a"', expected: 'true' }
    ],
    solutionCode:
      'function isEnabled(flag, userId) {\n' +
      '  if (!flag.enabled) return false;\n' +
      '  if (flag.allowList.includes(userId)) return true;\n' +
      '  let bucket = 0;\n' +
      '  for (let i = 0; i < userId.length; i++) {\n' +
      '    bucket = (bucket + userId.charCodeAt(i)) % 100;\n' +
      '  }\n' +
      '  return bucket < flag.rollout;\n' +
      '}',
    hints: [
      'Check the kill switch first, then the allow list, then the percentage.',
      'Derive the bucket from the id itself; a random number would move the same user in and out of the feature between requests.'
    ],
    explanation:
      'A flag check must be deterministic so a user stays in the same bucket on every request, otherwise the feature flickers on and off for them. The kill switch is tested first because turning a flag off is the fastest rollback available: it changes behaviour in seconds without building or deploying anything.',
    xpReward: 70,
    tags: ['feature-flags', 'rollout', 'rollback']
  },
  {
    id: 'stage-10-a09',
    stageId: 'stage-10',
    title: 'A canary that never rolls back',
    type: 'debug',
    difficulty: 'hard',
    language: 'javascript',
    prompt:
      'This function decides what to do with a canary. baseline and canary each look like {requests, errors}. It should return "hold" when the canary has fewer than 100 requests, "rollback" when the canary error rate is more than twice the baseline rate, "hold" when the canary rate is merely higher, and otherwise "promote". It currently promotes obviously broken releases. Fix it.',
    starterCode:
      'function canaryDecision(baseline, canary) {\n' +
      '  if (canary.requests < 100) return "hold";\n' +
      '  if (canary.errors > baseline.errors * 2) return "rollback";\n' +
      '  if (canary.errors > baseline.errors) return "hold";\n' +
      '  return "promote";\n' +
      '}',
    entryFunction: 'canaryDecision',
    testCases: [
      {
        input: '{"requests": 10000, "errors": 100}, {"requests": 500, "errors": 30}',
        expected: '"rollback"'
      },
      {
        input: '{"requests": 10000, "errors": 100}, {"requests": 1000, "errors": 10}',
        expected: '"promote"'
      },
      {
        input: '{"requests": 20000, "errors": 200}, {"requests": 2000, "errors": 30}',
        expected: '"hold"'
      },
      {
        input: '{"requests": 10000, "errors": 5}, {"requests": 40, "errors": 20}',
        expected: '"hold"'
      },
      {
        input: '{"requests": 100000, "errors": 50}, {"requests": 1000, "errors": 20}',
        expected: '"rollback"'
      }
    ],
    solutionCode:
      'function canaryDecision(baseline, canary) {\n' +
      '  if (canary.requests < 100) return "hold";\n' +
      '  const baseRate = baseline.errors / baseline.requests;\n' +
      '  const canaryRate = canary.errors / canary.requests;\n' +
      '  if (canaryRate > baseRate * 2) return "rollback";\n' +
      '  if (canaryRate > baseRate) return "hold";\n' +
      '  return "promote";\n' +
      '}',
    hints: [
      'The canary serves a fraction of the traffic, so compare like with like.',
      'Divide each error count by its own request count before comparing them.'
    ],
    explanation:
      'The canary takes a small slice of traffic, so its raw error count is almost always lower than the baseline count no matter how broken it is, and a comparison of counts promotes every release. Comparing errors per request normalises for traffic volume, and the request-count floor stops the pipeline from judging a rate computed from a handful of calls.',
    xpReward: 110,
    tags: ['canary', 'rollback', 'metrics', 'debugging']
  },
  {
    id: 'stage-10-a10',
    stageId: 'stage-10',
    title: 'Fail loudly at startup',
    type: 'code_runner',
    difficulty: 'hard',
    language: 'javascript',
    prompt:
      'Resolve service configuration. Start from a copy of defaults, then apply env: skip any env value that is the empty string, store Number(value) when the default for that key is a number, store value === "true" when the default is a boolean, and keep the string otherwise. Return {config, missing}, where missing lists the required keys with no value, sorted alphabetically.',
    starterCode:
      'function resolveConfig(defaults, env, required) {\n' +
      '  // your code here\n' +
      '  return { config: {}, missing: [] };\n' +
      '}',
    entryFunction: 'resolveConfig',
    testCases: [
      {
        input: '{"port": 3000, "debug": false}, {"port": "8080"}, []',
        expected: '{"config": {"port": 8080, "debug": false}, "missing": []}'
      },
      {
        input: '{"port": 3000, "debug": false}, {"port": "", "debug": "true"}, []',
        expected: '{"config": {"port": 3000, "debug": true}, "missing": []}'
      },
      {
        input: '{"port": 3000}, {"apiKey": "sk_live_1"}, ["apiKey", "dbUrl"]',
        expected: '{"config": {"port": 3000, "apiKey": "sk_live_1"}, "missing": ["dbUrl"]}'
      },
      {
        input: '{}, {"dbUrl": "", "logLevel": "info"}, ["dbUrl", "apiKey"]',
        expected: '{"config": {"logLevel": "info"}, "missing": ["apiKey", "dbUrl"]}'
      },
      {
        input: '{"debug": true}, {"debug": "false"}, ["debug"]',
        expected: '{"config": {"debug": false}, "missing": []}'
      }
    ],
    solutionCode:
      'function resolveConfig(defaults, env, required) {\n' +
      '  const config = { ...defaults };\n' +
      '  for (const key of Object.keys(env)) {\n' +
      '    const raw = env[key];\n' +
      '    if (typeof raw !== "string" || raw === "") continue;\n' +
      '    if (typeof defaults[key] === "number") config[key] = Number(raw);\n' +
      '    else if (typeof defaults[key] === "boolean") config[key] = raw === "true";\n' +
      '    else config[key] = raw;\n' +
      '  }\n' +
      '  const missing = required\n' +
      '    .filter(key => config[key] === undefined)\n' +
      '    .sort();\n' +
      '  return { config: config, missing: missing };\n' +
      '}',
    hints: [
      'An unset variable and one set to the empty string should both fall back to the default.',
      'Look at the type of the default value to decide how to parse the incoming string.'
    ],
    explanation:
      'Environment variables are untyped text, so a config loader has to declare what each key means before the app reads it, or PORT arrives as "8080" and a disabled flag arrives as the truthy string "false". Collecting the missing required keys and refusing to boot turns an absent secret into an obvious startup failure instead of a null reference in production hours later.',
    xpReward: 110,
    tags: ['environment-config', 'secrets', 'validation']
  }
];
