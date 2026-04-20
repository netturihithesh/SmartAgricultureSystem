import React from 'react';
import { Box, Typography, Container, Card, Button } from '@mui/material';
import {
  Grass as SproutIcon, Timeline as TrendingUpIcon, MonetizationOn as AttachMoneyIcon,
  Cloud as CloudIcon, Science as ScienceIcon, Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useColorMode } from '../context/ThemeContext';

const FeaturesPage = () => {
  const navigate = useNavigate();
  const { mode } = useColorMode();
  const isDark = mode === 'dark';

  const bgDefault = isDark ? '#0A0D0B' : '#ffffff';
  const bgPaper = isDark ? '#0A0D0B' : '#ffffff';
  const textPrimary = isDark ? '#e2e8f0' : '#1e293b';
  const textSecondary = isDark ? '#94a3b8' : '#475569';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e8ecea';
  const altBg = isDark ? '#0A0D0B' : '#f7faf8';
  const accentColor = isDark ? '#39FF6A' : '#2E7D32';

  const features = [
    { title: 'Crop Recommendation', description: 'Suggests optimal crops using soil & climate datasets', icon: <SproutIcon sx={{ fontSize: 20, color: '#2E7D32' }} />, color: isDark ? '#334d3d' : '#E8F5E9' },
    { title: 'Yield Prediction', description: 'Forecast expected production volume', icon: <TrendingUpIcon sx={{ fontSize: 20, color: '#42a5f5' }} />, color: isDark ? '#0d1f2d' : '#E3F2FD' },
    { title: 'Profit Estimation', description: 'Estimate revenue based on trends & analytics', icon: <AttachMoneyIcon sx={{ fontSize: 20, color: '#F9A825' }} />, color: isDark ? '#2a2000' : '#FFFDE7' },
    { title: 'Climate Pattern Analysis', description: 'Analyze rainfall & temperature variability', icon: <CloudIcon sx={{ fontSize: 20, color: '#29b6f6' }} />, color: isDark ? '#0a1929' : '#E1F5FE' },
    { title: 'Fertilizer Optimization', description: 'Provide nutrient recommendations', icon: <ScienceIcon sx={{ fontSize: 20, color: '#ab47bc' }} />, color: isDark ? '#1c0b29' : '#F3E5F5' },
    { title: 'Smart Analytics Dashboard', description: 'Visual insights through charts & comparisons', icon: <DashboardIcon sx={{ fontSize: 20, color: '#ef5350' }} />, color: isDark ? '#2d0a0a' : '#FFEBEE' }
  ];

  return (
    <Box sx={{ width: '100%', backgroundColor: bgDefault, minHeight: '100vh' }}>

      {/* Header */}
      <Box sx={{ pt: { xs: '110px', md: '130px' }, pb: '40px', backgroundColor: altBg, textAlign: 'center', borderBottom: `1px solid ${borderColor}` }}>
        <Container maxWidth="md">
          <Typography variant="h1" sx={{ fontSize: { xs: '32px', md: '40px' }, fontWeight: 700, color: textPrimary, mb: '16px', letterSpacing: '-0.5px' }}>
            Powerful AI Features for Smart Farming
          </Typography>
          <Typography sx={{ fontSize: '16px', color: textSecondary, maxWidth: '700px', mx: 'auto', lineHeight: 1.6 }}>
            SmartAgri provides intelligent tools to optimize crop planning, improve productivity, and enable data-driven agricultural decisions.
          </Typography>
        </Container>
      </Box>

      {/* Features Grid */}
      <Box sx={{ py: '50px' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: '28px' }}>
            {features.map((feature, i) => (
              <Card key={i} elevation={0} sx={{
                p: '24px', borderRadius: '14px', backgroundColor: bgPaper,
                border: `1px solid ${borderColor}`,
                backdropFilter: isDark ? 'blur(10px)' : 'none',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: isDark ? '0 12px 24px rgba(0,0,0,0.6)' : '0 12px 24px rgba(0,0,0,0.06)' }
              }}>
                <Box sx={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: feature.color, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: '20px' }}>
                  {feature.icon}
                </Box>
                <Typography variant="h3" sx={{ fontSize: '17px', fontWeight: 600, color: textPrimary, mb: '8px' }}>{feature.title}</Typography>
                <Typography sx={{ fontSize: '14px', color: textSecondary, lineHeight: 1.5 }}>{feature.description}</Typography>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

    </Box>
  );
};

export default FeaturesPage;
