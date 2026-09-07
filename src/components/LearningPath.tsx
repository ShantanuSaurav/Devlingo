import React from 'react';
import { useGame } from '../context/GameContext';

export const LearningPath: React.FC = () => {
  const { stages, openPractice } = useGame();

  const getRowClass = (state: string) => {
    switch (state) {
      case 'Completed':
        return 'path-done';
      case 'In progress':
        return 'path-current';
      case 'Locked':
      default:
        return 'path-locked';
    }
  };

  return (
    <section className="journey" id="journey">
      <div className="section-head">
        <h2 className="section-title">Your path, staged</h2>
        <p className="section-sub">Six stages. Each one unlocked by the last.</p>
      </div>

      <ol className="path-list">
        {stages.map((stage) => {
          const isInteractive = stage.state !== 'Locked';
          return (
            <li
              key={stage.id}
              className={`path-row ${getRowClass(stage.state)} ${isInteractive ? 'interactive' : ''}`}
              onClick={() => {
                if (isInteractive) openPractice(stage.id);
              }}
              title={isInteractive ? `Click to practice ${stage.name}` : 'Complete previous stages to unlock'}
            >
              <span className="path-index">{stage.index}</span>
              <span className="path-name">{stage.name}</span>
              <span className="path-state">{stage.state}</span>
              {isInteractive && (
                <button
                  type="button"
                  className="btn-solve"
                  onClick={(e) => {
                    e.stopPropagation();
                    openPractice(stage.id);
                  }}
                >
                  {stage.state === 'Completed' ? 'Review ↻' : 'Start →'}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
};
