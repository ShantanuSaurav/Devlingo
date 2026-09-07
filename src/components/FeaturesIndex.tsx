import React from 'react';

export const FeaturesIndex: React.FC = () => {
  const features = [
    {
      num: '01',
      name: 'Personalized learning',
      desc: 'Your journey adapts to your skills and pace.'
    },
    {
      num: '02',
      name: 'Interactive lessons',
      desc: 'Learn by doing, not by watching.'
    },
    {
      num: '03',
      name: 'Debugging challenges',
      desc: 'Learn how real developers solve problems.'
    },
    {
      num: '04',
      name: 'Daily missions',
      desc: 'Build a consistent coding habit.'
    },
    {
      num: '05',
      name: 'Skill tracking',
      desc: "See exactly where you're improving."
    },
    {
      num: '06',
      name: 'AI learning assistant',
      desc: "A nudge in the right direction when you're stuck."
    }
  ];

  return (
    <section className="features">
      <div className="section-head">
        <h2 className="section-title">What's inside</h2>
        <p className="section-sub">Built around how developers actually learn.</p>
      </div>

      <ol className="feature-index">
        {features.map((f) => (
          <li key={f.num}>
            <span className="fi-num">{f.num}</span>
            <span className="fi-name">{f.name}</span>
            <span className="fi-desc">{f.desc}</span>
          </li>
        ))}
      </ol>
    </section>
  );
};
