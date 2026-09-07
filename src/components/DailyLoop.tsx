import React from 'react';

export const DailyLoop: React.FC = () => {
  return (
    <section className="daily" id="daily">
      <div className="section-head">
        <h2 className="section-title">One loop, every day</h2>
        <p className="section-sub">Repeated until it's a habit, not a task.</p>
      </div>

      <div className="loop-row">
        <div className="loop-step">
          <span className="loop-num">1</span>
          <strong>Learn</strong>
          <p>A new concept, explained plainly.</p>
        </div>
        <div className="loop-step">
          <span className="loop-num">2</span>
          <strong>Practice</strong>
          <p>Real code, right in the browser.</p>
        </div>
        <div className="loop-step">
          <span className="loop-num">3</span>
          <strong>Debug</strong>
          <p>Find what's broken. Fix it yourself.</p>
        </div>
        <div className="loop-step">
          <span className="loop-num">4</span>
          <strong>Build</strong>
          <p>Apply it to something real.</p>
        </div>
      </div>
    </section>
  );
};
