import React, { useEffect, useRef } from 'react';
import { useColorMode } from '../context/ThemeContext';

const features = [
  {
    emoji: '🧠',
    title: 'AI Crop Prediction',
    desc: 'Smart recommendations based on your soil type, location, season, and irrigation — no guesswork needed.',
    tag: 'Most Used',
  },
  {
    emoji: '📅',
    title: 'Growth Stage Tracking',
    desc: 'Every farming step from land prep to harvest, tracked automatically with timely alerts and reminders.',
    tag: 'New',
  },
  {
    emoji: '🌩️',
    title: 'Weather Advisory',
    desc: 'Hyper-local weather warnings tied to your exact crop stage. Spray only when it\'s safe to spray.',
    tag: 'Real-time',
  },
  {
    emoji: '💰',
    title: 'Profit Estimator',
    desc: 'Know your expected revenue before you plant. Market price trends, yield projections, and income forecast.',
    tag: 'Finance',
  },
];

const FeaturesSection = () => {
  const { mode } = useColorMode();
  const isDark = mode === 'dark';
  const sectionRef = useRef(null);

  // Scroll reveal
  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll('.feat-card');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );
    cards?.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  const bg = isDark ? '#0D1208' : '#FDFAF6';
  const textPrimary = isDark ? '#EDF2EA' : '#1A2E16';
  const textSecond = isDark ? 'rgba(237,242,234,0.55)' : '#5A6B54';
  const accentGreen = isDark ? '#5CDB78' : '#2D5A27';

  return (
    <>
      <style>{`
        .feat-section {
          background: ${bg};
          padding: 120px 0;
          position: relative;
          overflow: hidden;
        }
        /* top wave */
        .feat-section::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg,
            transparent 0%,
            ${isDark ? 'rgba(92,219,120,0.2)' : 'rgba(45,90,39,0.12)'} 30%,
            ${isDark ? 'rgba(181,136,58,0.2)' : 'rgba(181,136,58,0.12)'} 70%,
            transparent 100%
          );
        }
        .feat-inner {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 40px;
        }
        .feat-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 32px;
          margin-bottom: 72px;
          flex-wrap: wrap;
        }
        .feat-header-left {}
        .feat-eyebrow {
          font-family: 'Outfit', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: ${accentGreen};
          margin-bottom: 16px;
        }
        .feat-heading {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(32px, 4vw, 52px);
          font-weight: 900;
          line-height: 1.1;
          color: ${textPrimary};
          margin: 0;
          letter-spacing: -1px;
          max-width: 500px;
        }
        .feat-heading em {
          color: ${accentGreen};
          font-style: italic;
        }
        .feat-header-right {
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          line-height: 1.7;
          color: ${textSecond};
          max-width: 340px;
        }
        /* Cards grid */
        .feat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .feat-card {
          opacity: 0;
          transform: translateY(36px);
          transition: opacity 0.6s ease, transform 0.6s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          background: ${isDark ? 'rgba(255,255,255,0.03)' : '#fff'};
          border: 1.5px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#EDE8E2'};
          border-radius: 24px;
          padding: 32px 28px;
          cursor: default;
          position: relative;
          overflow: hidden;
        }
        .feat-card::before {
          content: '';
          position: absolute;
          bottom: -40px; right: -40px;
          width: 120px; height: 120px;
          border-radius: 50%;
          background: radial-gradient(circle, var(--feat-accent-alpha) 0%, transparent 70%);
          transition: opacity 0.4s;
          opacity: 0;
        }
        .feat-card:hover::before { opacity: 1; }
        .feat-card.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .feat-card:nth-child(2) { transition-delay: 0.1s; }
        .feat-card:nth-child(3) { transition-delay: 0.2s; }
        .feat-card:nth-child(4) { transition-delay: 0.3s; }
        .feat-card:hover {
          transform: translateY(-8px);
          box-shadow: ${isDark
            ? '0 24px 60px rgba(0,0,0,0.35)'
            : '0 24px 60px rgba(45,90,39,0.1)'};
          border-color: var(--feat-accent);
        }
        .feat-card-tag {
          display: inline-block;
          font-family: 'Outfit', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--feat-accent);
          background: var(--feat-accent-alpha);
          border-radius: 999px;
          padding: 4px 10px;
          margin-bottom: 20px;
        }
        .feat-icon {
          font-size: 36px;
          line-height: 1;
          margin-bottom: 20px;
          display: block;
        }
        /* Left accent bar */
        .feat-card-bar {
          position: absolute;
          top: 32px; left: 0;
          width: 3px; height: 40px;
          background: var(--feat-accent);
          border-radius: 0 3px 3px 0;
          opacity: 0;
          transition: opacity 0.3s, height 0.3s;
        }
        .feat-card:hover .feat-card-bar { opacity: 1; height: 60px; }
        .feat-title {
          font-family: 'Inter', sans-serif;
          font-size: 18px;
          font-weight: 800;
          color: ${textPrimary};
          margin: 0 0 12px;
          line-height: 1.3;
        }
        .feat-desc {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          line-height: 1.72;
          color: ${textSecond};
          margin: 0;
        }
        /* Ticker strip */
        .feat-ticker-wrap {
          margin-top: 80px;
          overflow: hidden;
          border-top: 1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#EDE8E2'};
          border-bottom: 1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#EDE8E2'};
          padding: 18px 0;
          position: relative;
        }
        .feat-ticker-wrap::before,
        .feat-ticker-wrap::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          width: 80px;
          z-index: 2;
        }
        .feat-ticker-wrap::before {
          left: 0;
          background: linear-gradient(to right, ${bg}, transparent);
        }
        .feat-ticker-wrap::after {
          right: 0;
          background: linear-gradient(to left, ${bg}, transparent);
        }
        .feat-ticker {
          display: flex;
          gap: 0;
          animation: ticker-scroll 28s linear infinite;
          width: max-content;
        }
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .feat-ticker-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 32px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: ${textSecond};
          white-space: nowrap;
          border-right: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#EDE8E2'};
        }
        .feat-ticker-dot {
          width: 6px; height: 6px;
          background: ${accentGreen};
          border-radius: 50%;
          flex-shrink: 0;
        }
        @media (max-width: 1024px) {
          .feat-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .feat-section { padding: 80px 0; }
          .feat-inner { padding: 0 20px; }
          .feat-grid { grid-template-columns: 1fr; }
          .feat-header { margin-bottom: 48px; }
        }
      `}</style>

      <section className="feat-section" ref={sectionRef}>
        <div className="feat-inner">
          <div className="feat-header">
            <div className="feat-header-left">
              <p className="feat-eyebrow">Smart Features</p>
              <h2 className="feat-heading">
                Everything for <em>Precision Farming</em>
              </h2>
            </div>
            <p className="feat-header-right">
              From the moment you choose a crop to the day you sell your harvest — 
              SmartAgri guides every decision with real data.
            </p>
          </div>

          <div className="feat-grid">
            {features.map((f, i) => {
              const accent = isDark ? '#5CDB78' : '#2D5A27';
              const alphaAccent = accent + '22';
              return (
                <div
                  key={i}
                  className="feat-card"
                  style={{
                    '--feat-accent': accent,
                    '--feat-accent-alpha': alphaAccent,
                  }}
                >
                  <div className="feat-card-bar" />
                  <span className="feat-icon">{f.emoji}</span>
                  <div className="feat-card-tag">{f.tag}</div>
                  <h3 className="feat-title">{f.title}</h3>
                  <p className="feat-desc">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ticker */}
        <div className="feat-ticker-wrap">
          <div className="feat-ticker">
            {[
              '12,000+ Farmers', 'Paddy', 'Cotton', 'Wheat', 'Tomato', 'Sugarcane',
              'AI Recommendations', 'Live Weather', '18 States', 'Onion', 'Maize',
              'Profit Estimator', 'Growth Tracking', 'Sunflower', 'Soybean',
              '12,000+ Farmers', 'Paddy', 'Cotton', 'Wheat', 'Tomato', 'Sugarcane',
              'AI Recommendations', 'Live Weather', '18 States', 'Onion', 'Maize',
              'Profit Estimator', 'Growth Tracking', 'Sunflower', 'Soybean',
            ].map((item, i) => (
              <div key={i} className="feat-ticker-item">
                <div className="feat-ticker-dot" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default FeaturesSection;
