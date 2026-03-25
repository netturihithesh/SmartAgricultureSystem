import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ position: 'relative' }}>
      {/* SVG Wave Divider */}
      <Box sx={{ width: '100%', overflow: 'hidden', lineHeight: 0, backgroundColor: '#FFFFFF' }}>
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ display: 'block', width: '103%', height: '64px', transform: 'rotate(180deg)' }}>
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C69.67,39.63,146.52,71.29,223.32,84.47,256.36,90.21,289.43,92.51,321.39,56.44Z" fill="url(#gradient)"></path>
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fbc02d" />
              <stop offset="100%" stopColor="#ffd54f" />
            </linearGradient>
          </defs>
        </svg>
      </Box>

      <Box sx={{ background: 'linear-gradient(135deg, #fbc02d, #ffd54f)', pt: { xs: '32px', md: '64px' }, pb: { xs: '64px', md: '64px' }, textAlign: 'center' }}>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ fontSize: '32px', color: '#111', mb: '32px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Start Smart Crop Planning Today
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/register')}
            sx={{ 
              backgroundColor: '#2E7D32', color: '#fff', py: '16px', px: '40px', borderRadius: '12px',
              fontSize: '16px', fontWeight: 700, 
              boxShadow: '0 8px 24px rgba(46, 125, 50, 0.4)',
              animation: 'pulse 2s infinite',
              transition: 'all 0.25s ease',
              '&:hover': { backgroundColor: '#1B5E20', transform: 'scale(1.02)' },
              '@keyframes pulse': {
                '0%': { boxShadow: '0 0 0 0 rgba(46, 125, 50, 0.4)' },
                '70%': { boxShadow: '0 0 0 16px rgba(46, 125, 50, 0)' },
                '100%': { boxShadow: '0 0 0 0 rgba(46, 125, 50, 0)' }
              }
            }}
          >
            Get AI Recommendation
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default CTASection;
