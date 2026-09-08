import React from 'react';
import { useGame } from '../context/GameContext';
import { stageProgress } from '../services/contentService';

export const LearningPath: React.FC = () => {
  const { stages, stats, openPractice, openSubModal } = useGame();

  return (
    <section className="journey" id="journey">
      <div className="section-head">
        <div>
          <h2 className="section-title">Your path, staged</h2>
          <p className="section-sub">Ten stages. Each one opens when the last is done.</p>
        </div>
      </div>

      <ol className="path-list">
        {stages.map((stage) => {
          const { done, total, percent } = stageProgress(stage, stats);
          const premiumLocked = Boolean(stage.isPremium) && !stats.isPremium;
          const openable = stage.state !== 'Locked' || premiumLocked;

          const rowClass =
            stage.state === 'Completed'
              ? 'path-done'
              : stage.state === 'In progress'
                ? 'path-current'
                : 'path-locked';

          const activate = () => {
            if (premiumLocked) openSubModal();
            else if (stage.state !== 'Locked') openPractice(stage.id);
          };

          return (
            <li
              key={stage.id}
              className={`path-row ${rowClass} ${openable ? 'interactive' : ''}`.trim()}
              onClick={activate}
              onKeyDown={(e) => {
                if (openable && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  activate();
                }
              }}
              tabIndex={openable ? 0 : -1}
              role={openable ? 'button' : undefined}
              aria-label={`Stage ${stage.index}, ${stage.name}, ${done} of ${total} solved`}
            >
              <span className="path-index" aria-hidden="true">
                {stage.index}
              </span>

              <span className="path-main">
                <span className="path-name">
                  <span className="path-icon" aria-hidden="true">
                    {stage.icon}
                  </span>
                  {stage.name}
                  {stage.isPremium && <span className="pill pill-pro">Pro</span>}
                </span>
                <span className="path-desc">{stage.description}</span>

                <span className="path-track" aria-hidden="true">
                  <span className="path-fill" style={{ width: `${percent}%` }} />
                </span>
              </span>

              <span className="path-stats">
                <span className="path-count">
                  {done}/{total}
                </span>
                <span className="path-state">{premiumLocked ? 'Pro only' : stage.state}</span>
              </span>

              {openable && (
                <button
                  type="button"
                  className="btn-solve"
                  onClick={(e) => {
                    e.stopPropagation();
                    activate();
                  }}
                >
                  {premiumLocked
                    ? 'Unlock →'
                    : stage.state === 'Completed'
                      ? 'Review ↻'
                      : done > 0
                        ? 'Continue →'
                        : 'Start →'}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
};
