import React from 'react';
import { Box, Typography, Container, Grid, Card, useTheme } from '@mui/material';
import { Grass as GrassIcon, ShowChart as ShowChartIcon, CloudQueue as CloudQueueIcon, Biotech as BiotechIcon } from '@mui/icons-material';

const FeaturesSection = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const bg = theme.palette.background.paper;
  const textPrimary = theme.palette.text.primary;
  const textSecondary = theme.palette.text.secondary;
  const border = isDark ? '#333' : '#E0E0E0';
  const iconBg = isDark ? '#334d3d' : '#E8F5E9';

  const features = [
    { title: 'Crop Recommendation Engine', desc: 'Suggests best crop using soil & climate datasets to maximize your yield.', icon: <GrassIcon sx={{ fontSize: 24 }} /> },
    { title: 'Yield & Profit Prediction', desc: 'AI estimates expected production and revenue accurately.', icon: <ShowChartIcon sx={{ fontSize: 24 }} /> },
    { title: 'Climate Data Analysis', desc: 'Predictive modeling uses historical rainfall & temperature patterns.', icon: <CloudQueueIcon sx={{ fontSize: 24 }} /> },
    { title: 'Fertilizer Optimization Model', desc: 'Smart AI logic recommends a nutrient plan based directly on soil data.', icon: <BiotechIcon sx={{ fontSize: 24 }} /> },
  ];

  return (
    <Box sx={{ py: { xs: '48px', md: '72px' }, backgroundColor: theme.palette.background.default }}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{ textAlign: 'center', color: '#1B5E20', mb: '32px', fontSize: '32px', fontWeight: 800 }}>
          System Capabilities
        </Typography>
        <Box sx={{
          mt: '8px', mx: { xs: '-16px', sm: '-24px', md: 0 }, px: { xs: '16px', sm: '24px', md: 0 },
          display: { xs: 'flex', md: 'grid' }, flexDirection: { xs: 'row', md: 'unset' },
          overflowX: { xs: 'auto', md: 'visible' }, scrollSnapType: { xs: 'x mandatory', md: 'none' },
          gridTemplateColumns: { md: 'repeat(4, 1fr)' }, gap: '24px', pb: { xs: '24px', md: 0 },
          scrollbarWidth: 'thin', scrollbarColor: 'rgba(76, 175, 80, 0.4) transparent',
          '&::-webkit-scrollbar': { height: '6px' },
          '&::-webkit-scrollbar-track': { background: 'rgba(0,0,0,0.03)', borderRadius: '6px', margin: '0 20px' },
          '&::-webkit-scrollbar-thumb': { background: 'rgba(76, 175, 80, 0.4)', borderRadius: '6px' },
        }}>
          {features.map((feature, i) => (
            <Card key={i} elevation={0} sx={{
              flexShrink: { xs: 0, md: 1 }, width: { xs: '75vw', sm: '280px', md: 'auto' },
              scrollSnapAlign: { xs: 'center', md: 'none' },
              borderRadius: '16px', p: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
              backgroundColor: bg, height: '100%', border: `1px solid ${border}`, borderTop: '4px solid #4CAF50',
              transition: 'all 0.25s ease',
              '&:hover': { transform: 'translateY(-8px)', boxShadow: isDark ? '0 16px 32px rgba(0,0,0,0.4)' : '0 16px 32px rgba(0,0,0,0.08)' }
            }}>
              <Box sx={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: iconBg, color: '#2E7D32', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: '16px' }}>
                {feature.icon}
              </Box>
              <Typography variant="h3" sx={{ color: '#1B5E20', fontSize: '18px', mb: '8px', fontWeight: 700 }}>{feature.title}</Typography>
              <Typography sx={{ fontSize: '14px', color: textSecondary, lineHeight: 1.5 }}>{feature.desc}</Typography>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturesSection;
