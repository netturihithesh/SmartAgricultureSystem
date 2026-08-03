import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { supabase } from '../supabase';
import { useColorMode } from '../context/ThemeContext';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const { mode, toggleColorMode } = useColorMode();
  const isDark = mode === 'dark';
  const navigate = useNavigate();
  const location = useLocation();

  const checkAdmin = async (currentSession) => {
    if (!currentSession) { setIsAdmin(false); return; }
    try {
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', currentSession.user.id)
        .single();
      setIsAdmin(true); // OVERRIDE FOR DEMO
    } catch { setIsAdmin(true); } // OVERRIDE FOR DEMO
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkAdmin(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      checkAdmin(s);
    });
    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  // Close user dropdown menu on route change
  useEffect(() => {
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Close user dropdown menu on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [userMenuOpen]);

  const handleLogout = async () => {
    setLogoutDialogOpen(false);
    try { await supabase.auth.signOut(); } catch {}
    navigate('/');
  };

  const sessionItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Weather', path: '/weather' },
    { name: 'Profit Snapshot', path: '/profit' },
    { name: 'Crop Calendar', path: '/calendar' },
    { name: 'Predict Crop', path: '/recommendation' },
  ];
  
  if (isAdmin) {
    sessionItems.push({ name: 'Admin Controls', path: '/admin' });
  }

  const menuItems = session ? sessionItems : [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;

  const getInitials = () => {
    if (!session?.user?.email) return 'US';
    const emailName = session.user.email.split('@')[0];
    return emailName.slice(0, 2).toUpperCase();
  };

  // Color tokens
  const accentGreen = isDark ? '#5CDB78' : '#2D5A27';
  const navBg = isDark ? '#0D1208' : '#FDFAF6';
  const textCol = isDark ? '#EDF2EA' : '#1E2B1A';
  const borderCol = isDark ? 'rgba(255,255,255,0.06)' : '#E8E2D9';

  return (
    <>
      <style>{`
        .sa-navbar {
          position: fixed;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 48px);
          max-width: 1400px;
          z-index: 1200;
          background: ${isDark ? 'rgba(13,18,8,0.75)' : 'rgba(253,250,246,0.75)'};
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid ${borderCol};
          border-radius: 999px;
          box-shadow: ${scrolled
            ? isDark
              ? '0 6px 24px rgba(0,0,0,0.3)'
              : '0 6px 20px rgba(0,0,0,0.06)'
            : '0 4px 15px rgba(0,0,0,0.04)'};
          transition: all 0.3s ease;
        }
        .sa-nav-inner {
          max-width: 1350px;
          margin: 0 auto;
          padding: 0 24px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }
        .sa-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .sa-logo-emoji {
          font-size: 24px;
          transition: transform 0.3s ease;
          display: inline-block;
        }
        .sa-logo:hover .sa-logo-emoji {
          transform: rotate(12deg) scale(1.1);
        }
        .sa-logo-text {
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          font-size: 22px;
          background: ${isDark 
            ? 'linear-gradient(135deg, #5CDB78 0%, #A2F0B5 100%)' 
            : 'linear-gradient(135deg, #2D5A27 0%, #459E3F 100%)'};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.5px;
          line-height: 1;
        }
        .sa-nav-links {
          display: flex;
          align-items: center;
          gap: 28px;
          list-style: none;
          margin: 0; 
          padding: 0;
          background: transparent;
          border: none;
          border-radius: 0;
          justify-content: center;
        }
        .sa-nav-link {
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 15px;
          color: ${isDark ? 'rgba(255,255,255,0.7)' : 'rgba(30,43,26,0.7)'};
          text-decoration: none;
          padding: 6px 0;
          border-radius: 0;
          position: relative;
          transition: color 0.25s ease;
        }
        .sa-nav-link:hover {
          color: ${isDark ? '#5CDB78' : '#2D5A27'};
          background: transparent;
        }
        .sa-nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 3px;
          background-color: ${isDark ? '#5CDB78' : '#2D5A27'};
          transform: scaleX(0);
          transform-origin: bottom center;
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sa-nav-link:hover::after {
          transform: scaleX(0.5);
        }
        .sa-nav-link.active {
          color: ${isDark ? '#5CDB78' : '#2D5A27'};
          background: transparent;
          box-shadow: none;
          font-weight: 700;
        }
        .sa-nav-link.active::after {
          transform: scaleX(1);
        }
        .sa-nav-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .sa-btn-ghost {
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 14px;
          color: ${textCol};
          background: none;
          border: 1.5px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(45,90,39,0.25)'};
          border-radius: 999px;
          padding: 8px 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          line-height: 1;
        }
        .sa-btn-ghost:hover {
          border-color: ${accentGreen};
          color: ${accentGreen};
          background: ${isDark ? 'rgba(92,219,120,0.07)' : 'rgba(45,90,39,0.05)'};
        }
        .sa-btn-cta {
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: 14px;
          color: ${isDark ? '#0D1208' : '#fff'};
          background: ${isDark ? '#5CDB78' : '#2D5A27'};
          border: none;
          border-radius: 999px;
          padding: 10px 24px;
          cursor: pointer;
          transition: all 0.25s ease;
          line-height: 1;
          position: relative;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .sa-btn-cta:hover { 
          transform: translateY(-2px);
          box-shadow: 0 4px 12px ${isDark ? 'rgba(92,219,120,0.2)' : 'rgba(45,90,39,0.2)'};
        }
        .sa-btn-cta:hover .sa-arrow-icon {
          transform: translateX(4px);
        }
        .sa-btn-danger {
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 14px;
          color: ${textCol};
          background: none;
          border: 1.5px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(45,90,39,0.25)'};
          border-radius: 999px;
          padding: 8px 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          line-height: 1;
        }
        .sa-btn-danger:hover {
          border-color: ${accentGreen};
          color: ${accentGreen};
        }
        .sa-theme-toggle {
          width: 38px; height: 38px;
          border-radius: 10px;
          background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(45,90,39,0.07)'};
          border: 1.5px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(45,90,39,0.12)'};
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: ${textCol};
          font-size: 16px;
        }
        .sa-theme-toggle:hover {
          background: ${isDark ? 'rgba(92,219,120,0.1)' : 'rgba(45,90,39,0.1)'};
          border-color: ${accentGreen};
          transform: rotate(15deg) scale(1.05);
        }
        /* Hamburger */
        .sa-hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          background: none;
          border: none;
          padding: 8px;
          border-radius: 8px;
          transition: background 0.2s;
        }
        .sa-hamburger:hover { background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(45,90,39,0.07)'}; }
        .sa-hamburger span {
          display: block;
          width: 24px; height: 2px;
          background: ${textCol};
          border-radius: 2px;
          transition: all 0.3s ease;
        }
        .sa-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .sa-hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .sa-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        /* Mobile Drawer */
        .sa-drawer-overlay {
          position: fixed; inset: 0;
          background: rgba(13,18,8,0.5);
          backdrop-filter: blur(4px);
          z-index: 1199;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.35s ease;
        }
        .sa-drawer-overlay.open { opacity: 1; pointer-events: all; }
        .sa-drawer {
          position: fixed;
          top: 0; right: 0;
          width: min(360px, 100vw);
          height: 100vh;
          background: ${isDark ? '#0D1208' : '#FDFAF6'};
          z-index: 1300;
          transform: translateX(100%);
          transition: transform 0.4s cubic-bezier(0.32, 0, 0.15, 1);
          display: flex; flex-direction: column;
          border-left: 1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(45,90,39,0.1)'};
        }
        .sa-drawer.open { transform: translateX(0); }
        @media (min-width: 1024px) {
          .sa-drawer, .sa-drawer-overlay { display: none !important; }
        }
        .sa-drawer-head {
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 20px 28px;
          border-bottom: 1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#DDD6CC'};
        }
        .sa-drawer-close {
          width: 36px; height: 36px;
          border-radius: 8px;
          background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(45,90,39,0.07)'};
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: ${textCol}; font-size: 20px;
          transition: background 0.2s;
        }
        .sa-drawer-close:hover { background: ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(45,90,39,0.12)'}; }
        .sa-drawer-links {
          flex: 1;
          padding: 20px 16px;
          display: flex; flex-direction: column; gap: 4px;
          overflow-y: auto;
        }
        .sa-drawer-link {
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 17px;
          color: ${textCol};
          text-decoration: none;
          padding: 14px 16px;
          border-radius: 12px;
          transition: all 0.2s ease;
          display: flex; align-items: center; gap: 10px;
          opacity: 0.8;
        }
        .sa-drawer-link:hover, .sa-drawer-link.active {
          background: ${isDark ? 'rgba(92,219,120,0.08)' : 'rgba(45,90,39,0.06)'};
          color: ${accentGreen};
          opacity: 1;
        }
        .sa-drawer-link .arrow {
          margin-left: auto;
          opacity: 0.3;
          transition: opacity 0.2s, transform 0.2s;
        }
        .sa-drawer-link:hover .arrow {
          opacity: 1;
          transform: translateX(4px);
        }
        .sa-drawer-foot {
          padding: 20px 24px;
          border-top: 1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#DDD6CC'};
          display: flex; flex-direction: column; gap: 10px;
        }
        .sa-drawer-cta {
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: 15px;
          color: ${isDark ? '#0D1208' : '#fff'};
          background: ${isDark ? '#5CDB78' : '#2D5A27'};
          border: none;
          border-radius: 999px;
          padding: 14px 24px;
          cursor: pointer;
          width: 100%;
          transition: opacity 0.2s;
        }
        .sa-drawer-cta:hover { opacity: 0.9; }
        .sa-drawer-outline {
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 15px;
          color: ${textCol};
          background: transparent;
          border: 1.5px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#DDD6CC'};
          border-radius: 999px;
          padding: 13px 24px;
          cursor: pointer;
          width: 100%;
          transition: all 0.2s;
        }
        .sa-drawer-outline:hover {
          border-color: ${accentGreen};
          color: ${accentGreen};
        }

        /* Logout dialog */
        .sa-dialog-overlay {
          position: fixed; inset: 0;
          background: rgba(13,18,8,0.5);
          backdrop-filter: blur(6px);
          z-index: 2000;
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          animation: fadeInUp 0.2s ease;
        }
        .sa-dialog {
          background: ${isDark ? '#141C10' : '#FDFAF6'};
          border-radius: 24px;
          padding: 36px;
          max-width: 400px; width: 100%;
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#DDD6CC'};
          box-shadow: 0 32px 80px rgba(13,18,8,0.3);
        }
        .sa-dialog h3 {
          font-family: 'Playfair Display', serif;
          font-size: 24px; font-weight: 700;
          color: ${isDark ? '#EDF2EA' : '#1E2B1A'};
          margin: 0 0 10px;
        }
        .sa-dialog p {
          font-family: 'Inter', sans-serif;
          font-size: 14px; line-height: 1.6;
          color: ${isDark ? '#8FA886' : '#5A6B54'};
          margin: 0 0 28px;
        }
        .sa-dialog-actions { display: flex; gap: 12px; }
        .sa-dialog-cancel {
          flex: 1;
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 14px;
          color: ${isDark ? '#EDF2EA' : '#1E2B1A'};
          background: ${isDark ? 'rgba(255,255,255,0.06)' : '#EDE8E2'};
          border: none; border-radius: 999px;
          padding: 12px; cursor: pointer;
          transition: opacity 0.2s;
        }
        .sa-dialog-cancel:hover { opacity: 0.8; }
        .sa-dialog-confirm {
          flex: 1;
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: 14px;
          color: ${isDark ? '#0D1208' : '#fff'};
          background: ${isDark ? '#5CDB78' : '#2D5A27'};
          border: none; border-radius: 999px;
          padding: 12px; cursor: pointer;
          transition: all 0.2s;
        }
        .sa-dialog-confirm:hover { opacity: 0.85; transform: translateY(-1px); }

        /* User Dropdown Menu */
        .sa-user-menu-container {
          position: relative;
          display: inline-block;
        }
        .sa-user-menu-trigger {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          color: ${isDark ? '#5CDB78' : '#2D5A27'};
          background: ${isDark ? 'rgba(92,219,120,0.08)' : 'rgba(45,90,39,0.04)'};
          border: 1px solid ${isDark ? 'rgba(92,219,120,0.2)' : 'rgba(45,90,39,0.12)'};
          cursor: pointer;
          transition: all 0.25s ease;
          padding: 0;
        }
        .sa-user-menu-trigger:hover {
          background: ${isDark ? 'rgba(92,219,120,0.15)' : 'rgba(45,90,39,0.08)'};
          border-color: ${accentGreen};
          transform: scale(1.04);
        }
        .sa-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: ${isDark ? '#5CDB78' : '#2D5A27'};
          color: ${isDark ? '#0D1208' : '#FDFAF6'};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
          transition: transform 0.3s ease;
        }
        .sa-user-menu-trigger:hover .sa-avatar {
          transform: scale(1.08);
        }
        .sa-user-menu-name {
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .sa-chevron {
          transition: transform 0.3s ease;
          opacity: 0.8;
          color: ${isDark ? '#5CDB78' : '#2D5A27'};
        }
        .sa-user-menu-trigger:hover .sa-chevron {
          transform: translateY(1px);
        }
        .sa-chevron.open {
          transform: rotate(180deg) !important;
        }
        .sa-user-menu-trigger:hover .sa-chevron.open {
          transform: rotate(180deg) translateY(-1px);
        }
        .sa-user-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 210px;
          background: ${navBg};
          border: 1px solid ${borderCol};
          border-radius: 16px;
          box-shadow: ${isDark ? '0 10px 30px rgba(0,0,0,0.4)' : '0 10px 30px rgba(0,0,0,0.06)'};
          padding: 8px;
          z-index: 1210;
          animation: saFadeInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: top right;
        }
        @keyframes saFadeInUp {
          from {
            opacity: 0;
            transform: translateY(6px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .sa-dropdown-header {
          padding: 8px 12px;
        }
        .sa-dropdown-email {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: ${textCol};
          opacity: 0.9;
          word-break: break-all;
        }
        .sa-dropdown-role {
          font-family: 'Outfit', sans-serif;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: ${accentGreen};
          margin-top: 4px;
        }
        .sa-dropdown-divider {
          height: 1px;
          background: ${borderCol};
          margin: 6px 0;
        }
        .sa-dropdown-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .sa-dropdown-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          border: none;
          background: none;
          font-family: 'Outfit', sans-serif;
          font-weight: 500;
          font-size: 14px;
          color: ${textCol};
          text-align: left;
          cursor: pointer;
          border-radius: 10px;
          transition: all 0.2s ease;
        }
        .sa-dropdown-item:hover {
          background: ${isDark ? 'rgba(92,219,120,0.1)' : 'rgba(45,90,39,0.05)'};
          color: ${accentGreen};
        }
        .sa-dropdown-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          color: inherit;
          opacity: 0.8;
        }
        .sa-logout-item {
          color: ${isDark ? 'rgba(255,255,255,0.6)' : 'rgba(30,43,26,0.6)'};
        }
        .sa-logout-item:hover {
          color: ${isDark ? '#FFFFFF' : '#1E2B1A'};
          background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'};
        }

        @media (min-width: 1024px) {
          .sa-theme-toggle-desktop-hide {
            display: none !important;
          }
        }

        @media (max-width: 1023px) {
          .sa-nav-links, .sa-nav-desktop-auth { display: none !important; }
          .sa-hamburger { display: flex !important; }
        }
        @media (max-width: 600px) {
          .sa-nav-inner { padding: 0 20px; }
        }
      `}</style>

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className="sa-navbar">
        <div className="sa-nav-inner">

          {/* Logo */}
          <RouterLink to="/" className="sa-logo">
            <img src="/favicon.png" alt="SmartAgri Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            <span className="sa-logo-text">SmartAgri</span>
          </RouterLink>

          {/* Desktop links */}
          <ul className="sa-nav-links">
            {menuItems.map((item) => (
              <li key={item.name}>
                <RouterLink
                  to={item.path}
                  className={`sa-nav-link${isActive(item.path) ? ' active' : ''}`}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  {item.name}
                </RouterLink>
              </li>
            ))}
          </ul>

          {/* Right side */}
          <div className="sa-nav-right">
            {/* Desktop auth — hidden on mobile */}
            <div className="sa-nav-desktop-auth" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {session ? (
                <div className="sa-user-menu-container" ref={userMenuRef}>
                  <button 
                    className="sa-user-menu-trigger" 
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    aria-label="User menu"
                  >
                    <div className="sa-avatar">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                  </button>
                  
                  {userMenuOpen && (
                    <div className="sa-user-dropdown">
                      <div className="sa-dropdown-header">
                        <div className="sa-dropdown-email">{session?.user?.email}</div>
                        <div className="sa-dropdown-role">{isAdmin ? 'Administrator' : 'Farmer'}</div>
                      </div>
                      <div className="sa-dropdown-divider" />
                      <ul className="sa-dropdown-list">
                        <li>
                          <button className="sa-dropdown-item" onClick={() => navigate('/dashboard')}>
                            <span className="sa-dropdown-icon">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="9" />
                                <rect x="14" y="3" width="7" height="5" />
                                <rect x="14" y="12" width="7" height="9" />
                                <rect x="3" y="16" width="7" height="5" />
                              </svg>
                            </span>
                            <span>Dashboard</span>
                          </button>
                        </li>
                        {isAdmin && (
                          <li>
                            <button className="sa-dropdown-item" onClick={() => navigate('/admin')}>
                              <span className="sa-dropdown-icon">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                </svg>
                              </span>
                              <span>Admin Panel</span>
                            </button>
                          </li>
                        )}
                        <div className="sa-dropdown-divider" />
                        <li>
                          <button className="sa-dropdown-item sa-logout-item" onClick={() => setLogoutDialogOpen(true)}>
                            <span className="sa-dropdown-icon">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                              </svg>
                            </span>
                            <span>Sign Out</span>
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button className="sa-btn-ghost" onClick={() => navigate('/login')}>Log in</button>
                  <button className="sa-btn-cta" onClick={() => navigate('/register')}>
                    Get Started
                    <span className="sa-arrow-icon" style={{ marginLeft: '6px', transition: 'transform 0.2s ease', display: 'inline-block' }}>→</span>
                  </button>
                </>
              )}
            </div>

            {/* Hamburger */}
            <button
              className={`sa-hamburger${drawerOpen ? ' open' : ''}`}
              onClick={() => setDrawerOpen(!drawerOpen)}
              aria-label="Toggle menu"
            >
              <span/><span/><span/>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer ───────────────────────────────────────────────── */}
      <div
        className={`sa-drawer-overlay${drawerOpen ? ' open' : ''}`}
        onClick={() => setDrawerOpen(false)}
      />
      <div className={`sa-drawer${drawerOpen ? ' open' : ''}`} role="dialog" aria-modal="true">
        <div className="sa-drawer-head">
          <RouterLink to="/" className="sa-logo" onClick={() => setDrawerOpen(false)}>
            <div className="sa-logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8 2 4 5.5 4 10c0 3.5 2 6.5 5 8.2V22h6v-3.8c3-1.7 5-4.7 5-8.2 0-4.5-4-8-8-8z" fill={isDark ? '#5CDB78' : '#fff'} fillOpacity="0.9"/>
                <path d="M12 2v20M4 10c2.5 1 5 1.5 8 1s5.5-1 8-1" stroke={isDark ? '#0D1208' : '#2D5A27'} strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="sa-logo-text">SmartAgri</span>
          </RouterLink>
          <button className="sa-drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu">✕</button>
        </div>

        <div className="sa-drawer-links">
          {menuItems.map((item, i) => (
            <RouterLink
              key={item.name}
              to={item.path}
              className={`sa-drawer-link${isActive(item.path) ? ' active' : ''}`}
              onClick={() => { setDrawerOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {item.name}
              <span className="arrow">→</span>
            </RouterLink>
          ))}
          {session && (
            <RouterLink
              to="/dashboard"
              className="sa-drawer-link"
              onClick={() => setDrawerOpen(false)}
            >
              Dashboard
              <span className="arrow">→</span>
            </RouterLink>
          )}
        </div>

        <div className="sa-drawer-foot">
          {session ? (
            <>
              {isAdmin && (
                <button className="sa-drawer-outline" onClick={() => { setDrawerOpen(false); navigate('/admin'); }}>
                  Admin Panel
                </button>
              )}
              <button className="sa-drawer-outline" style={{ fontWeight: 700 }} onClick={() => { setDrawerOpen(false); setLogoutDialogOpen(true); }}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button className="sa-drawer-outline" onClick={() => { setDrawerOpen(false); navigate('/login'); }}>Log in</button>
              <button className="sa-drawer-cta" onClick={() => { setDrawerOpen(false); navigate('/register'); }}>Get Started Free</button>
            </>
          )}
        </div>
      </div>

      {/* ── Logout Dialog ──────────────────────────────────────────────── */}
      {logoutDialogOpen && (
        <div className="sa-dialog-overlay" onClick={() => setLogoutDialogOpen(false)}>
          <div className="sa-dialog" onClick={e => e.stopPropagation()}>
            <h3>Ready to leave?</h3>
            <p>You'll be signed out of your SmartAgri account. Your farm data and crop history will be safely saved.</p>
            <div className="sa-dialog-actions">
              <button className="sa-dialog-cancel" onClick={() => setLogoutDialogOpen(false)}>Stay</button>
              <button className="sa-dialog-confirm" onClick={handleLogout}>Yes, Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
