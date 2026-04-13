import React, { useState, useEffect } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, Box, Container, Dialog, 
  DialogTitle, DialogContent, DialogContentText, DialogActions, 
  Tooltip, IconButton, Drawer, List, ListItem, ListItemButton, 
  ListItemText, useTheme 
} from '@mui/material';
import { 
  Agriculture as EcoIcon, Menu as MenuIcon, Close as CloseIcon 
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { supabase } from '../supabase';
import { useColorMode } from '../context/ThemeContext';



const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { mode, toggleColorMode } = useColorMode();
  const theme = useTheme();
  const isDark = mode === 'dark';
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

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
    try {
      setLogoutDialogOpen(false); // Close the dialog immediately
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Sign out error", e);
    } finally {
      // Force navigation back to the Marketing layout unconditionally
      navigate('/');
    }
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
          height: '70px',
          justifyContent: 'center',
          transition: 'background-color 0.3s ease',
          zIndex: theme.zIndex.drawer + 2
        }}
      >
        <Container maxWidth={false} sx={{ maxWidth: '1200px', px: { xs: '24px', lg: '48px' } }}>
          <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px' }}>

            {/* Logo */}
            <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none' }}>
              <EcoIcon sx={{ color: '#2E7D32' }} />
              <Typography variant="h6" sx={{ color: '#2E7D32', fontWeight: 700, fontSize: '22px' }}>
                SmartAgri
              </Typography>
            </Box>

            {/* Desktop Menu Links - Centered */}
            <Box sx={{ 
              position: 'absolute', left: '50%', transform: 'translateX(-50%)', 
              display: { xs: 'none', lg: 'flex' }, gap: 4, alignItems: 'center' 
            }}>
              {menuItems.map((item) => (
                <Button
                  key={item.name}
                  component={RouterLink}
                  to={item.path}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  sx={{
                    color: textColor,
                    fontSize: '15px',
                    fontWeight: 600,
                    textTransform: 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': { color: '#2E7D32', backgroundColor: 'transparent', transform: 'translateY(-2px)' }
                  }}
                >
                  {item.name}
                </Button>
              ))}
            </Box>

            {/* Right side: Auth + Bulb toggle */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Desktop Auth Buttons */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1.5 }}>
                {session ? (
                  <>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/dashboard')}
                      sx={{ borderColor: '#E0E0E0', color: textColor, fontSize: '14px', textTransform: 'none', fontWeight: 700, borderRadius: '20px', px: 3, '&:hover': { backgroundColor: hoverBg, borderColor: '#BDBDBD' }, boxShadow: 'none' }}
                    >
                      Dashboard
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setLogoutDialogOpen(true)}
                      sx={{ backgroundColor: '#2E7D32', color: '#fff', fontSize: '14px', textTransform: 'none', fontWeight: 700, borderRadius: '20px', px: 3, '&:hover': { backgroundColor: '#1B5E20' }, boxShadow: 'none' }}
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => navigate('/login')}
                    sx={{ backgroundColor: '#2E7D32', color: '#fff', fontSize: '14.5px', textTransform: 'none', fontWeight: 700, borderRadius: '20px', px: 4, '&:hover': { backgroundColor: '#1B5E20' }, boxShadow: 'none' }}
                  >
                    Log in
                  </Button>
                )}
              </Box>



              {/* Mobile Hamburger */}
              <IconButton
                onClick={() => setDrawerOpen(true)}
                sx={{ display: { xs: 'flex', lg: 'none' }, color: '#2E7D32' }}
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
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: '100%', backgroundColor: drawerBg, transition: 'background-color 0.3s ease' } }}
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
                sx={{ px: 3, py: 2, minHeight: '48px', '&:hover': { backgroundColor: hoverBg, color: '#2E7D32' } }}
              >
                <ListItemText
                  primary={item.name}
                  primaryTypographyProps={{ fontSize: '18px', fontWeight: 600, color: textColor, textAlign: 'center' }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* Action Buttons within Drawer */}
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {session ? (
            <>
              <Button 
                variant="outlined"
                onClick={() => { setDrawerOpen(false); navigate('/dashboard'); }} 
                sx={{ borderColor: '#E0E0E0', color: textColor, fontSize: '14px', '&:hover': { backgroundColor: hoverBg, borderColor: '#BDBDBD' }, boxShadow: 'none' }}
              >
                Dashboard
              </Button>
              <Button 
                variant="contained"
                onClick={() => { setDrawerOpen(false); setLogoutDialogOpen(true); }} 
                sx={{ backgroundColor: '#D32F2F', color: '#fff', fontSize: '14px', '&:hover': { backgroundColor: '#B71C1C' }, boxShadow: 'none' }}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Button 
              variant="contained"
              onClick={() => { setDrawerOpen(false); navigate('/login'); }}
              sx={{ backgroundColor: '#2E7D32', color: '#fff', fontSize: '15px', fontWeight: 600, borderRadius: '8px', py: 1.1, '&:hover': { backgroundColor: '#1B5E20' }, boxShadow: 'none' }}
            >
              Log In
            </Button>
          )}
        </Box>
      </Drawer>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: '16px', padding: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#1B5E20' }}>
          Confirm Sign Out
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#555', fontWeight: 500 }}>
            Are you sure you want to sign out of your SmartAgri account? You will need to log back in to access your dashboard and crop recommendations.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button onClick={() => setLogoutDialogOpen(false)} sx={{ color: '#666', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button onClick={handleLogout} variant="contained" sx={{ backgroundColor: '#D32F2F', color: '#fff', fontWeight: 700, borderRadius: '8px', '&:hover': { backgroundColor: '#B71C1C' }, boxShadow: 'none' }}>
            Yes, Sign Out
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Navbar;
