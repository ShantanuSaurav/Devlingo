import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { levelProgress, xpForLevel } from '../lib/leveling';

/**
 * Progress, computed from what the player has actually done.
 *
 * The bars here used to be hard-coded (Python 90%, Git 80%) regardless of who
 * was looking at them, which made the whole panel decorative.
 */
export const Dashboard: React.FC = () => {
  const { stats, stages, allChallenges, leaderboard, user, serverStatus } = useGame();
  const [animated, setAnimated] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = panelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setAnimated(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const level = levelProgress(stats.xp);
  const solved = new Set(stats.completedChallenges);

  /** Percentage solved per language, over languages that actually appear. */
  const byLanguage = useMemo(() => {
    const totals = new Map<string, { done: number; total: number }>();
    for (const c of allChallenges) {
      const key = c.language;
      const entry = totals.get(key) ?? { done: 0, total: 0 };
      entry.total += 1;
      if (solved.has(c.id)) entry.done += 1;
      totals.set(key, entry);
    }
    return [...totals.entries()]
      .filter(([, v]) => v.total >= 5)
      .map(([name, v]) => ({ name, ...v, percent: Math.round((v.done / v.total) * 100) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [allChallenges, solved]);

  const accuracy = useMemo(() => {
    const entries = Object.values(stats.attempts);
    if (!entries.length) return null;
    return Math.round(entries.reduce((sum, a) => sum + a.score, 0) / entries.length);
  }, [stats.attempts]);

  const stagesCleared = stages.filter((s) => s.state === 'Completed').length;

  return (
    <section className="dashboard" id="dashboard">
      <div className="section-head">
        <div>
          <h2 className="section-title">Every lesson moves a bar</h2>
          <p className="section-sub">Your numbers, not a mock-up.</p>
        </div>
      </div>

      <div className="dash-panel" ref={panelRef}>
        <div className="dash-level">
          <span className="dash-label">Developer level</span>
          <strong>{level.level}</strong>
          <div className="level-track">
            <div className="level-fill" style={{ width: animated ? `${level.percent}%` : '0%' }} />
          </div>
          <span className="dash-sub">
            {level.into} / {level.needed} XP to level {level.level + 1}
          </span>

          <dl className="dash-figures">
            <div>
              <dt>Total XP</dt>
              <dd>{stats.xp}</dd>
            </div>
            <div>
              <dt>Solved</dt>
              <dd>
                {solved.size}
                <span className="dash-of"> / {allChallenges.length}</span>
              </dd>
            </div>
            <div>
              <dt>Stages cleared</dt>
              <dd>
                {stagesCleared}
                <span className="dash-of"> / {stages.length}</span>
              </dd>
            </div>
            <div>
              <dt>Streak</dt>
              <dd>
                {stats.streak}d
                {stats.bestStreak > stats.streak && (
                  <span className="dash-of"> best {stats.bestStreak}d</span>
                )}
              </dd>
            </div>
            {accuracy !== null && (
              <div>
                <dt>Avg. score</dt>
                <dd>{accuracy}%</dd>
              </div>
            )}
            <div>
              <dt>Next level at</dt>
              <dd>{xpForLevel(level.level + 1)} XP</dd>
            </div>
          </dl>
        </div>

        <div className="skills">
          <h3 className="dash-label">Coverage by language</h3>
          {byLanguage.map((lang) => (
            <div className="skill-row" key={lang.name}>
              <span className="skill-name">{lang.name}</span>
              <div className="skill-track">
                <div className="skill-fill" style={{ width: animated ? `${lang.percent}%` : '0%' }} />
              </div>
              <span className="skill-value">
                {lang.done}/{lang.total}
              </span>
            </div>
          ))}

          {solved.size === 0 && (
            <p className="dash-empty">
              Nothing solved yet. Every bar here fills in as you work through the path.
            </p>
          )}
        </div>

        <div className="dash-board">
          <h3 className="dash-label">Leaderboard</h3>
          {serverStatus !== 'online' ? (
            <p className="dash-empty">
              The leaderboard needs the local API. Start it with <code>npm run dev:api</code>.
            </p>
          ) : leaderboard.length === 0 ? (
            <p className="dash-empty">No accounts yet — sign up and you will be first.</p>
          ) : (
            <ol className="board-list">
              {leaderboard.slice(0, 8).map((row, i) => (
                <li key={row.username} className={row.username === user?.username ? 'is-you' : ''}>
                  <span className="board-rank">{i + 1}</span>
                  <span className="board-name">{row.username}</span>
                  <span className="board-xp">{row.xp} XP</span>
                  <span className="board-solved">{row.solved} solved</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
};
