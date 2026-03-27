import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, Container,
  IconButton, Drawer, List, ListItem, ListItemButton, ListItemText,
  Divider, Tooltip, useTheme
} from '@mui/material';
import { Agriculture as EcoIcon, Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { supabase } from '../supabase';
import { useColorMode } from '../context/ThemeContext';

// Bulb SVG that glows in light mode and is dim in dark mode
const BulbIcon = ({ isDark }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="26"
    height="26"
    style={{ transition: 'all 0.4s ease', display: 'block' }}
  >
    {/* Glow effect in light mode */}
    {!isDark && (
      <circle cx="12" cy="10" r="7" fill="rgba(251,192,45,0.18)" />
    )}
    {/* Bulb glass */}
    <path
      d="M12 2a7 7 0 0 1 4 12.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26A7 7 0 0 1 12 2z"
      fill={isDark ? '#555' : '#FBC02D'}
      style={{ transition: 'fill 0.4s ease' }}
    />
    {/* Filament lines */}
    <line x1="9" y1="17" x2="15" y2="17" stroke={isDark ? '#888' : '#E65100'} strokeWidth="1.2" strokeLinecap="round" />
    <line x1="9.5" y1="19" x2="14.5" y2="19" stroke={isDark ? '#888' : '#E65100'} strokeWidth="1.2" strokeLinecap="round" />
    <line x1="10.5" y1="21" x2="13.5" y2="21" stroke={isDark ? '#888' : '#E65100'} strokeWidth="1.2" strokeLinecap="round" />
    {/* Shine in light mode */}
    {!isDark && (
      <>
        <line x1="12" y1="0.5" x2="12" y2="1.5" stroke="#FBC02D" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="18.5" y1="3" x2="17.8" y2="3.7" stroke="#FBC02D" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="5.5" y1="3" x2="6.2" y2="3.7" stroke="#FBC02D" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="21" y1="9.5" x2="20" y2="9.5" stroke="#FBC02D" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="3" y1="9.5" x2="4" y2="9.5" stroke="#FBC02D" strokeWidth="1.5" strokeLinecap="round" />
      </>
    )}
  </svg>
);

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { mode, toggleColorMode } = useColorMode();
  const theme = useTheme();
  const isDark = mode === 'dark';
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'How it Works', path: '/how-it-works' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  const handleNavClick = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setDrawerOpen(false);
  };

  const navBg = isDark ? '#243028' : '#ffffff';
  const textColor = isDark ? '#EEE' : '#333';
  const drawerBg = isDark ? '#2a3830' : '#fff';
  const dividerColor = isDark ? '#333' : '#eee';
  const hoverBg = isDark ? '#2A3D2A' : '#F1F8E9';

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: navBg,
          color: textColor,
          boxShadow: isDark
            ? '0 0px 8px rgba(0,0,0,0.4)'
            : '0 0px 8px rgba(0,0,0,0.08)',
          height: 70,
          justifyContent: 'center',
          transition: 'background-color 0.3s ease',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

            {/* Logo */}
            <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none' }}>
              <EcoIcon sx={{ color: '#2E7D32' }} />
              <Typography variant="h6" sx={{ color: '#2E7D32', fontWeight: 700, fontSize: '22px' }}>
                SmartAgri
              </Typography>
            </Box>

            {/* Desktop Menu Links */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, alignItems: 'center' }}>
              {menuItems.map((item) => (
                <Button
                  key={item.name}
                  component={RouterLink}
                  to={item.path}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  sx={{
                    color: textColor,
                    fontSize: '15px',
                    textTransform: 'none',
                    '&:hover': { color: '#2E7D32', backgroundColor: 'transparent' }
                  }}
                >
                  {item.name}
                </Button>
              ))}
            </Box>

            {/* Right side: Auth + Bulb toggle */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Desktop Auth Buttons */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                {session ? (
                  <>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/dashboard')}
                      sx={{ borderColor: '#E0E0E0', color: textColor, fontSize: '14px', '&:hover': { backgroundColor: hoverBg, borderColor: '#BDBDBD' }, boxShadow: 'none' }}
                    >
                      Dashboard
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleLogout}
                      sx={{ backgroundColor: '#2E7D32', color: '#fff', fontSize: '14px', '&:hover': { backgroundColor: '#1B5E20' }, boxShadow: 'none' }}
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => navigate('/login')}
                    sx={{ backgroundColor: '#2E7D32', color: '#fff', fontSize: '15px', '&:hover': { backgroundColor: '#1B5E20' }, boxShadow: 'none' }}
                  >
                    Login
                  </Button>
                )}
              </Box>

              {/* Bulb Theme Toggle */}
              <Tooltip title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'} arrow>
                <IconButton
                  onClick={toggleColorMode}
                  aria-label="Toggle light/dark mode"
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    backgroundColor: isDark ? '#3d5c48' : '#FFF8E1',
                    border: isDark ? '1.5px solid #444' : '1.5px solid #FBC02D',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: isDark ? '#333' : '#FFF3CD',
                      transform: 'scale(1.1)',
                      boxShadow: isDark
                        ? '0 0 0 0 transparent'
                        : '0 0 12px rgba(251,192,45,0.6)',
                    },
                  }}
                >
                  <BulbIcon isDark={isDark} />
                </IconButton>
              </Tooltip>

              {/* Mobile Hamburger */}
              <IconButton
                onClick={() => setDrawerOpen(true)}
                sx={{ display: { xs: 'flex', md: 'none' }, color: '#2E7D32' }}
                aria-label="Open menu"
              >
                <MenuIcon fontSize="large" />
              </IconButton>
            </Box>

          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 260, backgroundColor: drawerBg, transition: 'background-color 0.3s ease' } }}
      >
        {/* Drawer Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 2, borderBottom: `1px solid ${dividerColor}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EcoIcon sx={{ color: '#2E7D32' }} />
            <Typography sx={{ color: '#2E7D32', fontWeight: 700, fontSize: '18px' }}>SmartAgri</Typography>
          </Box>
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: textColor }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Navigation Links */}
        <List sx={{ pt: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.name} disablePadding>
              <ListItemButton
                onClick={() => handleNavClick(item.path)}
                sx={{ px: 3, py: 1.5, '&:hover': { backgroundColor: hoverBg, color: '#2E7D32' } }}
              >
                <ListItemText
                  primary={item.name}
                  primaryTypographyProps={{ fontSize: '16px', fontWeight: 500, color: textColor }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 1, borderColor: dividerColor }} />

        {/* Auth in Drawer */}
        <Box sx={{ px: 3, pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {session ? (
            <>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleNavClick('/dashboard')}
                sx={{ borderColor: '#E0E0E0', color: textColor, fontSize: '15px', fontWeight: 600, borderRadius: '8px', py: 1.1 }}
              >
                Dashboard
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={handleLogout}
                sx={{ backgroundColor: '#2E7D32', color: '#fff', fontSize: '15px', fontWeight: 600, borderRadius: '8px', py: 1.1, '&:hover': { backgroundColor: '#1B5E20' }, boxShadow: 'none' }}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Button
              fullWidth
              variant="contained"
              onClick={() => handleNavClick('/login')}
              sx={{
                backgroundColor: '#2E7D32',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 600,
                borderRadius: '8px',
                py: 1.2,
                '&:hover': { backgroundColor: '#1B5E20' },
                boxShadow: 'none'
              }}
            >
              Login
            </Button>
          )}
        </Box>

        {/* Theme Toggle in Drawer */}
        <Box sx={{ px: 3, pt: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            onClick={toggleColorMode}
            sx={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              backgroundColor: isDark ? '#3d5c48' : '#FFF8E1',
              border: isDark ? '1.5px solid #444' : '1.5px solid #FBC02D',
              '&:hover': { backgroundColor: isDark ? '#333' : '#FFF3CD' },
            }}
          >
            <BulbIcon isDark={isDark} />
          </IconButton>
          <Typography sx={{ fontSize: '14px', color: textColor }}>
            {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </Typography>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
