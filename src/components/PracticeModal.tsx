import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Challenge, ExecutionResult } from '../types';

export const PracticeModal: React.FC = () => {
  const {
    activeChallengeStage,
    closePractice,
    completeChallenge,
    executeCode
  } = useGame();

  const [currentIndex, setCurrentIndex] = useState(0);
  // Quiz state
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Code Runner state
  const [userCode, setUserCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [execResult, setExecResult] = useState<ExecutionResult | null>(null);

  const challenges = activeChallengeStage?.challenges || [];
  const currentChallenge: Challenge | undefined = challenges[currentIndex];

  // Reset state whenever a stage is opened
  useEffect(() => {
    setCurrentIndex(0);
    setIsFinished(false);
    setSelectedIndex(null);
    setHasChecked(false);
    setIsCorrect(false);
    setExecResult(null);
  }, [activeChallengeStage]);

  // Reset challenge interaction state when switching between challenges inside the stage
  useEffect(() => {
    setSelectedIndex(null);
    setHasChecked(false);
    setIsCorrect(false);
    setExecResult(null);

    if (currentChallenge?.type === 'code_runner') {
      setUserCode(currentChallenge.starterCode || '');
    } else {
      setUserCode('');
    }
  }, [currentIndex, currentChallenge]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePractice();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closePractice]);

  if (!activeChallengeStage) return null;

  const progressPercent = challenges.length > 0 ? ((currentIndex + (isFinished ? 1 : 0)) / challenges.length) * 100 : 0;

  // Quiz check
  const handleCheckQuiz = () => {
    if (selectedIndex === null || !currentChallenge) return;

    const correct = selectedIndex === currentChallenge.correctIndex;
    setIsCorrect(correct);
    setHasChecked(true);

    if (correct) {
      completeChallenge(currentChallenge);
    }
  };

  // Code Runner execution
  const handleRunCode = async () => {
    if (!currentChallenge) return;
    setIsRunning(true);
    setExecResult(null);

    try {
      const res = await executeCode(
        userCode,
        currentChallenge.language || 'javascript',
        currentChallenge.entryFunction,
        currentChallenge.testCases || []
      );
      setExecResult(res);

      if (res.status === 'passed') {
        setIsCorrect(true);
        setHasChecked(true);
        completeChallenge(currentChallenge);
      } else {
        setIsCorrect(false);
        setHasChecked(true);
      }
    } catch (err: any) {
      setExecResult({
        status: 'error',
        stderr: err.message || 'Execution error'
      });
      setHasChecked(true);
      setIsCorrect(false);
    } finally {
      setIsRunning(false);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < challenges.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedIndex(null);
      setHasChecked(false);
      setIsCorrect(false);
      setExecResult(null);
    } else {
      setIsFinished(true);
    }
  };

  return (
    <div className="modal-overlay" onClick={closePractice}>
      <div className="modal-card" style={{ maxWidth: currentChallenge?.type === 'code_runner' ? '760px' : '680px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-stage-badge">
              Stage {activeChallengeStage.index} · {activeChallengeStage.name}
            </div>
            <h3 className="modal-title">
              {isFinished ? 'Stage Cleared!' : currentChallenge?.title}
            </h3>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={closePractice}
            aria-label="Close practice modal"
          >
            &times;
          </button>
        </div>

        {/* Progress bar */}
        <div className="modal-progress">
          <div
            className="modal-progress-bar"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Body */}
        <div className="modal-body">
          {isFinished ? (
            <div className="celebration-view">
              <div className="celebration-icon">🏆</div>
              <h2 className="celebration-title">Lesson Completed!</h2>
              <p style={{ maxWidth: '44ch' }}>
                You just leveled up your developer skills. Keep the daily streak alive!
              </p>

              <div className="celebration-stats">
                <div className="celebration-stat-box">
                  <strong>+{(challenges.reduce((sum, c) => sum + c.xpReward, 0))}</strong>
                  <span>Total XP</span>
                </div>
                <div className="celebration-stat-box">
                  <strong>100%</strong>
                  <span>Accuracy</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-line btn-lg"
                  onClick={() => {
                    setCurrentIndex(0);
                    setIsFinished(false);
                    setSelectedIndex(null);
                    setHasChecked(false);
                    setIsCorrect(false);
                    setExecResult(null);
                  }}
                >
                  Replay Stage ↻
                </button>
                <button
                  type="button"
                  className="btn btn-solid btn-lg"
                  onClick={closePractice}
                >
                  Back to Path
                </button>
              </div>
            </div>
          ) : (
            <>
              {currentChallenge && (
                <>
                  <p className="challenge-prompt">{currentChallenge.prompt}</p>

                  {/* Mode 1: Online Compiler Code Runner */}
                  {currentChallenge.type === 'code_runner' ? (
                    <div className="challenge-input-area">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-2)' }}>
                          Language: {currentChallenge.language || 'javascript'} (Compiler Sandbox)
                        </span>
                        {execResult?.time && (
                          <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--ink-faint)' }}>
                            Runtime: {execResult.time}
                          </span>
                        )}
                      </div>

                      <textarea
                        className="challenge-textarea"
                        value={userCode}
                        onChange={(e) => setUserCode(e.target.value)}
                        placeholder="// Write your code solution here..."
                        rows={9}
                        spellCheck={false}
                      />

                      {/* Test Cases display */}
                      {currentChallenge.testCases && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-label)', color: 'var(--ink-dim)' }}>
                            Test Assertions:
                          </span>
                          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                            {currentChallenge.testCases.map((tc, idx) => {
                              const tr = execResult?.testResults?.[idx];
                              const statusColor = tr ? (tr.passed ? 'var(--ok)' : 'var(--danger)') : 'var(--ink-faint)';
                              return (
                                <div
                                  key={idx}
                                  style={{
                                    background: 'var(--bg-raise)',
                                    border: `1px solid ${tr ? statusColor : 'var(--line)'}`,
                                    borderRadius: '4px',
                                    padding: '0.4rem 0.75rem',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.82rem'
                                  }}
                                >
                                  <span>Case {idx + 1}: </span>
                                  <code>{tc.input}</code> → <strong>{tc.expected}</strong>
                                  {tr && <span style={{ marginLeft: '6px', color: statusColor }}>{tr.passed ? '✓' : '✗'}</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Console stdout / stderr output */}
                      {execResult && (
                        <div style={{
                          background: 'var(--bg-raise)',
                          border: '1px solid var(--line)',
                          borderRadius: '4px',
                          padding: '0.75rem 1rem',
                          marginTop: '0.5rem',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.85rem'
                        }}>
                          {execResult.stderr ? (
                            <div style={{ color: 'var(--danger)', whiteSpace: 'pre-wrap' }}>
                              {execResult.stderr}
                            </div>
                          ) : (
                            <div style={{ color: 'var(--ok)' }}>
                              {execResult.stdout || '✓ All test cases executed successfully.'}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Mode 2: Quiz / Syntax Challenge */
                    <>
                      {currentChallenge.codeSnippet && (
                        <pre className="challenge-code-preview">
                          <code>{currentChallenge.codeSnippet}</code>
                        </pre>
                      )}

                      {currentChallenge.options && (
                        <div className="challenge-options">
                          {currentChallenge.options.map((option, idx) => {
                            let btnClass = 'option-btn';
                            if (selectedIndex === idx) btnClass += ' selected';
                            if (hasChecked) {
                              if (idx === currentChallenge.correctIndex) {
                                btnClass += ' correct';
                              } else if (selectedIndex === idx && !isCorrect) {
                                btnClass += ' incorrect';
                              }
                            }

                            const letter = String.fromCharCode(65 + idx);

                            return (
                              <button
                                key={idx}
                                type="button"
                                className={btnClass}
                                disabled={hasChecked && isCorrect}
                                onClick={() => {
                                  if (!hasChecked) {
                                    setSelectedIndex(idx);
                                  }
                                }}
                              >
                                <span className="option-letter">{letter}</span>
                                <span>{option}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}

                  {/* Feedback explanation banner */}
                  {hasChecked && (
                    <div className={`feedback-banner ${isCorrect ? 'correct' : 'incorrect'}`}>
                      <span className="feedback-icon">{isCorrect ? '✓' : '✗'}</span>
                      <div>
                        <strong>{isCorrect ? 'All Tests Passed! Excellent.' : 'Not quite yet.'}</strong>{' '}
                        <span>{currentChallenge.explanation}</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!isFinished && (
          <div className="modal-footer">
            <span className="challenge-xp-reward">
              ⚡ +{currentChallenge?.xpReward} XP
            </span>

            <div>
              {currentChallenge?.type === 'code_runner' ? (
                <div>
                  {!isCorrect ? (
                    <button
                      type="button"
                      className="btn btn-solid"
                      disabled={isRunning}
                      onClick={handleRunCode}
                    >
                      {isRunning ? 'Compiling in Sandbox...' : 'Run Code & Tests'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-solid"
                      onClick={handleNext}
                    >
                      {currentIndex + 1 < challenges.length ? 'Next Challenge →' : 'Complete Lesson →'}
                    </button>
                  )}
                </div>
              ) : (
                /* Quiz Footer */
                <div>
                  {!hasChecked ? (
                    <button
                      type="button"
                      className="btn btn-solid"
                      disabled={selectedIndex === null}
                      onClick={handleCheckQuiz}
                      style={{ opacity: selectedIndex === null ? 0.5 : 1 }}
                    >
                      Check Answer
                    </button>
                  ) : isCorrect ? (
                    <button
                      type="button"
                      className="btn btn-solid"
                      onClick={handleNext}
                    >
                      {currentIndex + 1 < challenges.length ? 'Next Challenge →' : 'Complete Lesson →'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-line"
                      onClick={() => {
                        setHasChecked(false);
                        setSelectedIndex(null);
                      }}
                    >
                      Try Again
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
