import React, { useState, useEffect } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, Box, Container, Dialog, 
  DialogTitle, DialogContent, DialogContentText, DialogActions, 
  Tooltip, IconButton, Drawer, List, ListItem, ListItemButton, 
  ListItemText, useTheme 
} from '@mui/material';
import { 
  Agriculture as EcoIcon, Menu as MenuIcon, Close as CloseIcon,
  Lightbulb, LightbulbOutlined
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
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  const handleNavClick = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setDrawerOpen(false);
  };

  const navBg = isDark ? 'rgba(10, 13, 11, 0.85)' : '#ffffff';
  const textColor = isDark ? '#e2e8f0' : '#333';
  const drawerBg = isDark ? '#0A0D0B' : '#fff';
  const dividerColor = isDark ? 'rgba(255,255,255,0.1)' : '#eee';
  const hoverBg = isDark ? 'rgba(255,255,255,0.05)' : '#F1F8E9';
  const accentColor = isDark ? '#39FF6A' : '#2E7D32';

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
              <EcoIcon sx={{ color: accentColor }} />
              <Typography variant="h6" sx={{ color: accentColor, fontWeight: 700, fontSize: '22px' }}>
                SmartAgri
              </Typography>
            </Box>

            {/* Desktop Menu Links - Centered */}
            <Box sx={{ 
              flexGrow: 1, display: { xs: 'none', lg: 'flex' }, 
              justifyContent: 'center', gap: 4, alignItems: 'center' 
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
                    '&:hover': { color: accentColor, backgroundColor: 'transparent', transform: 'translateY(-2px)' }
                  }}
                >
                  {item.name}
                </Button>
              ))}
            </Box>

            {/* Right side: Toggle + Auth */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={toggleColorMode} sx={{ color: textColor, mr: { xs: 0, md: 1 } }}>
                {isDark ? <LightbulbOutlined /> : <Lightbulb sx={{ color: '#F9A825' }} />}
              </IconButton>
              
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
                      sx={{ backgroundColor: accentColor, color: isDark ? '#000' : '#fff', fontSize: '14px', textTransform: 'none', fontWeight: 700, borderRadius: '20px', px: 3, '&:hover': { backgroundColor: isDark ? '#2fe058' : '#1B5E20' }, boxShadow: 'none' }}
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => navigate('/login')}
                    sx={{ backgroundColor: accentColor, color: isDark ? '#000' : '#fff', fontSize: '14.5px', textTransform: 'none', fontWeight: 700, borderRadius: '20px', px: 4, '&:hover': { backgroundColor: isDark ? '#2fe058' : '#1B5E20' }, boxShadow: 'none' }}
                  >
                    Log in
                  </Button>
                )}
              </Box>



              {/* Mobile Hamburger */}
              <IconButton
                onClick={() => setDrawerOpen(true)}
                sx={{ display: { xs: 'flex', lg: 'none' }, color: accentColor }}
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
        {/* Mobile Full Screen Menu */}
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header matches top nav */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, borderBottom: `1px solid ${dividerColor}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EcoIcon sx={{ color: accentColor }} />
              <Typography variant="h6" sx={{ color: accentColor, fontWeight: 700 }}>
                SmartAgri
              </Typography>
            </Box>
            <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: textColor }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <List sx={{ pt: 2, flex: 1 }}>
            {menuItems.map((item) => (
              <ListItem key={item.name} disablePadding>
                <ListItemButton 
                  onClick={() => handleNavClick(item.path)}
                  sx={{
                    py: 2,
                    px: 3,
                    '&:hover': { backgroundColor: hoverBg }
                  }}
                >
                  <ListItemText 
                    primary={item.name} 
                    primaryTypographyProps={{ 
                      fontSize: '18px', 
                      fontWeight: 600,
                      color: textColor 
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Box sx={{ p: 3, borderTop: `1px solid ${dividerColor}` }}>
            {session ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button fullWidth variant="outlined" onClick={() => handleNavClick('/dashboard')} sx={{ py: 1.5, borderRadius: '20px', borderColor: dividerColor, color: textColor }}>
                  Dashboard
                </Button>
                <Button fullWidth variant="contained" onClick={() => { setDrawerOpen(false); setLogoutDialogOpen(true); }} sx={{ py: 1.5, borderRadius: '20px', backgroundColor: accentColor, color: isDark ? '#000' : '#fff' }}>
                  Sign Out
                </Button>
              </Box>
            ) : (
              <Button fullWidth variant="contained" onClick={() => handleNavClick('/login')} sx={{ py: 1.5, borderRadius: '20px', backgroundColor: accentColor, color: isDark ? '#000' : '#fff' }}>
                Log in
              </Button>
            )}
          </Box>
        </Box>
      </Drawer>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        PaperProps={{ 
          sx: { 
            borderRadius: '16px', 
            padding: 1,
            bgcolor: isDark ? '#0A0D0B' : '#fff',
            backgroundImage: isDark ? 'linear-gradient(to right, rgba(255,255,255,0.02), rgba(255,255,255,0.02))' : 'none',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none',
            boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.5)' : undefined
          } 
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: isDark ? '#e2e8f0' : '#1B5E20' }}>
          Confirm Sign Out
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: isDark ? '#94a3b8' : '#555', fontWeight: 500 }}>
            Are you sure you want to sign out of your SmartAgri account? You will need to log back in to access your dashboard and crop recommendations.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button onClick={() => setLogoutDialogOpen(false)} sx={{ color: isDark ? '#e2e8f0' : '#666', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button onClick={handleLogout} variant="contained" sx={{ backgroundColor: isDark ? 'rgba(239,68,68,0.2)' : '#D32F2F', color: isDark ? '#ef4444' : '#fff', border: isDark ? '1px solid rgba(239,68,68,0.5)' : 'none', fontWeight: 700, borderRadius: '8px', '&:hover': { backgroundColor: isDark ? 'rgba(239,68,68,0.3)' : '#B71C1C' }, boxShadow: 'none' }}>
            Yes, Sign Out
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Navbar;
