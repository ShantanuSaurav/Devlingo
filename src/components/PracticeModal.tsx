import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { Challenge, ExecutionResult } from '../types';
import { Answer, checkAnswer, emptyAnswer, isAnswerComplete } from '../lib/checkAnswer';
import { CodeBlock } from './CodeBlock';
import { OptionsChallenge } from './challenges/OptionsChallenge';
import { FillBlankChallenge } from './challenges/FillBlankChallenge';
import { PseudocodeOrderChallenge } from './challenges/PseudocodeOrderChallenge';
import { CodeChallenge } from './challenges/CodeChallenge';

const TYPE_LABELS: Record<Challenge['type'], string> = {
  quiz: 'Multiple choice',
  output_prediction: 'Predict the output',
  multi_select: 'Select all that apply',
  fill_blank: 'Fill in the blanks',
  pseudocode_order: 'Order the steps',
  code_runner: 'Write the code',
  debug: 'Find the bug'
};

const isCodeType = (c: Challenge) => c.type === 'code_runner' || c.type === 'debug';

export const PracticeModal: React.FC = () => {
  const {
    activeStage,
    activeChallengeIndex,
    closePractice,
    goToChallenge,
    completeChallenge,
    executeCode,
    stats
  } = useGame();

  const challenges = activeStage?.challenges ?? [];
  const challenge: Challenge | undefined = challenges[activeChallengeIndex];

  /* ------------------------------------------------------------ per-challenge state */
  const [answer, setAnswer] = useState<Answer>(null);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [revealedHints, setRevealedHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [execResult, setExecResult] = useState<ExecutionResult | null>(null);

  const [finished, setFinished] = useState(false);
  const [sessionXp, setSessionXp] = useState(0);
  const [sessionSolved, setSessionSolved] = useState<string[]>([]);

  const dialogRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  /** Wipe everything that belongs to a single challenge. */
  const resetForChallenge = useCallback((next: Challenge | undefined) => {
    setAnswer(next ? emptyAnswer(next) : null);
    setChecked(false);
    setIsCorrect(false);
    setAttempts(0);
    setRevealedHints(0);
    setShowSolution(false);
    setExecResult(null);
    setIsRunning(false);
    setProgressMessage('');
    setCode(next && isCodeType(next) ? next.starterCode ?? '' : '');
  }, []);

  // Keyed on the id, not the object: a new stage array must not wipe answers.
  const challengeId = challenge?.id;
  useEffect(() => {
    resetForChallenge(challenge);
    bodyRef.current?.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challengeId, resetForChallenge]);

  // A fresh stage starts a fresh session summary.
  const stageId = activeStage?.id;
  useEffect(() => {
    setFinished(false);
    setSessionXp(0);
    setSessionSolved([]);
  }, [stageId]);

  /* ------------------------------------------------------------------ actions */

  const advance = useCallback(() => {
    if (activeChallengeIndex + 1 < challenges.length) goToChallenge(activeChallengeIndex + 1);
    else setFinished(true);
  }, [activeChallengeIndex, challenges.length, goToChallenge]);

  const award = useCallback(
    async (target: Challenge, usedAttempts: number) => {
      const xp = await completeChallenge(target, { attempts: usedAttempts, hintsUsed: revealedHints });
      setSessionXp((prev) => prev + xp);
      setSessionSolved((prev) => (prev.includes(target.id) ? prev : [...prev, target.id]));
    },
    [completeChallenge, revealedHints]
  );

  const handleCheck = useCallback(async () => {
    if (!challenge || checked) return;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    const correct = checkAnswer(challenge, answer);
    setIsCorrect(correct);
    setChecked(true);
    if (correct) await award(challenge, nextAttempts);
  }, [challenge, checked, attempts, answer, award]);

  const handleRun = useCallback(async () => {
    if (!challenge || isRunning) return;
    setIsRunning(true);
    setProgressMessage('');
    setExecResult(null);

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    try {
      const result = await executeCode(
        code,
        challenge.language,
        challenge.entryFunction,
        challenge.testCases ?? [],
        { onProgress: setProgressMessage }
      );
      setExecResult(result);
      const passed = result.status === 'passed';
      setIsCorrect(passed);
      setChecked(true);
      if (passed) await award(challenge, nextAttempts);
    } catch (err: any) {
      setExecResult({
        status: 'error',
        stderr: err?.message ?? String(err),
        testResults: []
      });
      setChecked(true);
      setIsCorrect(false);
    } finally {
      setIsRunning(false);
      setProgressMessage('');
    }
  }, [challenge, isRunning, attempts, code, executeCode, award]);

  /**
   * Changing an answer after a wrong check clears the red highlighting, so the
   * feedback on screen always describes the answer currently selected.
   */
  const handleAnswer = useCallback(
    (next: Answer) => {
      setAnswer(next);
      if (checked && !isCorrect) {
        setChecked(false);
      }
    },
    [checked, isCorrect]
  );

  const handleTryAgain = useCallback(() => {
    setChecked(false);
    setIsCorrect(false);
    // Keep what they typed for code and blanks; clear a wrong single choice so
    // the highlighted answer does not linger.
    if (challenge && (challenge.type === 'quiz' || challenge.type === 'output_prediction')) {
      setAnswer(null);
    }
  }, [challenge]);

  const restartStage = useCallback(() => {
    setFinished(false);
    setSessionXp(0);
    setSessionSolved([]);
    goToChallenge(0);
  }, [goToChallenge]);

  /* -------------------------------------------------------------- keyboard */

  useEffect(() => {
    if (!activeStage) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT');

      if (e.key === 'Escape') {
        closePractice();
        return;
      }

      if (typing) return;

      // Number keys pick an option on choice-style challenges.
      if (!checked && challenge && !isCodeType(challenge) && /^[1-9]$/.test(e.key)) {
        const index = Number(e.key) - 1;
        if (challenge.options && index < challenge.options.length) {
          e.preventDefault();
          if (challenge.type === 'multi_select') {
            const current = new Set((answer as number[]) ?? []);
            if (current.has(index)) current.delete(index);
            else current.add(index);
            setAnswer([...current].sort((a, b) => a - b));
          } else {
            setAnswer(index);
          }
        }
        return;
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (finished) return;
        if (checked && isCorrect) advance();
        else if (checked) handleTryAgain();
        else if (challenge && isCodeType(challenge)) handleRun();
        else if (challenge && isAnswerComplete(challenge, answer)) handleCheck();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    activeStage,
    challenge,
    answer,
    checked,
    isCorrect,
    finished,
    closePractice,
    advance,
    handleCheck,
    handleRun,
    handleTryAgain
  ]);

  // Focus the dialog so screen readers announce it and Escape works at once.
  useEffect(() => {
    if (activeStage) dialogRef.current?.focus();
  }, [activeStage]);

  /* ----------------------------------------------------------------- render */

  const solvedInStage = useMemo(
    () => challenges.filter((c) => stats.completedChallenges.includes(c.id)).length,
    [challenges, stats.completedChallenges]
  );

  if (!activeStage || !challenge) return null;

  const hints = challenge.hints ?? [];
  const canCheck = isAnswerComplete(challenge, answer);
  const alreadySolved = stats.completedChallenges.includes(challenge.id);
  const percent = Math.round(((activeChallengeIndex + (checked && isCorrect ? 1 : 0)) / challenges.length) * 100);

  return (
    <div className="modal-overlay" onMouseDown={closePractice}>
      <div
        className={`modal-card practice-card ${isCodeType(challenge) ? 'is-wide' : ''}`.trim()}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${activeStage.name}: ${challenge.title}`}
        ref={dialogRef}
        tabIndex={-1}
      >
        {/* ------------------------------------------------------------ head */}
        <div className="modal-header">
          <div className="modal-header-main">
            <div className="modal-stage-badge">
              <span aria-hidden="true">{activeStage.icon}</span> Stage {activeStage.index} ·{' '}
              {activeStage.name}
            </div>
            <h3 className="modal-title">{finished ? 'Stage complete' : challenge.title}</h3>
            {!finished && (
              <div className="modal-meta">
                <span className={`pill pill-${challenge.difficulty}`}>{challenge.difficulty}</span>
                <span className="pill pill-type">{TYPE_LABELS[challenge.type]}</span>
                <span className="pill pill-lang">{challenge.language}</span>
                {alreadySolved && <span className="pill pill-done">solved before</span>}
              </div>
            )}
          </div>
          <button type="button" className="modal-close-btn" onClick={closePractice} aria-label="Close">
            ×
          </button>
        </div>

        {/* -------------------------------------------------------- progress */}
        <div className="modal-progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
          <div className="modal-progress-bar" style={{ width: `${percent}%` }} />
        </div>

        {!finished && (
          <nav className="challenge-dots" aria-label="Challenges in this stage">
            {challenges.map((c, i) => {
              const done = stats.completedChallenges.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`dot ${i === activeChallengeIndex ? 'is-active' : ''} ${done ? 'is-done' : ''}`.trim()}
                  onClick={() => goToChallenge(i)}
                  title={`${i + 1}. ${c.title}${done ? ' (solved)' : ''}`}
                  aria-label={`Go to challenge ${i + 1}: ${c.title}`}
                  aria-current={i === activeChallengeIndex}
                />
              );
            })}
          </nav>
        )}

        {/* ------------------------------------------------------------ body */}
        <div className="modal-body" ref={bodyRef}>
          {finished ? (
            <div className="celebration-view">
              <div className="celebration-icon" aria-hidden="true">
                🏆
              </div>
              <h2 className="celebration-title">{activeStage.name} cleared</h2>
              <p>
                You solved {sessionSolved.length} of {challenges.length} challenges this session.
              </p>

              <div className="celebration-stats">
                <div className="celebration-stat-box">
                  <strong>+{sessionXp}</strong>
                  <span>XP earned</span>
                </div>
                <div className="celebration-stat-box">
                  <strong>
                    {solvedInStage}/{challenges.length}
                  </strong>
                  <span>Stage solved</span>
                </div>
                <div className="celebration-stat-box">
                  <strong>{stats.streak}</strong>
                  <span>Day streak</span>
                </div>
              </div>

              <div className="celebration-actions">
                <button type="button" className="btn btn-line btn-lg" onClick={restartStage}>
                  Replay stage
                </button>
                <button type="button" className="btn btn-solid btn-lg" onClick={closePractice}>
                  Back to the path
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="challenge-prompt">{challenge.prompt}</p>

              {/* The snippet, always in full. fill_blank renders its own copy
                  because the inputs live inside it. */}
              {challenge.codeSnippet && challenge.type !== 'fill_blank' && (
                <CodeBlock code={challenge.codeSnippet} language={challenge.language} />
              )}

              {challenge.type === 'fill_blank' && (
                <FillBlankChallenge
                  challenge={challenge}
                  answer={answer}
                  onAnswer={handleAnswer}
                  checked={checked}
                  locked={checked && isCorrect}
                />
              )}

              {challenge.type === 'pseudocode_order' && (
                <PseudocodeOrderChallenge
                  challenge={challenge}
                  answer={answer}
                  onAnswer={handleAnswer}
                  checked={checked}
                  locked={checked && isCorrect}
                />
              )}

              {(challenge.type === 'quiz' ||
                challenge.type === 'output_prediction' ||
                challenge.type === 'multi_select') && (
                <OptionsChallenge
                  challenge={challenge}
                  answer={answer}
                  onAnswer={handleAnswer}
                  checked={checked}
                  locked={checked && isCorrect}
                />
              )}

              {isCodeType(challenge) && (
                <CodeChallenge
                  challenge={challenge}
                  code={code}
                  onCodeChange={setCode}
                  onRun={handleRun}
                  isRunning={isRunning}
                  progressMessage={progressMessage}
                  result={execResult}
                  locked={checked && isCorrect}
                  showSolution={showSolution}
                  onReset={() => {
                    setCode(challenge.starterCode ?? '');
                    setExecResult(null);
                  }}
                />
              )}

              {/* ------------------------------------------------------ hints */}
              {hints.length > 0 && (
                <div className="hint-area">
                  {hints.slice(0, revealedHints).map((hint, i) => (
                    <div className="hint-card" key={i}>
                      <span className="hint-index">Hint {i + 1}</span>
                      <span>{hint}</span>
                    </div>
                  ))}
                  {revealedHints < hints.length && !(checked && isCorrect) && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setRevealedHints((n) => n + 1)}
                    >
                      Show a hint ({hints.length - revealedHints} left) · costs 10% of the XP
                    </button>
                  )}
                </div>
              )}

              {/* --------------------------------------------------- feedback */}
              {checked && (
                <div className={`feedback-banner ${isCorrect ? 'correct' : 'incorrect'}`} role="status">
                  <span className="feedback-icon" aria-hidden="true">
                    {isCorrect ? '✓' : '✗'}
                  </span>
                  <div>
                    <strong>
                      {isCorrect
                        ? attempts === 1 && revealedHints === 0
                          ? 'Correct, first try.'
                          : 'Correct.'
                        : 'Not quite.'}
                    </strong>{' '}
                    <span>{isCorrect || attempts >= 2 ? challenge.explanation : 'Have another look.'}</span>
                  </div>
                </div>
              )}

              {/* Only offered once they have genuinely tried. */}
              {isCodeType(challenge) && !isCorrect && attempts >= 2 && challenge.solutionCode && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowSolution((s) => !s)}
                >
                  {showSolution ? 'Hide the solution' : 'Show me the solution'}
                </button>
              )}
            </>
          )}
        </div>

        {/* ---------------------------------------------------------- footer */}
        {!finished && (
          <div className="modal-footer">
            <div className="footer-left">
              <span className="challenge-xp-reward">+{challenge.xpReward} XP</span>
              <span className="footer-count">
                {activeChallengeIndex + 1} of {challenges.length}
              </span>
            </div>

            <div className="footer-actions">
              {activeChallengeIndex > 0 && (
                <button
                  type="button"
                  className="btn btn-line"
                  onClick={() => goToChallenge(activeChallengeIndex - 1)}
                >
                  Back
                </button>
              )}

              {checked && isCorrect ? (
                <button type="button" className="btn btn-solid" onClick={advance}>
                  {activeChallengeIndex + 1 < challenges.length ? 'Next challenge →' : 'Finish stage →'}
                </button>
              ) : checked ? (
                <>
                  <button type="button" className="btn btn-line" onClick={advance}>
                    Skip
                  </button>
                  <button type="button" className="btn btn-solid" onClick={handleTryAgain}>
                    Try again
                  </button>
                </>
              ) : isCodeType(challenge) ? (
                <button type="button" className="btn btn-solid" disabled={isRunning} onClick={handleRun}>
                  {isRunning ? 'Running…' : 'Run tests'}
                </button>
              ) : (
                <button type="button" className="btn btn-solid" disabled={!canCheck} onClick={handleCheck}>
                  Check answer
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
