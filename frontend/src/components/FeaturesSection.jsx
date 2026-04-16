import React from 'react';
import { Box, Typography, Container, Card, Stack } from '@mui/material';
import { 
  AutoGraph, 
  Timeline, 
  Thunderstorm, 
  AccountBalanceWallet 
} from '@mui/icons-material';
import { useColorMode } from '../context/ThemeContext';

const FeaturesSection = () => {
  const { mode } = useColorMode();
  const isDark = mode === 'dark';

  const sectionBg = isDark ? '#0A0D0B' : '#fff';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const subTextColor = isDark ? '#94a3b8' : '#64748b';
  const accentColor = isDark ? '#39FF6A' : '#16a34a';
  const features = [
    { 
      title: 'Crop Prediction', 
      desc: 'AI-based crop recommendation using soil, irrigation, season, and weather patterns.', 
      icon: <AutoGraph sx={{ fontSize: 32 }} />,
      color: isDark ? accentColor : '#16a34a',
      bg: isDark ? 'rgba(57,255,106,0.1)' : '#f0fdf4'
    },
    { 
      title: 'Crop Workflow Tracking', 
      desc: 'Track every farming stage from land preparation to harvest with real-time updates.', 
      icon: <Timeline sx={{ fontSize: 32 }} />,
      color: isDark ? accentColor : '#2563eb',
      bg: isDark ? 'rgba(57,255,106,0.1)' : '#eff6ff'
    },
    { 
      title: 'Live Weather Advisory', 
      desc: 'Stage-based farming alerts and weather insights to protect your crops from nature.', 
      icon: <Thunderstorm sx={{ fontSize: 32 }} />,
      color: isDark ? accentColor : '#d97706',
      bg: isDark ? 'rgba(57,255,106,0.1)' : '#fffbeb'
    },
    { 
      title: 'Profit Estimation', 
      desc: 'Expected yield, revenue, and monthly income estimation based on market rates.', 
      icon: <AccountBalanceWallet sx={{ fontSize: 32 }} />,
      color: isDark ? accentColor : '#7c3aed',
      bg: isDark ? 'rgba(57,255,106,0.1)' : '#f5f3ff'
    },
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: sectionBg }}>
      <Container maxWidth="lg">
        <Stack spacing={2} sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="overline" 
            sx={{ color: accentColor, fontWeight: 900, letterSpacing: 2 }}
          >
            SMART FEATURES
          </Typography>
          <Typography 
            variant="h2" 
            sx={{ fontWeight: 900, color: textColor, fontSize: { xs: '32px', md: '48px' } }}
          >
            Everything you need for <Box component="span" sx={{ color: accentColor }}>Precision Farming</Box>
          </Typography>
        </Stack>

        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 4
        }}>
          {features.map((feature, i) => (
            <Card key={i} elevation={0} sx={{
              p: 4,
              borderRadius: '24px',
              border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9',
              bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#fff',
              transition: 'all 0.3s ease',
              backdropFilter: isDark ? 'blur(10px)' : 'none',
              '&:hover': { 
                transform: 'translateY(-10px)', 
                boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.5)' : '0 20px 40px rgba(0,0,0,0.05)',
                borderColor: isDark ? accentColor : feature.color + '40'
              },
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}>
              <Box sx={{ 
                width: 64, 
                height: 64, 
                borderRadius: '18px', 
                bgcolor: feature.bg, 
                color: feature.color, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                mb: 3 
              }}>
                {feature.icon}
              </Box>
              <Typography 
                variant="h5" 
                sx={{ color: textColor, fontWeight: 800, mb: 1.5, fontSize: '20px' }}
              >
                {feature.title}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ color: subTextColor, lineHeight: 1.8, fontSize: '15px' }}
              >
                {feature.desc}
              </Typography>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturesSection;

