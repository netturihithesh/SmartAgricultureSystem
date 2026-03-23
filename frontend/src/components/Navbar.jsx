import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Agriculture as EcoIcon } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const Navbar = () => {
  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'How it Works', path: '/#how-it-works' },
    { name: 'About', path: '/#about' },
    { name: 'Contact', path: '/#contact' }
  ];
  const navigate = useNavigate();

  return (
    <AppBar position="fixed" sx={{ backgroundColor: '#ffffff', color: '#333', boxShadow: '0 0px 8px rgba(0,0,0,0.08)', height: 70, justifyContent: 'center' }}>
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

          {/* Login Button */}
          <Button 
            variant="contained"
            onClick={() => navigate('/login')} 
            sx={{ 
              backgroundColor: '#2E7D32', 
              color: '#fff', 
              fontSize: '15px', 
              '&:hover': { backgroundColor: '#1B5E20' },
              boxShadow: 'none'
            }}
          >
            Login
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
