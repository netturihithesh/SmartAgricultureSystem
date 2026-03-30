import React from 'react';
import { Box, Typography, Container, Card, Button, useTheme } from '@mui/material';
import {
  Grass as SproutIcon, Timeline as TrendingUpIcon, MonetizationOn as AttachMoneyIcon,
  Cloud as CloudIcon, Science as ScienceIcon, Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const FeaturesPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const bgDefault = theme.palette.background.default;
  const bgPaper = theme.palette.background.paper;
  const textPrimary = theme.palette.text.primary;
  const textSecondary = theme.palette.text.secondary;
  const borderColor = isDark ? '#333' : '#e8ecea';
  const altBg = isDark ? '#243028' : '#f7faf8';

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
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: isDark ? '0 12px 24px rgba(0,0,0,0.3)' : '0 12px 24px rgba(0,0,0,0.06)' }
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

      {/* Bottom CTA */}
      <Box sx={{ py: '50px', textAlign: 'center', borderTop: `1px solid ${borderColor}` }}>
        <Container maxWidth="sm">
          <Typography variant="h2" sx={{ fontSize: '24px', fontWeight: 700, color: textPrimary, mb: '24px' }}>
            Start optimizing your farm decisions today
          </Typography>
          <Button variant="contained" onClick={() => navigate('/register')} sx={{
            backgroundColor: '#2E7D32', color: '#fff', height: '48px', px: '32px',
            borderRadius: '10px', fontSize: '15px', fontWeight: 600, textTransform: 'none',
            boxShadow: 'none', transition: 'all 0.2s ease',
            '&:hover': { backgroundColor: '#1B5E20', transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)' }
          }}>
            Get Recommendation
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default FeaturesPage;
