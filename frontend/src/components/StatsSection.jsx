import React, { useState, useEffect, useRef } from 'react';
import { useColorMode } from '../context/ThemeContext';

const stats = [
  { value: 95,  suffix: '%', label: 'Prediction Accuracy', desc: 'AI-validated crop model' },
  { value: 12,  suffix: 'k+', label: 'Active Farmers',     desc: 'Across 18 Indian states' },
  { value: 42,  suffix: '%', label: 'Average Yield Boost', desc: 'Over traditional methods' },
  { value: 180, suffix: '+', label: 'Crop Varieties',      desc: 'Supported in our database' },
];

const useCountUp = (target, duration = 1800, started) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = target / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= target) { clearInterval(id); setCount(target); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [target, duration, started]);
  return count;
};

const StatItem = ({ value, suffix, label, desc, started, isDark }) => {
  const count = useCountUp(value, 1800, started);
  const accentGreen = isDark ? '#5CDB78' : '#EDF2EA';
  return (
    <div className="stat-item">
      <div className="stat-num">
        {count}{suffix}
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-desc">{desc}</div>
    </div>
  );
};

const StatsSection = () => {
  const { mode } = useColorMode();
  const isDark = mode === 'dark';
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        .stats-section {
          background: linear-gradient(135deg, #1A2E16 0%, #2D5A27 50%, #1E3A1A 100%);
          padding: 100px 0;
          position: relative;
          overflow: hidden;
        }
        /* Diagonal texture overlay */
        .stats-section::before {
          content: '';
          position: absolute; inset: 0;
          background-image: repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 40px,
            rgba(255,255,255,0.015) 40px,
            rgba(255,255,255,0.015) 80px
          );
          pointer-events: none;
        }
        /* Large leaf watermark */
        .stats-bg-leaf {
          position: absolute;
          right: -100px; top: -100px;
          font-size: 480px;
          opacity: 0.03;
          line-height: 1;
          pointer-events: none;
          animation: leafSway 8s ease-in-out infinite;
          user-select: none;
        }
        .stats-inner {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 40px;
          position: relative; z-index: 2;
        }
        .stats-eyebrow {
          text-align: center;
          font-family: 'Outfit', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: rgba(237,242,234,0.5);
          margin-bottom: 12px;
        }
        .stats-heading {
          text-align: center;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(28px, 3.5vw, 44px);
          font-weight: 900;
          color: #EDF2EA;
          margin: 0 0 72px;
          letter-spacing: -0.5px;
          line-height: 1.15;
        }
        .stats-heading em {
          font-style: italic;
          color: #5CDB78;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.08);
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .stat-item {
          background: rgba(255,255,255,0.02);
          padding: 40px 32px;
          text-align: center;
          transition: background 0.25s ease;
          cursor: default;
        }
        .stat-item:hover {
          background: rgba(92,219,120,0.06);
        }
        .stat-num {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(42px, 5vw, 64px);
          font-weight: 900;
          color: #5CDB78;
          line-height: 1;
          margin-bottom: 10px;
          letter-spacing: -2px;
        }
        .stat-label {
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #EDF2EA;
          margin-bottom: 6px;
        }
        .stat-desc {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: rgba(237,242,234,0.45);
          letter-spacing: 0.3px;
        }
        /* Photo strip below stats */
        .stats-photos {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 64px;
        }
        .stats-photo {
          border-radius: 20px;
          overflow: hidden;
          aspect-ratio: 4/3;
          position: relative;
        }
        .stats-photo img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
          filter: brightness(0.75) saturate(1.1);
          transition: transform 0.6s ease, filter 0.4s ease;
        }
        .stats-photo:hover img { transform: scale(1.06); filter: brightness(0.85) saturate(1.2); }
        .stats-photo-label {
          position: absolute;
          bottom: 16px; left: 16px;
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #EDF2EA;
          background: rgba(13,18,8,0.55);
          backdrop-filter: blur(8px);
          border-radius: 10px;
          padding: 8px 14px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .stats-photos { grid-template-columns: 1fr 1fr; }
          .stats-photos .stats-photo:last-child { display: none; }
        }
        @media (max-width: 600px) {
          .stats-section { padding: 72px 0; }
          .stats-inner { padding: 0 20px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .stats-photos { grid-template-columns: 1fr; }
          .stat-item { padding: 28px 20px; }
          .stats-photos .stats-photo:last-child { display: block; }
          .stats-photos .stats-photo:nth-child(3) { display: none; }
        }
      `}</style>

      <section className="stats-section" ref={ref}>
        <div className="stats-bg-leaf">🌿</div>
        <div className="stats-inner">
          <p className="stats-eyebrow">By the numbers</p>
          <h2 className="stats-heading">
            Trusted by real farmers,<br />
            proven by <em>real results</em>
          </h2>

          <div className="stats-grid">
            {stats.map((s, i) => (
              <StatItem key={i} {...s} started={started} isDark={isDark} />
            ))}
          </div>

          {/* Photo strip */}
          <div className="stats-photos">
            {[
              { src: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=600', label: 'Rice Paddy — Karnataka' },
              { src: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=600', label: 'Cotton Farm — Telangana' },
              { src: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600', label: 'Wheat Field — Punjab' },
            ].map((p, i) => (
              <div key={i} className="stats-photo">
                <img src={p.src} alt={p.label} />
                <div className="stats-photo-label">{p.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default StatsSection;
