import React from 'react';
import { useGame } from '../context/GameContext';

export const FinalCTA: React.FC = () => {
  const { openPractice } = useGame();

  return (
    <section className="final-cta">
      <h2 className="final-cta-title">
        Your journey<br />begins today.
      </h2>
      <p className="final-cta-sub">Stop wondering what to learn next.</p>
      <button
        type="button"
        className="btn btn-solid btn-lg"
        onClick={() => openPractice()}
      >
        Start your journey
      </button>
    </section>
  );
};
