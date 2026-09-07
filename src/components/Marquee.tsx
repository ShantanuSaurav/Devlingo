import React from 'react';

export const Marquee: React.FC = () => {
  const skills = [
    'Python', '·', 'JavaScript', '·', 'Debugging', '·', 'Git & GitHub', '·', 'Problem Solving', '·', 'Web Development', '·',
    'Python', '·', 'JavaScript', '·', 'Debugging', '·', 'Git & GitHub', '·', 'Problem Solving', '·', 'Web Development', '·'
  ];

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {skills.map((item, idx) => (
          <span key={idx}>{item}</span>
        ))}
        {/* Duplicate track for seamless infinite marquee */}
        {skills.map((item, idx) => (
          <span key={`dup-${idx}`}>{item}</span>
        ))}
      </div>
    </div>
  );
};
