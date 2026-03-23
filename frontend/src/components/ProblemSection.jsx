import React from 'react';
import { Box, Typography, Container, Grid, Paper } from '@mui/material';
import { WarningAmber, Thermostat, TrendingDown, AssignmentLate } from '@mui/icons-material';

const ProblemSection = () => {
  const problems = [
    { title: 'Crop Uncertainty', desc: 'Choosing the wrong crop leads to wasted seasons and lost revenue without proper data analysis.', icon: <WarningAmber sx={{ fontSize: 32, color: '#f44336' }} />, color: '#f44336' },
    { title: 'Climate Variation', desc: 'Unpredictable weather patterns make traditional farming techniques obsolete.', icon: <Thermostat sx={{ fontSize: 32, color: '#ff9800' }} />, color: '#ff9800' },
    { title: 'Price Fluctuation', desc: 'Lack of market predictive data leads to massive potential profit loss.', icon: <TrendingDown sx={{ fontSize: 32, color: '#9c27b0' }} />, color: '#9c27b0' },
    { title: 'Inefficient Planning', desc: 'Manual nutrient and resource planning leads to excessive waste and high costs.', icon: <AssignmentLate sx={{ fontSize: 32, color: '#2E7D32' }} />, color: '#2E7D32' },
  ];

  return (
    <Box sx={{ py: { xs: '48px', md: '72px' }, backgroundColor: '#F8FAF9' }}>
      <Container maxWidth="lg" sx={{ px: '20px' }}>
        <Typography variant="h2" sx={{ textAlign: 'center', color: '#1B5E20', mb: '16px', fontSize: '32px', fontWeight: 800, letterSpacing: '-0.5px' }}>
          Why Farmers Need AI Decision Support
        </Typography>
        <Typography sx={{ textAlign: 'center', color: '#555', mb: { xs: '32px', md: '40px' }, maxWidth: '750px', mx: 'auto', fontSize: '16px', lineHeight: 1.5 }}>
          Traditional farming relies heavily on intuition and assumptions, leaving you vulnerable to these critical challenges:
        </Typography>
        <Box sx={{ 
          maxWidth: '900px', 
          mx: { xs: '-20px', md: 'auto' },
          px: { xs: '20px', md: 0 },
          display: { xs: 'flex', md: 'grid' },
          flexDirection: { xs: 'row', md: 'unset' },
          overflowX: { xs: 'auto', md: 'visible' },
          scrollSnapType: { xs: 'x mandatory', md: 'none' },
          gridTemplateColumns: { md: 'repeat(2, 1fr)' },
          gap: '24px',
          pb: { xs: '24px', md: 0 },
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(46, 125, 50, 0.4) transparent',
          '&::-webkit-scrollbar': { height: '6px' },
          '&::-webkit-scrollbar-track': { background: 'rgba(0,0,0,0.03)', borderRadius: '6px', margin: '0 20px' },
          '&::-webkit-scrollbar-thumb': { background: 'rgba(46, 125, 50, 0.4)', borderRadius: '6px' },
        }}>
          {problems.map((prob, i) => (
            <Paper 
              key={i}
              elevation={0} 
              sx={{ 
                flexShrink: { xs: 0, md: 1 },
                width: { xs: '85vw', sm: '320px', md: 'auto' },
                scrollSnapAlign: { xs: 'center', md: 'none' },
                p: '24px', 
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.5)', 
                borderLeft: `4px solid ${prob.color}`,
                borderRadius: '14px', 
                height: '100%', 
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left',
                boxShadow: '0 8px 18px rgba(0,0,0,0.06)',
                transition: 'all 0.25s ease', 
                '&:hover': { 
                  transform: 'scale(1.02) translateY(-4px)',
                  boxShadow: '0 16px 32px rgba(0,0,0,0.08)' 
                }
              }}
            >
              <Box sx={{ mb: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '48px', width: '48px', borderRadius: '50%', backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                {prob.icon}
              </Box>
              <Typography variant="h6" sx={{ color: '#1B5E20', fontWeight: 700, mb: '8px', fontSize: '16px' }}>
                {prob.title}
              </Typography>
              <Typography sx={{ color: '#666', fontSize: '14px', lineHeight: 1.4 }}>
                {prob.desc}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default ProblemSection;
