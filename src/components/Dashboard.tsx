import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';

export const Dashboard: React.FC = () => {
  const { stats } = useGame();
  const [animated, setAnimated] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Calculate dynamic level progress based on XP modulo 100
  const levelProgress = stats.xp % 100 || 68;

  // Dynamically calculate problem solving progress based on completed challenges
  const problemSolvingProgress = Math.min(
    100,
    Math.max(40, stats.completedChallenges.length * 15)
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setAnimated(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );

    if (panelRef.current) {
      observer.observe(panelRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="dashboard">
      <div className="section-head">
        <h2 className="section-title">Every lesson moves a bar</h2>
        <p className="section-sub">Watch your skills add up, day by day.</p>
      </div>

      <div className="dash-panel" ref={panelRef}>
        <div className="dash-level">
          <span>Developer level</span>
          <strong>{stats.level}</strong>
          <div className="level-track">
            <div
              className="level-fill"
              style={{ width: animated ? `${levelProgress}%` : '0%' }}
            />
          </div>
          <span>{levelProgress}% to Lv. {stats.level + 1}</span>
        </div>

        <div className="skills">
          <div className="skill-row">
            <span className="skill-name">Python</span>
            <div className="skill-track">
              <div
                className="skill-fill"
                style={{ width: animated ? '90%' : '0%' }}
              />
            </div>
            <span>90%</span>
          </div>

          <div className="skill-row">
            <span className="skill-name">JavaScript</span>
            <div className="skill-track">
              <div
                className="skill-fill"
                style={{ width: animated ? '75%' : '0%' }}
              />
            </div>
            <span>75%</span>
          </div>

          <div className="skill-row">
            <span className="skill-name">Problem solving</span>
            <div className="skill-track">
              <div
                className="skill-fill"
                style={{ width: animated ? `${problemSolvingProgress}%` : '0%' }}
              />
            </div>
            <span>{problemSolvingProgress}%</span>
          </div>

          <div className="skill-row">
            <span className="skill-name">Git &amp; GitHub</span>
            <div className="skill-track">
              <div
                className="skill-fill"
                style={{ width: animated ? '80%' : '0%' }}
              />
            </div>
            <span>80%</span>
          </div>
        </div>
      </div>
    </section>
  );
};
