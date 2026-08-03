import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useColorMode } from '../context/ThemeContext';

const HEADLINES = [
  'Grow Smarter.',
  'Harvest Better.',
  'Farm with Data.',
];

const HeroSection = () => {
  const navigate = useNavigate();
  const { mode } = useColorMode();
  const isDark = mode === 'dark';
  const [headlineIdx, setHeadlineIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  // Entrance animation
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Cycling headlines
  useEffect(() => {
    const id = setInterval(() => {
      setHeadlineIdx(i => (i + 1) % HEADLINES.length);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  const bg = isDark
    ? 'linear-gradient(160deg, #0D1208 0%, #101A0C 50%, #0D1208 100%)'
    : 'linear-gradient(160deg, #F0EBE3 0%, #E8F0E4 55%, #F6F1EB 100%)';

  const accentGreen  = isDark ? '#5CDB78' : '#2D5A27';
  const textPrimary  = isDark ? '#EDF2EA' : '#1A2E16';
  const textSecond   = isDark ? 'rgba(237,242,234,0.6)' : '#4A6044';

  return (
    <>
      <style>{`
        .hero-section {
          min-height: 100vh;
          background: ${bg};
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
          padding-top: 72px;
        }
        /* Organic blobs */
        .hero-blob-1 {
          position: absolute;
          top: -120px; right: -80px;
          width: 600px; height: 600px;
          border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          background: ${isDark
            ? 'radial-gradient(ellipse, rgba(61,122,69,0.18) 0%, transparent 70%)'
            : 'radial-gradient(ellipse, rgba(61,122,69,0.12) 0%, transparent 70%)'};
          animation: floatSlow 12s ease-in-out infinite;
          pointer-events: none;
        }
        .hero-blob-2 {
          position: absolute;
          bottom: -160px; left: -100px;
          width: 500px; height: 500px;
          border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
          background: ${isDark
            ? 'radial-gradient(ellipse, rgba(181,136,58,0.08) 0%, transparent 70%)'
            : 'radial-gradient(ellipse, rgba(181,136,58,0.1) 0%, transparent 70%)'};
          animation: floatSlow 16s ease-in-out infinite reverse;
          pointer-events: none;
        }
        /* Dots grid subtle */
        .hero-dots {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(
            circle,
            ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(45,90,39,0.06)'} 1px,
            transparent 1px
          );
          background-size: 36px 36px;
          pointer-events: none;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
        }
        .hero-inner {
          max-width: 1240px;
          margin: 0 auto;
          padding: 80px 40px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
          position: relative; z-index: 2;
          width: 100%;
        }
        /* Left text block */
        .hero-left {
          opacity: ${visible ? 1 : 0};
          transform: ${visible ? 'translateY(0)' : 'translateY(32px)'};
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Outfit', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: ${accentGreen};
          background: ${isDark ? 'rgba(92,219,120,0.1)' : 'rgba(45,90,39,0.08)'};
          border: 1px solid ${isDark ? 'rgba(92,219,120,0.2)' : 'rgba(45,90,39,0.15)'};
          border-radius: 999px;
          padding: 6px 14px;
          margin-bottom: 28px;
        }
        .hero-heading {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(44px, 5.5vw, 72px);
          font-weight: 900;
          line-height: 1.06;
          color: ${textPrimary};
          margin: 0 0 12px;
          letter-spacing: -1.5px;
        }
        .hero-heading-cycle {
          display: block;
          color: ${accentGreen};
          min-height: 1.06em;
          animation: fadeInUp 0.5s ease;
        }
        .hero-subtext {
          font-family: 'Inter', sans-serif;
          font-size: clamp(16px, 1.8vw, 19px);
          line-height: 1.7;
          color: ${textSecond};
          margin: 24px 0 40px;
          max-width: 480px;
        }
        .hero-cta-group {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }
        .hero-btn-primary {
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: 15px;
          color: ${isDark ? '#0D1208' : '#fff'};
          background: ${isDark ? '#5CDB78' : '#2D5A27'};
          border: none;
          border-radius: 999px;
          padding: 15px 32px;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .hero-btn-primary:hover {
          transform: translateY(-3px);
          opacity: 0.88;
        }
        .hero-btn-secondary {
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 15px;
          color: ${textSecond};
          background: none;
          border: none;
          padding: 15px 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: color 0.2s, gap 0.2s;
          text-decoration: none;
        }
        .hero-btn-secondary:hover {
          color: ${accentGreen};
          gap: 14px;
        }
        .hero-btn-arrow {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(45,90,39,0.08)'};
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
          transition: background 0.2s, transform 0.2s;
        }
        .hero-btn-secondary:hover .hero-btn-arrow {
          background: ${isDark ? 'rgba(92,219,120,0.15)' : 'rgba(45,90,39,0.12)'};
          transform: translateX(4px);
        }
        /* Trust strip */
        .hero-trust {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 48px;
          flex-wrap: wrap;
        }
        .hero-avatars {
          display: flex;
        }
        .hero-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          border: 2px solid ${isDark ? '#0D1208' : '#F6F1EB'};
          margin-right: -10px;
          font-size: 16px;
          display: flex; align-items: center; justify-content: center;
          background: ${isDark ? 'rgba(92,219,120,0.12)' : '#E8F0E4'};
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          color: ${accentGreen};
        }
        .hero-trust-text {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: ${textSecond};
          line-height: 1.4;
        }
        .hero-trust-text strong {
          display: block;
          color: ${textPrimary};
          font-weight: 700;
          font-size: 14px;
        }

        /* Right image area */
        .hero-right {
          position: relative;
          opacity: ${visible ? 1 : 0};
          transform: ${visible ? 'scale(1)' : 'scale(0.94)'};
          transition: opacity 0.9s ease 0.2s, transform 0.9s ease 0.2s;
        }
        .hero-img-frame {
          position: relative;
          border-radius: 32px;
          overflow: hidden;
          aspect-ratio: 4/5;
          box-shadow: ${isDark
            ? '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)'
            : '0 40px 80px rgba(45,90,39,0.2), 0 0 0 1px rgba(45,90,39,0.08)'};
        }
        .hero-img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 8s ease;
        }
        .hero-img:hover { transform: scale(1.04); }
        /* Gradient overlay on image */
        .hero-img-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            ${isDark ? 'rgba(13,18,8,0.7)' : 'rgba(26,46,22,0.4)'} 0%,
            transparent 50%
          );
        }
        /* Image caption pill */
        .hero-img-caption {
          position: absolute;
          bottom: 24px; left: 24px; right: 24px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #EDF2EA;
          background: rgba(13,18,8,0.5);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .hero-img-caption-tag {
          font-family: 'Outfit', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #5CDB78;
          opacity: 0.9;
        }
        /* Floating stat card */
        .hero-stat-card {
          position: absolute;
          top: 32px; right: -32px;
          background: ${isDark ? '#141C10' : '#FDFAF6'};
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#DDD6CC'};
          border-radius: 20px;
          padding: 18px 22px;
          animation: float 7s ease-in-out infinite;
          min-width: 160px;
        }
        .hero-stat-label {
          font-family: 'Outfit', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: ${isDark ? 'rgba(237,242,234,0.4)' : '#7A9270'};
          margin-bottom: 4px;
        }
        .hero-stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 900;
          color: ${accentGreen};
          line-height: 1;
        }
        .hero-stat-sub {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: ${isDark ? 'rgba(237,242,234,0.5)' : '#7A9270'};
          margin-top: 2px;
        }
        /* Floating badge bottom-left of image */
        .hero-badge {
          position: absolute;
          bottom: 100px; left: -28px;
          background: ${isDark ? '#141C10' : '#FDFAF6'};
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#DDD6CC'};
          border-radius: 16px;
          padding: 12px 18px;
          animation: float 9s ease-in-out 2s infinite;
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 180px;
        }
        .hero-badge-icon {
          width: 36px; height: 36px;
          background: ${isDark ? 'rgba(181,136,58,0.15)' : 'rgba(181,136,58,0.12)'};
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }
        .hero-badge-text strong {
          display: block;
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: 14px;
          color: ${textPrimary};
        }
        .hero-badge-text span {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: ${textSecond};
        }
        /* Scroll indicator */
        .hero-scroll-hint {
          position: absolute;
          bottom: 32px; left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          opacity: 0.4;
          transition: opacity 0.3s;
          cursor: pointer;
          z-index: 3;
        }
        .hero-scroll-hint:hover { opacity: 0.7; }
        .hero-scroll-mouse {
          width: 22px; height: 34px;
          border: 2px solid ${textSecond};
          border-radius: 11px;
          position: relative;
        }
        .hero-scroll-mouse::after {
          content: '';
          position: absolute;
          top: 6px; left: 50%;
          transform: translateX(-50%);
          width: 2px; height: 6px;
          background: ${textSecond};
          border-radius: 2px;
          animation: floatSlow 1.5s ease-in-out infinite;
        }
        .hero-scroll-label {
          font-family: 'Outfit', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: ${textSecond};
        }

        @media (max-width: 960px) {
          .hero-inner {
            grid-template-columns: 1fr;
            gap: 48px;
            padding: 60px 24px 100px;
            text-align: center;
          }
          .hero-subtext { margin-left: auto; margin-right: auto; }
          .hero-cta-group { justify-content: center; }
          .hero-trust { justify-content: center; }
          .hero-right { max-width: 480px; margin: 0 auto; }
          .hero-stat-card { right: -8px; top: 16px; }
          .hero-badge { left: -8px; }
        }
        @media (max-width: 480px) {
          .hero-stat-card { display: none; }
          .hero-badge { display: none; }
        }
      `}</style>

      <section className="hero-section" ref={ref}>
        <div className="hero-dots" />
        <div className="hero-blob-1" />
        <div className="hero-blob-2" />

        <div className="hero-inner">
          {/* Left: Text */}
          <div className="hero-left">
            <div className="hero-eyebrow">
              AI-Powered Farming Platform
            </div>

            <h1 className="hero-heading">
              Your farm,
              <span
                className="hero-heading-cycle"
                key={headlineIdx}
                style={{ animation: 'fadeInUp 0.5s ease' }}
              >
                {HEADLINES[headlineIdx]}
              </span>
            </h1>

            <p className="hero-subtext">
              Predict the right crops, track every growth stage, get real-time weather alerts, 
              and maximize your harvest profit — all powered by AI built for Indian farmers.
            </p>

            <div className="hero-cta-group">
              <button
                className="hero-btn-primary"
                onClick={() => navigate('/register')}
              >
                Start for Free →
              </button>
              <button
                className="hero-btn-secondary"
                onClick={() => navigate('/login')}
              >
                <span className="hero-btn-arrow">▶</span>
                See how it works
              </button>
            </div>

            <div className="hero-trust">
              <div className="hero-avatars">
                {['R', 'S', 'M', 'A'].map((l, i) => (
                  <div className="hero-avatar" key={i}>{l}</div>
                ))}
                <div style={{ marginLeft: '16px' }} />
              </div>
              <div className="hero-trust-text">
                <strong>12,000+ farmers trust SmartAgri</strong>
                across 18 Indian states
              </div>
            </div>
          </div>

          {/* Right: Image */}
          <div className="hero-right">
            <div className="hero-img-frame">
              <img
                className="hero-img"
                src="/assets/bg_abstract_green.png"
                alt="Farmer in a lush green rice paddy field"
              />
              <div className="hero-img-overlay" />
              <div className="hero-img-caption">
                <div>
                  <div className="hero-img-caption-tag">Live Tracking</div>
                  <span>Paddy — Week 8 of 16</span>
                </div>
                <span style={{ fontSize: '20px' }}>🌾</span>
              </div>
            </div>

            {/* Floating stat */}
            <div className="hero-stat-card">
              <div className="hero-stat-label">Avg Yield Boost</div>
              <div className="hero-stat-value">+42%</div>
              <div className="hero-stat-sub">vs. traditional farming</div>
            </div>

            {/* Floating badge */}
            <div className="hero-badge">
              <div className="hero-badge-icon">🌤️</div>
              <div className="hero-badge-text">
                <strong>Clear for 5 days</strong>
                <span>Ideal spray window</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div
          className="hero-scroll-hint"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <div className="hero-scroll-mouse" />
          <span className="hero-scroll-label">Scroll</span>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
