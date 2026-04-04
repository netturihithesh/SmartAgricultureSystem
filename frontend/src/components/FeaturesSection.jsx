import React from 'react';
import { Box, Typography, Container, Card, Stack } from '@mui/material';
import { 
  AutoGraph, 
  Timeline, 
  Thunderstorm, 
  AccountBalanceWallet 
} from '@mui/icons-material';

const FeaturesSection = () => {
  const features = [
    { 
      title: 'Crop Prediction', 
      desc: 'AI-based crop recommendation using soil, irrigation, season, and weather patterns.', 
      icon: <AutoGraph sx={{ fontSize: 32 }} />,
      color: '#16a34a',
      bg: '#f0fdf4'
    },
    { 
      title: 'Crop Workflow Tracking', 
      desc: 'Track every farming stage from land preparation to harvest with real-time updates.', 
      icon: <Timeline sx={{ fontSize: 32 }} />,
      color: '#2563eb',
      bg: '#eff6ff'
    },
    { 
      title: 'Live Weather Advisory', 
      desc: 'Stage-based farming alerts and weather insights to protect your crops from nature.', 
      icon: <Thunderstorm sx={{ fontSize: 32 }} />,
      color: '#d97706',
      bg: '#fffbeb'
    },
    { 
      title: 'Profit Estimation', 
      desc: 'Expected yield, revenue, and monthly income estimation based on market rates.', 
      icon: <AccountBalanceWallet sx={{ fontSize: 32 }} />,
      color: '#7c3aed',
      bg: '#f5f3ff'
    },
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#fff' }}>
      <Container maxWidth="lg">
        <Stack spacing={2} sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="overline" 
            sx={{ color: '#16a34a', fontWeight: 900, letterSpacing: 2 }}
          >
            SMART FEATURES
          </Typography>
          <Typography 
            variant="h2" 
            sx={{ fontWeight: 900, color: '#1e293b', fontSize: { xs: '32px', md: '48px' } }}
          >
            Everything you need for <Box component="span" sx={{ color: '#16a34a' }}>Precision Farming</Box>
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
              border: '1px solid #f1f5f9',
              bgcolor: '#fff',
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-10px)', 
                boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                borderColor: feature.color + '40'
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
                sx={{ color: '#1e293b', fontWeight: 800, mb: 1.5, fontSize: '20px' }}
              >
                {feature.title}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ color: '#64748b', lineHeight: 1.6, fontWeight: 500 }}
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

