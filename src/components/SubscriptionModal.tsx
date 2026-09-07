import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const { stats, upgradeToPro } = useGame();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      await upgradeToPro();
      onClose();
    } catch (err: any) {
      alert(`Stripe Checkout: ${err.message || 'Error redirecting to Stripe'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-stage-badge">Monetization & Perks</div>
            <h3 className="modal-title">CodeQuest Pro</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body" style={{ gap: '1.25rem' }}>
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }}>⚡</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', margin: '0 0 0.4rem 0' }}>
              Master Code Faster
            </h2>
            <p style={{ maxWidth: '36ch', margin: '0 auto', fontSize: '0.92rem' }}>
              Unlock full access to backend roadmaps, real-world fullstack projects, and unlimited online compiler executions.
            </p>
          </div>

          <div style={{ background: 'var(--bg-raise)', border: '1px solid var(--line)', borderRadius: '6px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
              <strong style={{ fontFamily: 'var(--font-head)', fontSize: '1.2rem' }}>Pro Monthly</strong>
              <div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--accent)' }}>$12</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--ink-faint)' }}> / month</span>
              </div>
            </div>

            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--ink-dim)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--ok)', fontWeight: 'bold' }}>✓</span>
                <span><strong>Stages 05 & 06 Unlocked</strong> (Backend Architecture & Real Production Apps)</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--ok)', fontWeight: 'bold' }}>✓</span>
                <span><strong>Unlimited Online Compiler Runs</strong> with Judge0 high-speed sandbox</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--ok)', fontWeight: 'bold' }}>✓</span>
                <span><strong>Streak Shield</strong> — never lose your daily streak on busy days</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--ok)', fontWeight: 'bold' }}>✓</span>
                <span><strong>AI Code Mentor</strong> — instant hints on failed test cases</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            className="btn btn-solid btn-lg"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading || stats.isPremium}
            onClick={handleSubscribe}
          >
            {stats.isPremium
              ? 'You are already a Pro member! ✨'
              : loading
              ? 'Opening Stripe Checkout...'
              : 'Upgrade with Stripe →'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--ink-faint)' }}>
            Secure checkout powered by Stripe. Cancel anytime in one click.
          </p>
        </div>
      </div>
    </div>
  );
};
