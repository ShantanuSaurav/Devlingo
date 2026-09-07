import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <span className="nav-mark">CQ</span>
        <div className="footer-cols">
          <div className="footer-col">
            <strong>Product</strong>
            <a href="#journey">Learning paths</a>
            <a href="#daily">Challenges</a>
            <a href="#compiler">Online compiler</a>
          </div>
          <div className="footer-col">
            <strong>Company</strong>
            <a href="#journey">About</a>
            <a href="#journey">Contact</a>
          </div>
          <div className="footer-col">
            <strong>Social</strong>
            <a href="https://github.com/ShantanuSaurav/Duolingo-but-for-Developers" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href="#" onClick={(e) => e.preventDefault()}>LinkedIn</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Twitter / X</a>
          </div>
        </div>
      </div>
      <p className="footer-bottom">© 2026 CodeQuest. Built for curious developers.</p>
    </footer>
  );
};
