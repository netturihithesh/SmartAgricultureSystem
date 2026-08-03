import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { supabase } from '../supabase';
import { useColorMode } from '../context/ThemeContext';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { mode } = useColorMode();
  const isDark = mode === 'dark';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/dashboard');
    });
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const textPrimary = isDark ? '#EDF2EA' : '#1A2E16';
  const textSecond  = isDark ? 'rgba(237,242,234,0.55)' : '#5A6B54';
  const accentGreen = isDark ? '#5CDB78' : '#2D5A27';
  const panelBg     = isDark ? '#141C10' : '#FDFAF6';
  const borderCol   = isDark ? 'rgba(255,255,255,0.08)' : '#DDD6CC';
  const inputBg     = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(246,241,235,0.7)';

  return (
    <>
      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          background: ${isDark ? '#0D1208' : '#1A2E16'};
        }
        /* Left panel — photography */
        .login-left {
          flex: 1;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 48px;
          overflow: hidden;
          min-height: 100vh;
        }
        .login-left-img {
          position: absolute; inset: 0;
          background: url('/assets/bg_farm_sunny.png') center/cover no-repeat;
        }
        .login-left-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            to top,
            rgba(13,18,8,0.85) 0%,
            rgba(13,18,8,0.3) 50%,
            rgba(13,18,8,0.1) 100%
          );
        }
        .login-left-content {
          position: relative; z-index: 2;
        }
        .login-left-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Outfit', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(237,242,234,0.7);
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 999px;
          padding: 6px 14px;
          margin-bottom: 20px;
          backdrop-filter: blur(8px);
        }
        .login-left-badge::before {
          content: '';
          width: 6px; height: 6px;
          background: #5CDB78;
          border-radius: 50%;
          animation: pulse-ring 2s ease infinite;
        }
        .login-left-quote {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(28px, 3vw, 42px);
          font-weight: 700;
          color: #EDF2EA;
          line-height: 1.2;
          margin: 0 0 20px;
          letter-spacing: -0.5px;
        }
        .login-left-quote em {
          color: #5CDB78;
          font-style: italic;
        }
        .login-left-attr {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: rgba(237,242,234,0.5);
        }

        /* Right panel — form */
        .login-right {
          width: 480px;
          flex-shrink: 0;
          background: ${panelBg};
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 64px 48px;
          position: relative;
          overflow-y: auto;
        }
        .login-right::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 1px; height: 100%;
          background: linear-gradient(to bottom, transparent, ${borderCol}, transparent);
        }
        /* Logo */
        .login-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          margin-bottom: 40px;
        }
        .login-logo-icon {
          width: 36px; height: 36px;
          background: ${isDark ? 'rgba(92,219,120,0.15)' : '#2D5A27'};
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .login-logo-text {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 700;
          font-size: 20px;
          color: ${accentGreen};
          letter-spacing: -0.3px;
        }
        .login-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 30px;
          font-weight: 900;
          color: ${textPrimary};
          margin: 0 0 8px;
          letter-spacing: -0.5px;
        }
        .login-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: ${textSecond};
          margin: 0 0 36px;
          line-height: 1.5;
        }
        /* Error */
        .login-error {
          background: rgba(192,57,43,0.08);
          border: 1px solid rgba(192,57,43,0.25);
          border-radius: 12px;
          padding: 12px 16px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: #C0392B;
          margin-bottom: 24px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }
        /* Form */
        .login-form { display: flex; flex-direction: column; gap: 20px; }
        .login-field {}
        .login-label {
          display: block;
          font-family: 'Outfit', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: ${textPrimary};
          margin-bottom: 8px;
        }
        .login-input-wrap {
          position: relative;
        }
        .login-input {
          width: 100%;
          height: 50px;
          background: ${inputBg};
          border: 1.5px solid ${borderCol};
          border-radius: 14px;
          padding: 0 48px 0 16px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: ${textPrimary};
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .login-input::placeholder { color: ${textSecond}; }
        .login-input:focus {
          border-color: ${accentGreen};
          box-shadow: 0 0 0 4px ${isDark ? 'rgba(92,219,120,0.1)' : 'rgba(45,90,39,0.08)'};
        }
        .login-input-icon {
          position: absolute;
          right: 14px; top: 50%;
          transform: translateY(-50%);
          color: ${textSecond};
          cursor: pointer;
          font-size: 18px;
          background: none;
          border: none;
          padding: 4px;
          display: flex; align-items: center; justify-content: center;
          transition: color 0.2s;
        }
        .login-input-icon:hover { color: ${accentGreen}; }
        .login-forgot {
          text-align: right;
          margin-top: -12px;
        }
        .login-forgot a {
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: ${accentGreen};
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .login-forgot a:hover { opacity: 0.7; }
        .login-submit {
          width: 100%;
          height: 52px;
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: 15px;
          color: ${isDark ? '#0D1208' : '#fff'};
          background: ${isDark ? '#5CDB78' : '#2D5A27'};
          border: none;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .login-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          opacity: 0.88;
        }
        .login-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        /* Spinner */
        .login-spinner {
          width: 18px; height: 18px;
          border: 2px solid ${isDark ? 'rgba(13,18,8,0.3)' : 'rgba(255,255,255,0.3)'};
          border-top-color: ${isDark ? '#0D1208' : '#fff'};
          border-radius: 50%;
          animation: rotateSlow 0.7s linear infinite;
        }
        /* Divider */
        .login-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 4px 0;
        }
        .login-divider-line {
          flex: 1; height: 1px;
          background: ${borderCol};
        }
        .login-divider span {
          font-family: 'Outfit', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 1px; text-transform: uppercase;
          color: ${textSecond};
        }
        /* Google btn */
        .login-google {
          width: 100%; height: 50px;
          font-family: 'Outfit', sans-serif;
          font-weight: 600; font-size: 14px;
          color: ${textPrimary};
          background: ${isDark ? 'rgba(255,255,255,0.04)' : '#fff'};
          border: 1.5px solid ${borderCol};
          border-radius: 999px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: all 0.2s ease;
        }
        .login-google:hover {
          border-color: ${isDark ? 'rgba(255,255,255,0.2)' : '#BBBBBB'};
          background: ${isDark ? 'rgba(255,255,255,0.08)' : '#F9F9F9'};
        }
        /* Footer link */
        .login-footer-note {
          margin-top: 8px;
          text-align: center;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: ${textSecond};
        }
        .login-footer-note a {
          color: ${accentGreen};
          font-weight: 700;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .login-footer-note a:hover { opacity: 0.75; }

        @media (max-width: 900px) {
          .login-left { display: none; }
          .login-right {
            width: 100%;
            min-height: 100vh;
            padding: 48px 28px;
          }
        }
        @media (max-width: 480px) {
          .login-right { padding: 40px 20px; }
        }
      `}</style>

      <div className="login-page">
        {/* Left: Photography panel */}
        <div className="login-left">
          <div className="login-left-img" />
          <div className="login-left-overlay" />
          <div className="login-left-content">
            <div className="login-left-badge">12,000+ Active Farmers</div>
            <p className="login-left-quote">
              "Good farming is a <em>lifelong education</em>.<br />
              We give you the tools."
            </p>
            <p className="login-left-attr">— SmartAgri, built for India's soil</p>
          </div>
        </div>

        {/* Right: Form panel */}
        <div className="login-right">
          <RouterLink to="/" className="login-logo">
            <img src="/favicon.png" alt="SmartAgri Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            <span className="login-logo-text">SmartAgri</span>
          </RouterLink>

          <h1 className="login-title">Welcome back</h1>
          <p className="login-subtitle">Sign in to your farm dashboard</p>

          {errorMsg && (
            <div className="login-error">
              ⚠️ {errorMsg}
            </div>
          )}

          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-field">
              <label className="login-label" htmlFor="login-email">Email Address</label>
              <div className="login-input-wrap">
                <input
                  id="login-email"
                  className="login-input"
                  type="email"
                  placeholder="farmer@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="login-password">Password</label>
              <div className="login-input-wrap">
                <input
                  id="login-password"
                  className="login-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="login-input-icon"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="login-forgot">
              <a href="#">Forgot password?</a>
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading
                ? <><div className="login-spinner" /> Signing in…</>
                : 'Sign in to Dashboard'
              }
            </button>
          </form>

          <div className="login-divider" style={{ margin: '24px 0' }}>
            <div className="login-divider-line" />
            <span>or</span>
            <div className="login-divider-line" />
          </div>

          <button className="login-google" type="button">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="login-footer-note" style={{ marginTop: '32px' }}>
            New to SmartAgri?{' '}
            <RouterLink to="/register">Create account</RouterLink>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
