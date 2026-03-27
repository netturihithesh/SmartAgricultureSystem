import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Agriculture as EcoIcon } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { supabase } from '../supabase';

const Navbar = () => {
  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'How it Works', path: '/how-it-works' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];
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

  return (
    <AppBar position="sticky" top={0} sx={{ backgroundColor: '#ffffff', color: '#333', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: 70, justifyContent: 'center' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between' }}>
          
          {/* Logo Area */}
          <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none' }}>
            <EcoIcon sx={{ color: '#2E7D32' }} />
            <Typography variant="h6" sx={{ color: '#2E7D32', fontWeight: 700, fontSize: '22px' }}>
              SmartAgri
            </Typography>
          </Box>

          {/* Menu Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}>
            {menuItems.map((item) => (
              <Button 
                key={item.name} 
                component={RouterLink}
                to={item.path}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                sx={{ 
                  color: '#333', 
                  fontSize: '15px', 
                  textTransform: 'none', 
                  '&:hover': { color: '#2E7D32', backgroundColor: 'transparent' }
                }}
              >
                {item.name}
              </Button>
            ))}
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {session ? (
              <>
                <Button 
                  variant="outlined"
                  onClick={() => navigate('/dashboard')} 
                  sx={{ borderColor: '#E0E0E0', color: '#333', fontSize: '14px', '&:hover': { backgroundColor: '#F5F5F5', borderColor: '#BDBDBD' }, boxShadow: 'none' }}
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
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
