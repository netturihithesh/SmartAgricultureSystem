import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <Box 
      sx={{ 
        minHeight: { xs: 'auto', md: '600px' },
        pt: { xs: '100px', md: '120px' },
        pb: { xs: '48px', md: '80px' },
        position: 'relative',
        backgroundImage: 'url(/assets/farm.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden'
      }}
    >
      <Box 
        sx={{ 
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.8), rgba(102, 187, 106, 0.8))',
          zIndex: 1
        }} 
      />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ maxWidth: '600px', pr: { md: '32px' } }}>
          <Typography variant="h1" sx={{ color: '#fff', fontSize: { xs: '32px', sm: '42px', md: '56px' }, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.5px' }}>
            AI-Powered Crop Planning & Profit Intelligence
          </Typography>
          <Typography sx={{ color: '#E8F5E9', fontSize: { xs: '15px', md: '18px' }, mt: { xs: '16px', md: '24px' }, lineHeight: 1.5, fontWeight: 400, opacity: 0.9 }}>
             Make data-driven farming decisions using climate analytics, soil insights, and predictive AI models.
          </Typography>
          <Box sx={{ mt: { xs: '24px', md: '32px' }, display: 'flex', gap: '16px', flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button 
              variant="contained" 
              onClick={() => navigate('/register')}
              sx={{ 
                backgroundColor: '#FBC02D', color: '#111', fontSize: '16px', fontWeight: 600, 
                height: '48px', borderRadius: '10px', px: '32px', 
                boxShadow: '0 8px 16px rgba(251, 192, 45, 0.3)',
                transition: 'all 0.25s ease',
                '&:hover': { backgroundColor: '#FFCA28', transform: 'translateY(-2px)', boxShadow: '0 12px 24px rgba(251, 192, 45, 0.4)' } 
              }}
            >
              Get Started
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/how-it-works')}
              sx={{ 
                color: '#fff', fontSize: '16px', fontWeight: 600, 
                height: '48px', borderRadius: '10px', px: '32px', 
                border: '1.5px solid rgba(255,255,255,0.6)',
                transition: 'all 0.25s ease',
                '&:hover': { 
                  borderColor: '#fff', 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-2px)'
                } 
              }}
            >
              Learn More
            </Button>
          </Box>
        </Box>
        <Box 
          sx={{ 
            display: { xs: 'none', md: 'block' }, 
            width: '460px',
            animation: 'float 6s ease-in-out infinite',
            '@keyframes float': {
              '0%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-16px)' },
              '100%': { transform: 'translateY(0px)' }
            }
          }}
        >
          <img 
            src="/hero_dashboard.jpg" 
            alt="Agriculture AI Dashboard" 
            style={{ 
              width: '100%', 
              height: 'auto', 
              maxHeight: '520px',
              objectFit: 'contain', 
              borderRadius: '24px', 
              boxShadow: '0 24px 48px rgba(0,0,0,0.5)', 
              border: '1px solid rgba(255,255,255,0.1)' 
            }} 
          />
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;
