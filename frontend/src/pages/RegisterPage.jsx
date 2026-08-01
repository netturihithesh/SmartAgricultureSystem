import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { supabase } from '../supabase';
import { useColorMode } from '../context/ThemeContext';
import { Autocomplete, TextField } from '@mui/material';
import statesData from '../data/statesDistricts.json';

const getSeason = (state) => {
  const month = new Date().getMonth() + 1;
  if (['Tamil Nadu', 'Kerala'].includes(state)) {
    if (month >= 5 && month <= 9) return 'Kharif';
  } else {
    if (month >= 6 && month <= 10) return 'Kharif';
  }
  if (month > 10 || month <= 3) return 'Rabi';
  return 'Zaid';
};

const STEPS = ['Account', 'Farm Details'];

const RegisterPage = () => {
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const navigate = useNavigate();
  const { mode } = useColorMode();
  const isDark = mode === 'dark';

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    state: '', district: '', soilType: '', landSize: '', irrigation: '',
  });

  const indianStates = Object.keys(statesData);
  const availableDistricts = formData.state ? (statesData[formData.state] || []) : [];

  const set = (key) => (e) => setFormData(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (step === 0) {
      if (formData.password !== formData.confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
      if (formData.password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });
      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').insert([{
          id: authData.user.id,
          full_name: formData.name,
          location: `${formData.district}, ${formData.state}`,
          soil_type: formData.soilType,
          land_size: `${formData.landSize} Acres`,
          irrigation: formData.irrigation,
          season: getSeason(formData.state),
        }]);
        if (profileError) throw profileError;
        setSuccessMsg('Account created! Taking you home…');
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  // Colors
  const textPrimary  = isDark ? '#EDF2EA' : '#1A2E16';
  const textSecond   = isDark ? 'rgba(237,242,234,0.55)' : '#5A6B54';
  const accentGreen  = isDark ? '#5CDB78' : '#2D5A27';
  const panelBg      = isDark ? '#141C10' : '#FDFAF6';
  const borderCol    = isDark ? 'rgba(255,255,255,0.08)' : '#DDD6CC';
  const inputBg      = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(246,241,235,0.7)';

  const muiInputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '14px',
      backgroundColor: inputBg,
      fontFamily: '"Inter", sans-serif',
      color: textPrimary,
      '& fieldset': { borderColor: borderCol },
      '&:hover fieldset': { borderColor: accentGreen },
      '&.Mui-focused fieldset': { borderColor: accentGreen, borderWidth: '2px' },
    },
    '& .MuiInputLabel-root': { color: textSecond },
    '& .MuiInputLabel-root.Mui-focused': { color: accentGreen },
    '& input': { color: textPrimary },
    '& .MuiAutocomplete-popupIndicator': { color: textSecond },
    '& .MuiAutocomplete-clearIndicator': { color: textSecond },
  };

  return (
    <>
      <style>{`
        .reg-page {
          min-height: 100vh;
          display: flex;
          background: ${isDark ? '#0D1208' : '#1A2E16'};
        }
        /* Left panel — photography */
        .reg-left {
          flex: 1;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 48px;
          min-height: 100vh;
        }
        .reg-left-img {
          position: absolute; inset: 0;
          background: url('https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80&w=1200') center/cover no-repeat;
        }
        .reg-left-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(13,18,8,0.88) 0%, rgba(13,18,8,0.35) 50%, rgba(13,18,8,0.12) 100%);
        }
        .reg-left-content { position: relative; z-index: 2; }
        .reg-left-steps {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 36px;
        }
        .reg-step-item {
          display: flex;
          align-items: center;
          gap: 14px;
          opacity: 0.4;
          transition: opacity 0.3s;
        }
        .reg-step-item.active { opacity: 1; }
        .reg-step-item.done { opacity: 0.7; }
        .reg-step-num {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: 1.5px solid rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Outfit', sans-serif;
          font-size: 13px; font-weight: 700;
          color: rgba(237,242,234,0.7);
          flex-shrink: 0;
        }
        .reg-step-item.active .reg-step-num {
          background: rgba(92,219,120,0.2);
          border-color: #5CDB78;
          color: #5CDB78;
        }
        .reg-step-item.done .reg-step-num {
          background: rgba(92,219,120,0.15);
          border-color: rgba(92,219,120,0.5);
          color: #5CDB78;
        }
        .reg-step-label {
          font-family: 'Outfit', sans-serif;
          font-size: 15px; font-weight: 600;
          color: #EDF2EA;
        }
        .reg-left-quote {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(24px, 2.5vw, 36px);
          font-weight: 700;
          color: #EDF2EA;
          line-height: 1.25;
          margin: 0 0 16px;
          letter-spacing: -0.3px;
        }
        .reg-left-quote em { color: #5CDB78; font-style: italic; }
        .reg-left-attr {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: rgba(237,242,234,0.45);
        }

        /* Right panel */
        .reg-right {
          width: 520px;
          flex-shrink: 0;
          background: ${panelBg};
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 56px 48px;
          position: relative;
          overflow-y: auto;
        }
        .reg-right::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 1px; height: 100%;
          background: linear-gradient(to bottom, transparent, ${borderCol}, transparent);
        }
        /* Progress bar */
        .reg-progress-wrap {
          height: 3px;
          background: ${isDark ? 'rgba(255,255,255,0.06)' : '#EDE8E2'};
          border-radius: 999px;
          margin-bottom: 40px;
          overflow: hidden;
        }
        .reg-progress-bar {
          height: 100%;
          background: ${accentGreen};
          border-radius: 999px;
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          width: ${step === 0 ? '50%' : '100%'};
        }
        /* Logo */
        .reg-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; margin-bottom: 40px;
        }
        .reg-logo-icon {
          width: 36px; height: 36px;
          background: ${isDark ? 'rgba(92,219,120,0.15)' : '#2D5A27'};
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .reg-logo-text {
          font-family: 'Playfair Display', serif;
          font-weight: 700; font-size: 20px;
          color: ${accentGreen}; letter-spacing: -0.3px;
        }
        .reg-title {
          font-family: 'Playfair Display', serif;
          font-size: 28px; font-weight: 900;
          color: ${textPrimary};
          margin: 0 0 6px; letter-spacing: -0.5px;
        }
        .reg-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 14px; color: ${textSecond};
          margin: 0 0 32px; line-height: 1.5;
        }
        /* Messages */
        .reg-error {
          background: rgba(192,57,43,0.08);
          border: 1px solid rgba(192,57,43,0.25);
          border-radius: 12px;
          padding: 12px 16px;
          font-family: 'Inter', sans-serif;
          font-size: 13px; color: #C0392B;
          margin-bottom: 20px;
        }
        .reg-success {
          background: rgba(61,122,69,0.1);
          border: 1px solid rgba(61,122,69,0.3);
          border-radius: 12px;
          padding: 12px 16px;
          font-family: 'Inter', sans-serif;
          font-size: 13px; color: ${accentGreen};
          margin-bottom: 20px;
        }
        /* Form */
        .reg-form { display: flex; flex-direction: column; gap: 18px; }
        .reg-field {}
        .reg-label {
          display: block;
          font-family: 'Outfit', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 1px; text-transform: uppercase;
          color: ${textPrimary}; margin-bottom: 8px;
        }
        .reg-input {
          width: 100%; height: 50px;
          background: ${inputBg};
          border: 1.5px solid ${borderCol};
          border-radius: 14px;
          padding: 0 16px;
          font-family: 'Inter', sans-serif;
          font-size: 14px; color: ${textPrimary};
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .reg-input::placeholder { color: ${textSecond}; }
        .reg-input:focus {
          border-color: ${accentGreen};
          box-shadow: 0 0 0 4px ${isDark ? 'rgba(92,219,120,0.1)' : 'rgba(45,90,39,0.08)'};
        }
        .reg-input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .reg-select {
          width: 100%; height: 50px;
          background: ${inputBg};
          border: 1.5px solid ${borderCol};
          border-radius: 14px;
          padding: 0 16px;
          font-family: 'Inter', sans-serif;
          font-size: 14px; color: ${textPrimary};
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235A6B54' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          box-sizing: border-box;
        }
        .reg-select:focus {
          border-color: ${accentGreen};
          box-shadow: 0 0 0 4px ${isDark ? 'rgba(92,219,120,0.1)' : 'rgba(45,90,39,0.08)'};
        }
        .reg-select option { background: ${panelBg}; color: ${textPrimary}; }
        .reg-input-wrap { position: relative; }
        .reg-input-suffix {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 700;
          color: ${textSecond};
        }
        .reg-toggle-pwd {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          font-size: 16px; color: ${textSecond};
          display: flex; align-items: center;
          transition: color 0.2s;
        }
        .reg-toggle-pwd:hover { color: ${accentGreen}; }
        .reg-hint {
          font-family: 'Inter', sans-serif;
          font-size: 11px; color: ${textSecond};
          margin-top: 4px;
        }
        /* Season read-only */
        .reg-input[readonly] {
          opacity: 0.6;
          cursor: default;
        }
        /* Buttons */
        .reg-btn-row { display: flex; gap: 12px; margin-top: 8px; }
        .reg-btn-back {
          width: 50px; height: 52px; flex-shrink: 0;
          background: ${isDark ? 'rgba(255,255,255,0.06)' : '#EDE8E2'};
          border: 1.5px solid ${borderCol};
          border-radius: 999px;
          cursor: pointer; font-size: 18px;
          display: flex; align-items: center; justify-content: center;
          color: ${textPrimary};
          transition: all 0.2s;
        }
        .reg-btn-back:hover { background: ${isDark ? 'rgba(255,255,255,0.1)' : '#E0D9CF'}; }
        .reg-btn-submit {
          flex: 1; height: 52px;
          font-family: 'Outfit', sans-serif;
          font-weight: 700; font-size: 15px;
          color: ${isDark ? '#0D1208' : '#fff'};
          background: ${isDark ? '#5CDB78' : '#2D5A27'};
          border: none; border-radius: 999px;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .reg-btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          opacity: 0.88;
        }
        .reg-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .reg-spinner {
          width: 16px; height: 16px;
          border: 2px solid ${isDark ? 'rgba(13,18,8,0.3)' : 'rgba(255,255,255,0.3)'};
          border-top-color: ${isDark ? '#0D1208' : '#fff'};
          border-radius: 50%;
          animation: rotateSlow 0.7s linear infinite;
        }
        .reg-footer-note {
          margin-top: 24px; text-align: center;
          font-family: 'Inter', sans-serif;
          font-size: 14px; color: ${textSecond};
        }
        .reg-footer-note a {
          color: ${accentGreen}; font-weight: 700;
          text-decoration: none; transition: opacity 0.2s;
        }
        .reg-footer-note a:hover { opacity: 0.7; }

        @media (max-width: 960px) {
          .reg-left { display: none; }
          .reg-right { width: 100%; min-height: 100vh; padding: 48px 28px; }
        }
        @media (max-width: 480px) {
          .reg-right { padding: 36px 20px; }
          .reg-input-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="reg-page">
        {/* Left: Photography panel */}
        <div className="reg-left">
          <div className="reg-left-img" />
          <div className="reg-left-overlay" />
          <div className="reg-left-content">
            <div className="reg-left-steps">
              {STEPS.map((s, i) => (
                <div
                  key={i}
                  className={`reg-step-item${i === step ? ' active' : i < step ? ' done' : ''}`}
                >
                  <div className="reg-step-num">
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className="reg-step-label">{s}</span>
                </div>
              ))}
            </div>
            <p className="reg-left-quote">
              "The earth is the <em>foundation</em><br />of every great harvest."
            </p>
            <p className="reg-left-attr">— SmartAgri, built for Indian soil</p>
          </div>
        </div>

        {/* Right: Form panel */}
        <div className="reg-right">
          <RouterLink to="/" className="reg-logo">
            <div className="reg-logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8 2 4 5.5 4 10c0 3.5 2 6.5 5 8.2V22h6v-3.8c3-1.7 5-4.7 5-8.2 0-4.5-4-8-8-8z" fill={isDark ? '#5CDB78' : '#fff'} fillOpacity="0.9"/>
                <path d="M12 2v20M4 10c2.5 1 5 1.5 8 1s5.5-1 8-1" stroke={isDark ? '#0D1208' : '#2D5A27'} strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="reg-logo-text">SmartAgri</span>
          </RouterLink>

          {/* Progress bar */}
          <div className="reg-progress-wrap">
            <div className="reg-progress-bar" />
          </div>

          <h1 className="reg-title">
            {step === 0 ? 'Create your account' : 'Your farm profile'}
          </h1>
          <p className="reg-subtitle">
            {step === 0
              ? 'Step 1 of 2 — Account credentials'
              : 'Step 2 of 2 — Tell us about your farm'
            }
          </p>

          {errorMsg && <div className="reg-error">⚠️ {errorMsg}</div>}
          {successMsg && <div className="reg-success">✅ {successMsg}</div>}

          <form className="reg-form" onSubmit={handleSubmit}>

            {/* ── STEP 1 ── */}
            {step === 0 && (
              <>
                <div className="reg-field">
                  <label className="reg-label" htmlFor="reg-name">Full Name</label>
                  <input id="reg-name" className="reg-input" type="text"
                    placeholder="Your full name" value={formData.name}
                    onChange={set('name')} required />
                </div>

                <div className="reg-field">
                  <label className="reg-label" htmlFor="reg-email">Email Address</label>
                  <input id="reg-email" className="reg-input" type="email"
                    placeholder="farmer@email.com" value={formData.email}
                    onChange={set('email')} required />
                </div>

                <div className="reg-field">
                  <label className="reg-label" htmlFor="reg-pwd">Password</label>
                  <div className="reg-input-wrap">
                    <input id="reg-pwd" className="reg-input" style={{ paddingRight: '44px' }}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 6 characters" value={formData.password}
                      onChange={set('password')} required minLength={6} />
                    <button type="button" className="reg-toggle-pwd"
                      onClick={() => setShowPassword(v => !v)}>
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div className="reg-field">
                  <label className="reg-label" htmlFor="reg-confirm">Confirm Password</label>
                  <input id="reg-confirm" className="reg-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-enter your password" value={formData.confirmPassword}
                    onChange={set('confirmPassword')} required />
                </div>
              </>
            )}

            {/* ── STEP 2 ── */}
            {step === 1 && (
              <>
                {/* State & District — using MUI Autocomplete for search */}
                <div className="reg-input-row">
                  <div className="reg-field">
                    <label className="reg-label">State</label>
                    <Autocomplete
                      options={indianStates}
                      value={formData.state || null}
                      onChange={(_, v) => setFormData(p => ({ ...p, state: v || '', district: '' }))}
                      sx={muiInputSx}
                      renderInput={(params) => (
                        <TextField {...params} placeholder="Search state…" required={!formData.state} />
                      )}
                    />
                  </div>
                  <div className="reg-field">
                    <label className="reg-label">District</label>
                    <Autocomplete
                      options={availableDistricts}
                      value={formData.district || null}
                      disabled={!formData.state}
                      onChange={(_, v) => setFormData(p => ({ ...p, district: v || '' }))}
                      sx={muiInputSx}
                      renderInput={(params) => (
                        <TextField {...params} placeholder={formData.state ? 'Search district…' : 'Pick state first'} required={!formData.district} />
                      )}
                    />
                  </div>
                </div>

                <div className="reg-field">
                  <label className="reg-label" htmlFor="reg-soil">Soil Type</label>
                  <select id="reg-soil" className="reg-select"
                    value={formData.soilType} onChange={set('soilType')} required>
                    <option value="" disabled>Select soil type</option>
                    {['Alluvial Soil','Black Soil','Red Soil','Laterite Soil','Sandy Soil','Clay Soil','Loamy Soil'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="reg-input-row">
                  <div className="reg-field">
                    <label className="reg-label" htmlFor="reg-land">Land Size</label>
                    <div className="reg-input-wrap">
                      <input id="reg-land" className="reg-input" style={{ paddingRight: '52px' }}
                        type="number" placeholder="2.5" min="0.01" step="any"
                        value={formData.landSize} onChange={set('landSize')} required />
                      <span className="reg-input-suffix">Acres</span>
                    </div>
                  </div>
                  <div className="reg-field">
                    <label className="reg-label" htmlFor="reg-season">Season</label>
                    <input id="reg-season" className="reg-input"
                      type="text" value={getSeason(formData.state)} readOnly
                      style={{ opacity: 0.65, cursor: 'default' }} />
                    <p className="reg-hint">Auto-detected from your state</p>
                  </div>
                </div>

                <div className="reg-field">
                  <label className="reg-label" htmlFor="reg-irr">Irrigation</label>
                  <select id="reg-irr" className="reg-select"
                    value={formData.irrigation} onChange={set('irrigation')} required>
                    <option value="" disabled>Select irrigation level</option>
                    <option value="Good Water Available">💧 Good Water Available</option>
                    <option value="Limited Water">🌦️ Limited Water</option>
                    <option value="No Irrigation">☀️ No Irrigation (Rainfed)</option>
                  </select>
                </div>
              </>
            )}

            <div className="reg-btn-row">
              {step === 1 && (
                <button type="button" className="reg-btn-back" onClick={() => setStep(0)}>
                  ←
                </button>
              )}
              <button type="submit" className="reg-btn-submit" disabled={loading}>
                {loading
                  ? <><div className="reg-spinner" /> Creating account…</>
                  : step === 0 ? 'Continue →' : 'Create Account 🌾'
                }
              </button>
            </div>
          </form>

          <p className="reg-footer-note">
            Already have an account?{' '}
            <RouterLink to="/login">Sign in</RouterLink>
          </p>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
