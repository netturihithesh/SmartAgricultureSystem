import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useColorMode } from '../context/ThemeContext';

const CTASection = () => {
  const navigate = useNavigate();
  const { mode } = useColorMode();
  const isDark = mode === 'dark';

  return (
    <>
      <style>{`
        .cta-section {
          position: relative;
          overflow: hidden;
          background: ${isDark ? '#0D1208' : '#F6F1EB'};
          padding: 0;
        }
        /* Wave top separator */
        .cta-wave-top {
          display: block;
          width: 100%;
          line-height: 0;
        }
        .cta-body {
          background: linear-gradient(135deg, #2D5A27 0%, #1A3A16 40%, #3D7A45 100%);
          padding: 100px 40px 120px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        /* Animated circles */
        .cta-circle-1 {
          position: absolute;
          top: -120px; left: -120px;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(92,219,120,0.15) 0%, transparent 70%);
          animation: floatSlow 12s ease-in-out infinite;
          pointer-events: none;
        }
        .cta-circle-2 {
          position: absolute;
          bottom: -80px; right: -80px;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(181,136,58,0.12) 0%, transparent 70%);
          animation: floatSlow 10s ease-in-out 3s infinite reverse;
          pointer-events: none;
        }
        /* Grain texture */
        .cta-grain {
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .cta-inner {
          position: relative; z-index: 2;
          max-width: 720px; margin: 0 auto;
        }
        .cta-eyebrow {
          display: inline-block;
          font-family: 'Outfit', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(237,242,234,0.5);
          margin-bottom: 20px;
        }
        .cta-heading {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(36px, 5vw, 60px);
          font-weight: 900;
          color: #EDF2EA;
          line-height: 1.1;
          letter-spacing: -1.5px;
          margin: 0 0 24px;
        }
        .cta-heading em {
          color: #5CDB78;
          font-style: italic;
        }
        .cta-sub {
          font-family: 'Inter', sans-serif;
          font-size: 17px;
          line-height: 1.7;
          color: rgba(237,242,234,0.65);
          margin: 0 0 48px;
          max-width: 500px;
          margin-left: auto; margin-right: auto;
        }
        .cta-buttons {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .cta-btn-primary {
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: 16px;
          color: #1A2E16;
          background: #5CDB78;
          border: none;
          border-radius: 999px;
          padding: 16px 40px;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .cta-btn-primary:hover {
          transform: translateY(-3px);
          opacity: 0.88;
        }
        .cta-btn-secondary {
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 15px;
          color: rgba(237,242,234,0.8);
          background: rgba(255,255,255,0.08);
          border: 1.5px solid rgba(255,255,255,0.15);
          border-radius: 999px;
          padding: 15px 36px;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .cta-btn-secondary:hover {
          background: rgba(255,255,255,0.14);
          border-color: rgba(255,255,255,0.3);
          color: #EDF2EA;
          transform: translateY(-2px);
        }
        /* Trust note */
        .cta-trust {
          margin-top: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        .cta-trust-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: rgba(237,242,234,0.4);
        }
        .cta-trust-dot {
          width: 5px; height: 5px;
          background: #5CDB78;
          border-radius: 50%;
          flex-shrink: 0;
        }
        /* Wave bottom separator */
        .cta-wave-bottom {
          display: block;
          width: 100%;
          line-height: 0;
          background: ${isDark ? '#0D1208' : '#1A2E16'};
        }
        @media (max-width: 600px) {
          .cta-body { padding: 72px 24px 96px; }
          .cta-buttons { flex-direction: column; width: 100%; max-width: 320px; margin: 0 auto; }
          .cta-btn-primary, .cta-btn-secondary { width: 100%; }
        }
      `}</style>

      <section className="cta-section">
        {/* Wave top */}
        <svg
          className="cta-wave-top"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          style={{ background: isDark ? '#0D1208' : '#FDFAF6' }}
        >
          <path
            d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
            fill="#2D5A27"
          />
        </svg>

        <div className="cta-body">
          <div className="cta-grain" />
          <div className="cta-circle-1" />
          <div className="cta-circle-2" />

          <div className="cta-inner">
            <span className="cta-eyebrow">Get started today</span>
            <h2 className="cta-heading">
              Your best harvest <em>starts here</em>
            </h2>
            <p className="cta-sub">
              Join thousands of Indian farmers already growing smarter. 
              Free to start, no credit card required.
            </p>

            <div className="cta-buttons">
              <button className="cta-btn-primary" onClick={() => navigate('/register')}>
                Create Free Account
              </button>
              <button className="cta-btn-secondary" onClick={() => navigate('/login')}>
                Sign in
              </button>
            </div>

            <div className="cta-trust">
              {['Free forever plan', 'No credit card needed', 'Set up in 2 minutes'].map((t) => (
                <div key={t} className="cta-trust-item">
                  <div className="cta-trust-dot" />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <svg
          className="cta-wave-bottom"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
        >
          <path
            d="M0,40 C240,0 480,80 720,40 C960,0 1200,80 1440,40 L1440,0 L0,0 Z"
            fill="#2D5A27"
          />
        </svg>
      </section>
    </>
  );
};

export default CTASection;
