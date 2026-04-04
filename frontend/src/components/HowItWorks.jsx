import React from 'react';
import { Box, Typography, Container, Stack, Card } from '@mui/material';
import { 
  Login, 
  PlaylistAddCheck, 
  Insights 
} from '@mui/icons-material';

const HowItWorks = () => {
  const steps = [
    { 
      title: 'Step 1: Login', 
      desc: 'Create an account or login to access your personalized farming dashboard.',
      icon: <Login sx={{ fontSize: 40 }} />,
      color: '#16a34a'
    },
    { 
      title: 'Step 2: Select / Add Crop', 
      desc: 'Use AI to predict the best crop or manually add your current cultivation.',
      icon: <PlaylistAddCheck sx={{ fontSize: 40 }} />,
      color: '#3b82f6'
    },
    { 
      title: 'Step 3: Track & Grow', 
      desc: 'Follow the crop process, track growth stages, and maximize your profit.',
      icon: <Insights sx={{ fontSize: 40 }} />,
      color: '#f59e0b'
    }
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#f8fafc' }}>
      <Container maxWidth="lg">
        <Typography 
          variant="h2" 
          sx={{ 
            textAlign: 'center', 
            fontWeight: 900, 
            color: '#1e293b', 
            mb: 8,
            fontSize: { xs: '32px', md: '48px' } 
          }}
        >
          Your Journey to <Box component="span" sx={{ color: '#16a34a' }}>Smart Farming</Box>
        </Typography>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
          gap: 6,
          position: 'relative'
        }}>
          {/* Connector Line (Desktop) */}
          <Box sx={{ 
            display: { xs: 'none', md: 'block' },
            position: 'absolute',
            top: '40px',
            left: '15%',
            right: '15%',
            height: '2px',
            bgcolor: '#e2e8f0',
            zIndex: 0,
            backgroundImage: 'linear-gradient(to right, transparent, #cbd5e1 50%, transparent)',
          }} />

          {steps.map((step, i) => (
            <Box key={i} sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <Box sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                bgcolor: '#fff', 
                color: step.color, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                mx: 'auto',
                mb: 4,
                boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                border: '2px solid #f1f5f9'
              }}>
                {step.icon}
              </Box>
              <Typography 
                variant="h5" 
                sx={{ color: '#1e293b', fontWeight: 800, mb: 2 }}
              >
                {step.title}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ color: '#64748b', fontWeight: 500, lineHeight: 1.6, px: 2 }}
              >
                {step.desc}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default HowItWorks;

