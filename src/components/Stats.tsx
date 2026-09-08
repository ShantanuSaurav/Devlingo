import React, { useMemo } from 'react';
import { useGame } from '../context/GameContext';

export const Stats: React.FC = () => {
  const { allChallenges, stages } = useGame();

  const figures = useMemo(() => {
    const languages = new Set(allChallenges.map((c) => c.language));
    const executable = allChallenges.filter((c) => c.type === 'code_runner' || c.type === 'debug');
    return [
      { value: String(allChallenges.length), label: 'challenges, every one hand-checked' },
      { value: String(stages.length), label: 'stages from first variable to production' },
      { value: String(executable.length), label: 'coding problems graded by real test runs' },
      { value: String(languages.size), label: 'languages and notations covered' }
    ];
  }, [allChallenges, stages]);

  return (
    <section className="stats">
      {figures.map((f) => (
        <div className="stat" key={f.label}>
          <strong>{f.value}</strong>
          <span>{f.label}</span>
        </div>
      ))}
    </section>
  );
};
