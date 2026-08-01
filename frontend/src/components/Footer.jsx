import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useColorMode } from '../context/ThemeContext';

const Footer = () => {
  const { mode } = useColorMode();
  const isDark = mode === 'dark';

  const links = {
    Product: ['Crop Prediction', 'Weather Advisory', 'Farm Calendar', 'Analytics'],
    Company:  ['About Us', 'Contact', 'Careers', 'Blog'],
    Legal:    ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
  };

  const socials = [
    { label: 'Twitter / X', href: '#', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.213 5.567zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    )},
    { label: 'LinkedIn', href: '#', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    )},
    { label: 'GitHub', href: '#', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
      </svg>
    )},
    { label: 'Instagram', href: '#', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    )},
  ];

  return (
    <>
      <style>{`
        .sa-footer {
          background: ${isDark ? '#0D1208' : '#1A2E16'};
          color: #EDF2EA;
          position: relative;
          overflow: hidden;
        }
        .sa-footer::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(92,219,120,0.3), rgba(181,136,58,0.3), transparent);
        }
        /* Subtle leaf watermark */
        .sa-footer::after {
          content: '';
          position: absolute;
          right: -80px; bottom: -80px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(61,122,69,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .sa-footer-inner {
          max-width: 1240px;
          margin: 0 auto;
          padding: 80px 40px 40px;
          position: relative; z-index: 1;
        }
        .sa-footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 48px;
          margin-bottom: 64px;
        }
        .sa-footer-brand {}
        .sa-footer-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          margin-bottom: 20px;
        }
        .sa-footer-logo-icon {
          width: 38px; height: 38px;
          background: rgba(92,219,120,0.15);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid rgba(92,219,120,0.2);
        }
        .sa-footer-logo-text {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 700;
          font-size: 22px;
          color: #5CDB78;
          letter-spacing: -0.3px;
        }
        .sa-footer-tagline {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          line-height: 1.7;
          color: rgba(237,242,234,0.55);
          margin: 0 0 28px;
          max-width: 280px;
        }
        .sa-footer-socials {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .sa-social-btn {
          width: 36px; height: 36px;
          border-radius: 8px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          color: rgba(237,242,234,0.5);
          text-decoration: none;
          transition: all 0.22s ease;
          cursor: pointer;
        }
        .sa-social-btn:hover {
          background: rgba(92,219,120,0.15);
          border-color: rgba(92,219,120,0.3);
          color: #5CDB78;
          transform: translateY(-2px);
        }
        .sa-footer-col-title {
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(237,242,234,0.4);
          margin: 0 0 20px;
        }
        .sa-footer-links {
          list-style: none;
          margin: 0; padding: 0;
          display: flex; flex-direction: column; gap: 12px;
        }
        .sa-footer-link {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: rgba(237,242,234,0.6);
          text-decoration: none;
          transition: color 0.18s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .sa-footer-link:hover { color: #EDF2EA; }
        .sa-footer-link::before {
          content: '';
          display: inline-block;
          width: 4px; height: 4px;
          background: rgba(92,219,120,0.4);
          border-radius: 50%;
          transition: background 0.18s ease;
          flex-shrink: 0;
        }
        .sa-footer-link:hover::before { background: #5CDB78; }
        .sa-footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .sa-footer-copy {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: rgba(237,242,234,0.35);
          margin: 0;
        }
        .sa-footer-copy span {
          color: rgba(92,219,120,0.7);
        }
        .sa-footer-badge {
          font-family: 'Outfit', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: rgba(237,242,234,0.35);
          display: flex; align-items: center; gap: 6px;
          letter-spacing: 0.5px;
        }
        .sa-footer-badge::before {
          content: '';
          width: 6px; height: 6px;
          background: #5CDB78;
          border-radius: 50%;
          display: inline-block;
          animation: pulse-ring 2s ease infinite;
        }
        /* Newsletter blurb */
        .sa-footer-newsletter {
          margin-top: 32px;
          padding: 28px 32px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }
        .sa-footer-nl-text h4 {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700;
          color: #EDF2EA;
          margin: 0 0 6px;
        }
        .sa-footer-nl-text p {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: rgba(237,242,234,0.5);
          margin: 0;
        }
        .sa-footer-nl-form {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          flex: 1;
          min-width: 200px;
          max-width: 360px;
        }
        .sa-footer-nl-input {
          flex: 1;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #EDF2EA;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 999px;
          padding: 10px 20px;
          outline: none;
          transition: border-color 0.2s;
          min-width: 160px;
        }
        .sa-footer-nl-input::placeholder { color: rgba(237,242,234,0.3); }
        .sa-footer-nl-input:focus { border-color: rgba(92,219,120,0.4); }
        .sa-footer-nl-btn {
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: 13px;
          color: #0D1208;
          background: #5CDB78;
          border: none;
          border-radius: 999px;
          padding: 10px 22px;
          cursor: pointer;
          white-space: nowrap;
          transition: opacity 0.2s, transform 0.2s;
        }
        .sa-footer-nl-btn:hover { opacity: 0.9; transform: translateY(-1px); }

        @media (max-width: 1024px) {
          .sa-footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
          .sa-footer-brand { grid-column: 1 / -1; }
          .sa-footer-tagline { max-width: 500px; }
        }
        @media (max-width: 600px) {
          .sa-footer-inner { padding: 60px 24px 32px; }
          .sa-footer-grid { grid-template-columns: 1fr; gap: 32px; }
          .sa-footer-brand { grid-column: 1; }
          .sa-footer-bottom { flex-direction: column; text-align: center; }
          .sa-footer-newsletter { flex-direction: column; }
          .sa-footer-nl-form { max-width: 100%; width: 100%; }
        }
      `}</style>

      <footer className="sa-footer">
        <div className="sa-footer-inner">

          {/* Newsletter strip */}
          <div className="sa-footer-newsletter">
            <div className="sa-footer-nl-text">
              <h4>Grow with us</h4>
              <p>Seasonal farming tips, crop insights & platform updates.</p>
            </div>
            <div className="sa-footer-nl-form">
              <input className="sa-footer-nl-input" type="email" placeholder="your@email.com" />
              <button className="sa-footer-nl-btn">Subscribe</button>
            </div>
          </div>

          <div style={{ height: '48px' }} />

          {/* Main grid */}
          <div className="sa-footer-grid">
            {/* Brand column */}
            <div className="sa-footer-brand">
              <RouterLink to="/" className="sa-footer-logo">
                <div className="sa-footer-logo-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8 2 4 5.5 4 10c0 3.5 2 6.5 5 8.2V22h6v-3.8c3-1.7 5-4.7 5-8.2 0-4.5-4-8-8-8z" fill="#5CDB78" fillOpacity="0.9"/>
                    <path d="M12 2v20M4 10c2.5 1 5 1.5 8 1s5.5-1 8-1" stroke="#0D1208" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="sa-footer-logo-text">SmartAgri</span>
              </RouterLink>
              <p className="sa-footer-tagline">
                Empowering India's farmers with AI-driven insights — from soil to harvest, every decision backed by data.
              </p>
              <div className="sa-footer-socials">
                {socials.map((s) => (
                  <a key={s.label} href={s.href} className="sa-social-btn" aria-label={s.label}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(links).map(([col, items]) => (
              <div key={col}>
                <p className="sa-footer-col-title">{col}</p>
                <ul className="sa-footer-links">
                  {items.map((item) => (
                    <li key={item}>
                      <a href="#" className="sa-footer-link">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="sa-footer-bottom">
            <p className="sa-footer-copy">
              © {new Date().getFullYear()} SmartAgri. Built with <span>❤</span> for India's farming community.
            </p>
            <div className="sa-footer-badge">
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
