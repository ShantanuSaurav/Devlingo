/**
 * CodeQuest API server.
 *
 * Runs entirely on a laptop: `npm run dev` starts this alongside Vite. No
 * database service, no cloud account, no native modules. It owns
 *   - accounts (bcrypt + JWT),
 *   - progress, XP, levels, streaks and the leaderboard,
 *   - authoritative grading of quiz answers,
 *   - real sandboxed JavaScript execution in a child process.
 */
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

import * as store from './db.js';
import { loadContent, getChallenge, contentSnapshot } from './content.js';
import { compileTsModule } from './build.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
// Deliberately not `PORT`: dev harnesses set that for the *web* server, and the
// API silently fighting Vite for port 3000 is a miserable thing to debug.
const PORT = Number(process.env.API_PORT || 4000);
const TOKEN_TTL = '30d';

/* ------------------------------------------------------------ bootstrapping */

let grading;
let leveling;
let gradingPath;

async function bootstrap() {
  await store.load();

  gradingPath = await compileTsModule(path.join(ROOT, 'src', 'lib', 'grading.ts'), 'grading.mjs');
  const levelingPath = await compileTsModule(path.join(ROOT, 'src', 'lib', 'leveling.ts'), 'leveling.mjs');
  grading = await import(pathToFileURL(gradingPath).href);
  leveling = await import(pathToFileURL(levelingPath).href);

  await loadContent();
}

/** A stable secret so tokens survive a restart, without shipping one in git. */
async function getSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  const file = path.join(HERE, 'data', '.jwt-secret');
  if (existsSync(file)) return (await readFile(file, 'utf8')).trim();
  const generated = crypto.randomBytes(48).toString('hex');
  await writeFile(file, generated, 'utf8');
  console.log('[auth] generated a new JWT secret at server/data/.jwt-secret');
  return generated;
}

let SECRET;

/* -------------------------------------------------------------------- app */

const app = express();
app.use(cors());
app.use(express.json({ limit: '256kb' }));

const asyncRoute = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    isPremium: Boolean(user.isPremium),
    provider: 'local'
  };
}

function sign(user) {
  return jwt.sign({ sub: user.id }, SECRET, { expiresIn: TOKEN_TTL });
}

function readToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

/** Attaches req.user when a valid token is present; never rejects. */
function optionalAuth(req, _res, next) {
  const token = readToken(req);
  if (token) {
    try {
      const { sub } = jwt.verify(token, SECRET);
      req.user = store.findUserById(sub) || null;
    } catch {
      req.user = null;
    }
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Sign in to continue.' });
  next();
}

app.use(optionalAuth);

/* ------------------------------------------------------------------ health */

app.get('/api/health', (_req, res) => {
  const snapshot = contentSnapshot();
  res.json({
    ok: true,
    challenges: snapshot?.challenges.length ?? 0,
    stages: snapshot?.stages.length ?? 0,
    users: store.db().users.length,
    uptimeSeconds: Math.round(process.uptime())
  });
});

/* -------------------------------------------------------------------- auth */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.post(
  '/api/auth/register',
  asyncRoute(async (req, res) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const username = String(req.body?.username ?? '').trim();
    const password = String(req.body?.password ?? '');

    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'That email address does not look right.' });
    if (username.length < 2 || username.length > 24) {
      return res.status(400).json({ error: 'Username must be between 2 and 24 characters.' });
    }
    if (!/^[a-zA-Z0-9_. -]+$/.test(username)) {
      return res.status(400).json({ error: 'Username can only contain letters, numbers, spaces, dots, dashes and underscores.' });
    }
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });

    if (store.findUserByEmail(email)) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }
    if (store.findUserByUsername(username)) {
      return res.status(409).json({ error: 'That username is taken.' });
    }

    const user = store.insertUser({
      id: crypto.randomUUID(),
      email,
      username,
      passwordHash: await bcrypt.hash(password, 10),
      isPremium: false,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ token: sign(user), user: publicUser(user), progress: store.getProgress(user.id) });
  })
);

app.post(
  '/api/auth/login',
  asyncRoute(async (req, res) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');
    const user = store.findUserByEmail(email);

    // Same response either way so the endpoint cannot be used to enumerate accounts.
    const ok = user && (await bcrypt.compare(password, user.passwordHash));
    if (!ok) return res.status(401).json({ error: 'Email or password is incorrect.' });

    res.json({ token: sign(user), user: publicUser(user), progress: store.getProgress(user.id) });
  })
);

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user), progress: store.getProgress(req.user.id) });
});

/* ----------------------------------------------------------------- content */

app.get(
  '/api/content',
  asyncRoute(async (_req, res) => {
    const snapshot = await loadContent();
    res.json({ stages: snapshot.stages, challenges: snapshot.challenges, builtAt: snapshot.builtAt });
  })
);

/* ---------------------------------------------------------------- progress */

function recalc(progress) {
  const today = leveling.dayKey();
  return {
    ...progress,
    level: leveling.levelFromXp(progress.xp),
    streak: leveling.currentStreak(progress.streak, progress.lastActiveDay, today)
  };
}

app.get('/api/progress', requireAuth, (req, res) => {
  res.json({ progress: recalc(store.getProgress(req.user.id)) });
});

/**
 * Record a solve. The server owns the XP maths: the client says *which*
 * challenge and how much help it took, never how much XP it earned.
 */
app.post(
  '/api/progress/solve',
  requireAuth,
  asyncRoute(async (req, res) => {
    const challengeId = String(req.body?.challengeId ?? '');
    const attempts = Math.max(1, Math.min(50, Number(req.body?.attempts ?? 1) || 1));
    const hintsUsed = Math.max(0, Math.min(10, Number(req.body?.hintsUsed ?? 0) || 0));

    const challenge = getChallenge(challengeId);
    if (!challenge) return res.status(404).json({ error: 'Unknown challenge.' });

    const progress = store.getProgress(req.user.id);
    const today = leveling.dayKey();
    const previous = progress.attempts[challengeId];
    const score = leveling.scoreSolve(attempts, hintsUsed);

    // Re-solving is allowed and keeps your best score, but only pays XP once.
    const firstSolve = !progress.completedChallenges.includes(challengeId);
    const awarded = firstSolve ? leveling.xpForSolve(challenge.xpReward, attempts, hintsUsed) : 0;

    const next = {
      ...progress,
      xp: progress.xp + awarded,
      completedChallenges: firstSolve
        ? [...progress.completedChallenges, challengeId]
        : progress.completedChallenges,
      attempts: {
        ...progress.attempts,
        [challengeId]: {
          challengeId,
          score: Math.max(previous?.score ?? 0, score),
          attempts: (previous?.attempts ?? 0) + attempts,
          hintsUsed: (previous?.hintsUsed ?? 0) + hintsUsed,
          solvedAt: new Date().toISOString()
        }
      },
      streak: leveling.nextStreak(progress.streak, progress.lastActiveDay, today),
      lastActiveDay: today
    };
    next.bestStreak = Math.max(progress.bestStreak ?? 0, next.streak);
    next.level = leveling.levelFromXp(next.xp);

    // A stage is complete once every one of its challenges is.
    const snapshot = contentSnapshot();
    const stageIds = new Set(next.completedStages);
    for (const stage of snapshot.stages) {
      const inStage = snapshot.challenges.filter((c) => c.stageId === stage.id);
      if (inStage.length && inStage.every((c) => next.completedChallenges.includes(c.id))) {
        stageIds.add(stage.id);
      }
    }
    next.completedStages = [...stageIds];

    store.setProgress(req.user.id, next);
    res.json({ progress: next, awardedXp: awarded, score, firstSolve });
  })
);

/** Merge a guest's local progress into the account they just signed into. */
app.post('/api/progress/merge', requireAuth, (req, res) => {
  const incoming = req.body?.progress ?? {};
  const current = store.getProgress(req.user.id);

  const merged = {
    ...current,
    xp: Math.max(current.xp, Number(incoming.xp) || 0),
    bestStreak: Math.max(current.bestStreak ?? 0, Number(incoming.bestStreak) || 0),
    streak: Math.max(current.streak ?? 0, Number(incoming.streak) || 0),
    lastActiveDay: [current.lastActiveDay, incoming.lastActiveDay].filter(Boolean).sort().pop() ?? null,
    completedChallenges: [
      ...new Set([...(current.completedChallenges ?? []), ...(incoming.completedChallenges ?? [])])
    ],
    completedStages: [...new Set([...(current.completedStages ?? []), ...(incoming.completedStages ?? [])])],
    attempts: { ...(incoming.attempts ?? {}), ...(current.attempts ?? {}) }
  };
  merged.level = leveling.levelFromXp(merged.xp);

  store.setProgress(req.user.id, merged);
  res.json({ progress: merged });
});

app.post('/api/progress/reset', requireAuth, (req, res) => {
  const fresh = { ...store.EMPTY_PROGRESS, attempts: {}, completedChallenges: [], completedStages: [] };
  store.setProgress(req.user.id, fresh);
  res.json({ progress: fresh });
});

app.post('/api/account/pro', requireAuth, (req, res) => {
  // No payment processor is wired up locally; this is the honest local stand-in
  // for a successful checkout webhook.
  req.user.isPremium = true;
  store.persist();
  res.json({ user: publicUser(req.user) });
});

/* ------------------------------------------------------------- leaderboard */

app.get('/api/leaderboard', (_req, res) => {
  const all = store.allProgress();
  const rows = store
    .db()
    .users.map((u) => {
      const p = all[u.id] ?? store.EMPTY_PROGRESS;
      return {
        username: u.username,
        xp: p.xp ?? 0,
        level: leveling.levelFromXp(p.xp ?? 0),
        streak: leveling.currentStreak(p.streak ?? 0, p.lastActiveDay ?? null),
        solved: (p.completedChallenges ?? []).length
      };
    })
    .sort((a, b) => b.xp - a.xp || b.solved - a.solved)
    .slice(0, 50);
  res.json({ leaderboard: rows });
});

/* ------------------------------------------------------------------ grading */

/** Authoritative check for non-code challenges. */
app.post(
  '/api/grade',
  asyncRoute(async (req, res) => {
    const challenge = getChallenge(String(req.body?.challengeId ?? ''));
    if (!challenge) return res.status(404).json({ error: 'Unknown challenge.' });
    const answer = req.body?.answer;
    let correct = false;

    switch (challenge.type) {
      case 'quiz':
      case 'output_prediction':
        correct = Number(answer) === challenge.correctIndex;
        break;
      case 'multi_select':
        correct = Array.isArray(answer) && grading.sameSet(answer.map(Number), challenge.correctIndices ?? []);
        break;
      case 'fill_blank':
        correct =
          Array.isArray(answer) &&
          answer.length === (challenge.blanks ?? []).length &&
          (challenge.blanks ?? []).every((b, i) =>
            grading.checkBlank(String(answer[i] ?? ''), b.answer, b.alternatives ?? [])
          );
        break;
      case 'pseudocode_order':
        correct =
          Array.isArray(answer) &&
          answer.length === (challenge.pseudocodeLines ?? []).length &&
          answer.every((line, i) => String(line) === challenge.pseudocodeLines[i]);
        break;
      default:
        return res.status(400).json({ error: `${challenge.type} is graded by running its tests.` });
    }

    res.json({ correct, explanation: challenge.explanation });
  })
);

/* ---------------------------------------------------------------- execution */

const EXECUTION_TIMEOUT_MS = 8000;

function runJsInChild(payload) {
  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      ['--max-old-space-size=128', path.join(HERE, 'runner', 'js-runner.mjs')],
      { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true }
    );

    let out = '';
    let errOut = '';
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill('SIGKILL');
      resolve({
        status: 'error',
        stderr: `Execution timed out after ${EXECUTION_TIMEOUT_MS}ms. Check for an infinite loop.`,
        testResults: []
      });
    }, EXECUTION_TIMEOUT_MS);

    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (errOut += d));

    child.on('error', (e) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ status: 'error', stderr: `Could not start the sandbox: ${e.message}`, testResults: [] });
    });

    child.on('close', () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        resolve(JSON.parse(out));
      } catch {
        resolve({
          status: 'error',
          stderr: errOut.trim() || 'The sandbox produced no readable output.',
          testResults: []
        });
      }
    });

    child.stdin.end(JSON.stringify({ ...payload, gradingPath: pathToFileURL(gradingPath).href }));
  });
}

app.post(
  '/api/execute',
  asyncRoute(async (req, res) => {
    const language = String(req.body?.language ?? 'javascript');
    const code = String(req.body?.code ?? '');
    const entryFunction = req.body?.entryFunction ? String(req.body.entryFunction) : undefined;
    const testCases = Array.isArray(req.body?.testCases) ? req.body.testCases.slice(0, 25) : [];

    if (code.length > 100_000) return res.status(413).json({ error: 'Submission is too large.' });

    if (language !== 'javascript' && language !== 'typescript') {
      // Be honest rather than pretending to compile. The browser handles Python
      // through Pyodide; everything else genuinely has no local runtime here.
      return res.status(501).json({
        status: 'error',
        engine: 'none',
        stderr: `The local server can only run JavaScript. ${language} runs in the browser (Python) or needs a Judge0 endpoint.`,
        testResults: []
      });
    }

    const started = process.hrtime.bigint();
    const result = await runJsInChild({ code, entryFunction, testCases });
    const elapsed = Number(process.hrtime.bigint() - started) / 1e6;

    res.json({ ...result, engine: 'node-vm', time: `${elapsed.toFixed(0)}ms (Node sandbox)` });
  })
);

/* ------------------------------------------------- the built frontend (prod) */

// In dev, Vite serves the app and proxies /api here. After `npm run build` there
// is a dist/ to serve, which makes `npm start` a single self-contained process
// rather than an API with no app in front of it.
const DIST = path.join(ROOT, 'dist');

if (existsSync(DIST)) {
  app.use(express.static(DIST, { index: false, maxAge: '1h' }));

  // SPA fallback: any GET that is not an API call and not a real file gets
  // index.html, so deep links and refreshes work.
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(DIST, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
}

/* ------------------------------------------------------------------ errors */

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: `No route for ${req.method} ${req.path}` });
  }
  res
    .status(404)
    .type('text/plain')
    .send(
      existsSync(DIST)
        ? 'Not found.'
        : 'No built frontend here. Run `npm run dev` for development, or `npm run build` first.'
    );
});

app.use((err, _req, res, _next) => {
  console.error('[api] unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

/* ------------------------------------------------------------------- start */

bootstrap()
  .then(async () => {
    SECRET = await getSecret();

    // Build the server explicitly so the error handler is attached BEFORE the
    // bind is attempted. Passing a callback to app.listen() logs success from a
    // listener registered in the same tick as the failure path, which prints a
    // cheerful "listening on 4000" immediately above "port 4000 is in use".
    const server = http.createServer(app);

    server.on('listening', () => {
      const snapshot = contentSnapshot();
      const bound = server.address();
      const actual = typeof bound === 'object' && bound ? bound.port : PORT;
      console.log(`\n  CodeQuest API listening on http://localhost:${actual}`);
      console.log(`  ${snapshot.challenges.length} challenges - ${store.db().users.length} accounts`);
      if (existsSync(DIST)) console.log('  serving the built app from dist/');
      console.log('');
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(
          `\n  Port ${PORT} is already in use. Stop whatever is on it, or start the API on ` +
            `another port with API_PORT=4001 npm run dev:api (and set VITE_API_PROXY to match).\n`
        );
      } else {
        console.error('[api] server error:', err);
      }
      process.exit(1);
    });

    server.listen(PORT);
  })
  .catch((err) => {
    console.error('Failed to start the API server:', err);
    process.exit(1);
  });

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    await store.persistNow();
    process.exit(0);
  });
}
