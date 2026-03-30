import React from 'react';
import { Box, Typography, Container, useTheme } from '@mui/material';

const HowItWorks = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const bg = isDark ? '#1e2a24' : '#F9FCF9';
  const textPrimary = theme.palette.text.primary;
  const textSecondary = theme.palette.text.secondary;
  const nodeCircleBg = isDark ? '#2a3830' : '#fff';

  const steps = [
    { title: 'Enter Farm Details', desc: 'Input your soil type, land size, and season details into our system.' },
    { title: 'AI Model Processes', desc: 'System analyzes huge multi-variable datasets and climate patterns.' },
    { title: 'Recommendations', desc: 'Smart crop, irrigation, and precise fertilizer suggestions are generated.' },
    { title: 'View Analytics', desc: 'Monitor beautiful graphs, robust insights, and clear profit trends.' }
  ];

  return (
    <Box sx={{ py: { xs: '48px', md: '72px' }, backgroundColor: bg }}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{ textAlign: 'center', color: '#1B5E20', mb: { xs: '32px', md: '48px' }, fontSize: '32px', fontWeight: 800 }}>
          How It Works
        </Typography>
        <Box sx={{ position: 'relative', maxWidth: '800px', mx: 'auto' }}>
          <Box sx={{ position: 'absolute', top: '20px', bottom: '20px', left: { xs: '30px', md: '50%' }, width: '4px', transform: { md: 'translateX(-50%)' }, background: 'linear-gradient(180deg, #66BB6A, #2E7D32)', borderRadius: '4px', zIndex: 1 }} />

          {steps.map((step, i) => (
            <Box key={i} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mb: i === steps.length - 1 ? 0 : { xs: '24px', md: '32px' }, position: 'relative', zIndex: 2, minHeight: '80px' }}>
              {/* Desktop Left */}
              <Box sx={{ flex: 1, display: { xs: 'none', md: 'block' }, textAlign: 'right', pr: '48px', visibility: i % 2 === 0 ? 'visible' : 'hidden' }}>
                <Typography sx={{ fontSize: '20px', color: '#1B5E20', mb: '8px', fontWeight: 800 }}>{step.title}</Typography>
                <Typography sx={{ fontSize: '15px', color: textSecondary, lineHeight: 1.6 }}>{step.desc}</Typography>
              </Box>

              {/* Center Node */}
              <Box sx={{
                width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0,
                backgroundColor: nodeCircleBg, border: '3px solid #2E7D32',
                color: '#2E7D32', display: 'flex', justifyContent: 'center', alignItems: 'center',
                fontWeight: 800, fontSize: '24px',
                boxShadow: isDark ? '0 8px 16px rgba(0,0,0,0.4)' : '0 8px 16px rgba(46, 125, 50, 0.15)',
                position: 'relative', zIndex: 2,
                '&::before': { content: '""', position: 'absolute', top: -8, left: -8, right: -8, bottom: -8, borderRadius: '50%', background: 'rgba(46, 125, 50, 0.1)', zIndex: -1, transition: 'all 0.25s ease' },
                '&:hover::before': { transform: 'scale(1.2)', background: 'rgba(46, 125, 50, 0.2)' }
              }}>
                {i + 1}
              </Box>

              {/* Right Side */}
              <Box sx={{ flex: 1, textAlign: 'left', pl: { xs: '24px', md: '48px' }, visibility: { xs: 'visible', md: i % 2 === 1 ? 'visible' : 'hidden' } }}>
                <Typography sx={{ fontSize: '20px', color: '#1B5E20', mb: '8px', fontWeight: 800 }}>{step.title}</Typography>
                <Typography sx={{ fontSize: '15px', color: textSecondary, lineHeight: 1.6 }}>{step.desc}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default HowItWorks;
