import React from 'react';
import { Box, Typography, Container, Stack, Card } from '@mui/material';
import { 
  Login, 
  PlaylistAddCheck, 
  Insights 
} from '@mui/icons-material';
import { useColorMode } from '../context/ThemeContext';

const HowItWorks = () => {
  const { mode } = useColorMode();
  const isDark = mode === 'dark';

  const sectionBg = isDark ? '#0A0D0B' : '#f8fafc';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const subTextColor = isDark ? '#94a3b8' : '#64748b';
  const accentColor = isDark ? '#39FF6A' : '#16a34a';
  const steps = [
    { 
      title: 'Step 1: Login', 
      desc: 'Create an account or login to access your personalized farming dashboard.',
      icon: <Login sx={{ fontSize: 40 }} />,
      color: isDark ? accentColor : '#16a34a'
    },
    { 
      title: 'Step 2: Select / Add Crop', 
      desc: 'Use AI to predict the best crop or manually add your current cultivation.',
      icon: <PlaylistAddCheck sx={{ fontSize: 40 }} />,
      color: isDark ? accentColor : '#3b82f6'
    },
    { 
      title: 'Step 3: Track & Grow', 
      desc: 'Follow the crop process, track growth stages, and maximize your profit.',
      icon: <Insights sx={{ fontSize: 40 }} />,
      color: isDark ? accentColor : '#f59e0b'
    }
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: sectionBg }}>
      <Container maxWidth="lg">
        <Typography 
          variant="h2" 
          sx={{ 
            textAlign: 'center', 
            fontWeight: 900, 
            color: textColor, 
            mb: 8,
            fontSize: { xs: '32px', md: '48px' } 
          }}
        >
          Your Journey to <Box component="span" sx={{ color: accentColor }}>Smart Farming</Box>
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
            bgcolor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
            zIndex: 0,
            backgroundImage: isDark ? 'linear-gradient(to right, transparent, rgba(255,255,255,0.2) 50%, transparent)' : 'linear-gradient(to right, transparent, #cbd5e1 50%, transparent)',
          }} />

          {steps.map((step, i) => (
            <Box key={i} sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <Box sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                bgcolor: isDark ? '#0A0D0B' : '#fff', 
                color: step.color, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                mx: 'auto',
                mb: 4,
                boxShadow: isDark ? '0 10px 25px rgba(0,0,0,0.5)' : '0 10px 25px rgba(0,0,0,0.05)',
                border: isDark ? '2px solid rgba(255,255,255,0.1)' : '2px solid #f1f5f9'
              }}>
                {step.icon}
              </Box>
              <Typography 
                variant="h5" 
                sx={{ color: textColor, fontWeight: 800, mb: 2 }}
              >
                {step.title}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ color: subTextColor, fontWeight: 500, lineHeight: 1.6, px: 2 }}
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

