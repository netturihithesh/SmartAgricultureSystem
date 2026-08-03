import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, Paper, IconButton } from '@mui/material';
import {
  HomeOutlined, SpaOutlined, CalendarTodayOutlined,
  CloudOutlined, BarChartOutlined, TimelineOutlined,
  BugReportOutlined, OnlinePredictionOutlined, MenuBookOutlined,
  NotificationsNoneOutlined, PersonOutlineOutlined, FilterVintage,
  AdminPanelSettingsOutlined, LogoutOutlined, ChevronLeftOutlined, ChevronRightOutlined
} from '@mui/icons-material';
import { supabase } from '../supabase';

const Sidebar = ({ session, isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogout = async () => {
    try { await supabase.auth.signOut(); } catch {}
    navigate('/');
  };

  useEffect(() => {
    const checkAdmin = async () => {
      if (!session?.user?.id) { setIsAdmin(false); return; }
      try {
        const { data } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
        setIsAdmin(true); // OVERRIDE FOR DEMO
      } catch { setIsAdmin(true); } // OVERRIDE FOR DEMO
    };
    checkAdmin();
  }, [session]);

  const baseMenuItems = [
    { name: 'Dashboard', path: '/', icon: <HomeOutlined /> },
    { name: 'My Crops', path: '/my-crops', icon: <SpaOutlined /> },
    { name: 'Crop Calendar', path: '/calendar', icon: <CalendarTodayOutlined /> },
    { name: 'Weather', path: '/weather', icon: <CloudOutlined /> },
    { name: 'Profit Analytics', path: '/profit', icon: <BarChartOutlined /> },
    { name: 'Crop Journey', path: '/journey', icon: <TimelineOutlined /> },
    { name: 'Disease Detection', path: '/disease-detection', icon: <BugReportOutlined /> },
    { name: 'Crop Prediction', path: '/recommendation', icon: <OnlinePredictionOutlined /> },
    { name: 'Profile', path: '/profile', icon: <PersonOutlineOutlined /> },
  ];

  if (isAdmin) {
    baseMenuItems.push({ name: 'Admin Panel', path: '/admin', icon: <AdminPanelSettingsOutlined /> });
  }

  const menuItems = baseMenuItems;

  const isActive = (path) => {
    if (path === '/' && (location.pathname === '/' || location.pathname === '/dashboard')) return true;
    return location.pathname === path;
  };

  return (
    <Box
      sx={{
        width: isCollapsed ? 80 : 250,
        minWidth: isCollapsed ? 80 : 250,
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        bgcolor: '#FFFFFF',
        borderRight: '1px solid #F1F5F9',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: isCollapsed ? 1.5 : 2.5,
        zIndex: 1200,
        overflowY: 'auto',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Top Logo & Menu */}
      <Box>
        {/* Brand Logo */}
        <Box 
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: isCollapsed ? 'column' : 'row', mb: 3.5, px: isCollapsed ? 0 : 1, gap: isCollapsed ? 2 : 0 }}
        >
          <Box 
            onClick={() => navigate('/')} 
            sx={{ display: 'flex', alignItems: 'center', gap: 1.2, cursor: 'pointer' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img src="/favicon.png" alt="SmartAgri Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            </Box>
            {!isCollapsed && (
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '20px', letterSpacing: '-0.5px' }}>
                SmartAgri
              </Typography>
            )}
          </Box>
          <IconButton onClick={() => setIsCollapsed(!isCollapsed)} size="small" sx={{ color: '#64748B', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', '&:hover': { bgcolor: '#F1F5F9' } }}>
            {isCollapsed ? <ChevronRightOutlined fontSize="small" /> : <ChevronLeftOutlined fontSize="small" />}
          </IconButton>
        </Box>

        {/* Navigation Items */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
          {menuItems.map((item, idx) => {
            const active = isActive(item.path);
            return (
              <Box
                key={idx}
                onClick={() => item.path !== '#' && navigate(item.path)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed ? 'center' : 'space-between',
                  px: isCollapsed ? 0 : 2,
                  py: 1.1,
                  borderRadius: '14px',
                  cursor: 'pointer',
                  bgcolor: active ? '#ECFDF5' : 'transparent',
                  color: active ? '#059669' : '#475569',
                  fontWeight: active ? 800 : 600,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: active ? '#ECFDF5' : '#F8FAFC',
                    color: active ? '#059669' : '#0F172A'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: isCollapsed ? 'center' : 'flex-start', width: '100%' }}>
                  <Box sx={{ color: active ? '#059669' : '#64748B', display: 'flex', fontSize: 20 }}>
                    {item.icon}
                  </Box>
                  {!isCollapsed && (
                    <Typography variant="body2" sx={{ fontSize: '13.5px', fontWeight: active ? 800 : 600 }}>
                      {item.name}
                    </Typography>
                  )}
                </Box>
                {!isCollapsed && item.badge && (
                  <Box sx={{ bgcolor: '#059669', color: '#fff', fontSize: '11px', fontWeight: 800, px: 1, py: 0.2, borderRadius: '10px' }}>
                    {item.badge}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Logout Section */}
      <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #F1F5F9' }}>
        <Box
          onClick={handleLogout}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: 1.5,
            px: isCollapsed ? 0 : 2,
            py: 1.1,
            borderRadius: '14px',
            cursor: 'pointer',
            color: '#EF4444',
            fontWeight: 600,
            transition: 'all 0.15s ease',
            '&:hover': {
              bgcolor: '#FEF2F2',
            }
          }}
        >
          <Box sx={{ display: 'flex', fontSize: 20 }}>
            <LogoutOutlined />
          </Box>
          {!isCollapsed && (
            <Typography variant="body2" sx={{ fontSize: '13.5px', fontWeight: 600 }}>
              Logout
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;
