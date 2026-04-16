import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Card } from '@mui/material';
import {
  Sensors as DataIcon, Psychology as MLIcon,
  Memory as PredictIcon, Dashboard as InsightsIcon
} from '@mui/icons-material';
import { useColorMode } from '../context/ThemeContext';

const HowItWorksPage = () => {
  const [animate, setAnimate] = useState(false);
  const { mode } = useColorMode();
  const isDark = mode === 'dark';

  useEffect(() => { setAnimate(true); }, []);

  const bgDefault = isDark ? '#0A0D0B' : '#ffffff';
  const bgPaper = isDark ? '#0A0D0B' : '#ffffff';
  const textPrimary = isDark ? '#e2e8f0' : '#1e293b';
  const textSecondary = isDark ? '#94a3b8' : '#475569';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e8ecea';
  const altBg = isDark ? '#0A0D0B' : '#f8fbf9';
  const connectorBg = isDark ? 'rgba(255,255,255,0.1)' : '#e8ecea';

  const steps = [
    { title: 'Farm Data Input', description: 'User provides soil type, location, climate parameters and land details.', icon: <DataIcon sx={{ fontSize: 32, color: '#fff' }} />, gradient: 'linear-gradient(135deg, #66bb6a, #43a047)' },
    { title: 'Intelligent Data Analysis', description: 'System processes historical datasets and environmental variables.', icon: <MLIcon sx={{ fontSize: 32, color: '#fff' }} />, gradient: 'linear-gradient(135deg, #42a5f5, #1e88e5)' },
    { title: 'Machine Learning Prediction', description: 'AI models evaluate crop suitability and productivity outcomes.', icon: <PredictIcon sx={{ fontSize: 32, color: '#fff' }} />, gradient: 'linear-gradient(135deg, #ab47bc, #8e24aa)' },
    { title: 'Actionable Insights Dashboard', description: 'User receives visual analytics, profit estimation and planning guidance.', icon: <InsightsIcon sx={{ fontSize: 32, color: '#fff' }} />, gradient: 'linear-gradient(135deg, #ffa726, #fb8c00)' }
  ];

  return (
    <Box sx={{ width: '100%', backgroundColor: bgDefault, minHeight: '100vh', overflow: 'hidden' }}>

      {/* Header */}
      <Box sx={{ pt: { xs: '110px', md: '130px' }, pb: '40px', backgroundColor: altBg, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h1" sx={{ fontSize: { xs: '32px', md: '42px' }, fontWeight: 800, color: textPrimary, mb: '16px', letterSpacing: '-0.5px' }}>
            How SmartAgri Intelligence Works
          </Typography>
          <Typography sx={{ fontSize: '16px', color: textSecondary, maxWidth: '720px', mx: 'auto', lineHeight: 1.6 }}>
            From farm data input to AI-driven crop recommendations — discover the intelligent workflow behind smarter agricultural planning.
          </Typography>
        </Container>
      </Box>

      {/* Pipeline Flow */}
      <Box sx={{ py: '80px', position: 'relative', backgroundColor: bgDefault }}>
        <Container maxWidth="lg" sx={{ maxWidth: '1100px !important' }}>
          <Box sx={{
            display: 'flex', flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'center', md: 'flex-start' },
            justifyContent: 'space-between', position: 'relative', gap: { xs: '40px', md: 0 }
          }}>

            {/* Connector Line - Desktop */}
            <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'absolute', top: '38px', left: '10%', right: '10%', height: '4px', backgroundColor: connectorBg, borderRadius: '4px', zIndex: 0, overflow: 'hidden' }}>
              <Box sx={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, transparent, #66bb6a, #2e7d32, transparent)', backgroundSize: '200% 100%', animation: 'flow 3s linear infinite', '@keyframes flow': { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(100%)' } } }} />
            </Box>

            {/* Connector Line - Mobile */}
            <Box sx={{ display: { xs: 'block', md: 'none' }, position: 'absolute', top: '8%', bottom: '8%', left: '50%', width: '4px', transform: 'translateX(-50%)', backgroundColor: connectorBg, borderRadius: '4px', zIndex: 0, overflow: 'hidden' }}>
              <Box sx={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, transparent, #66bb6a, #2e7d32, transparent)', backgroundSize: '100% 200%', animation: 'flowV 3s linear infinite', '@keyframes flowV': { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100%)' } } }} />
            </Box>

            {steps.map((step, i) => (
              <Box key={i} sx={{
                width: { xs: '100%', sm: '320px', md: '240px' },
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                position: 'relative', zIndex: 2,
                opacity: animate ? 1 : 0,
                transform: animate ? 'translateY(0)' : 'translateY(40px)',
                transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.2}s`
              }}>
                <Box sx={{
                  width: '76px', height: '76px', borderRadius: '50%', mb: '24px',
                  background: step.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 12px 24px rgba(46, 125, 50, 0.2)', position: 'relative',
                  '&::before': { content: '""', position: 'absolute', top: -5, left: -5, right: -5, bottom: -5, borderRadius: '50%', border: '2px solid rgba(76, 175, 80, 0.3)', animation: 'pulse 2s infinite ease-out' },
                  '@keyframes pulse': { '0%': { transform: 'scale(0.9)', opacity: 1 }, '100%': { transform: 'scale(1.25)', opacity: 0 } }
                }}>
                  {step.icon}
                </Box>

                <Card elevation={0} sx={{
                  p: '24px', borderRadius: '18px', backgroundColor: bgPaper,
                  border: `1px solid ${borderColor}`, textAlign: 'center', height: '100%', width: '100%',
                  backdropFilter: isDark ? 'blur(10px)' : 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-6px)', boxShadow: isDark ? '0 24px 48px rgba(0,0,0,0.6)' : '0 24px 48px rgba(0,0,0,0.08)' }
                }}>
                  <Typography variant="overline" sx={{ color: textSecondary, fontWeight: 800, letterSpacing: '1px', mb: '6px', display: 'block' }}>STEP {i + 1}</Typography>
                  <Typography variant="h3" sx={{ fontSize: '18px', fontWeight: 700, color: textPrimary, mb: '12px' }}>{step.title}</Typography>
                  <Typography sx={{ fontSize: '14px', color: textSecondary, lineHeight: 1.6 }}>{step.description}</Typography>
                </Card>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* AI Logic Block */}
      <Box sx={{ py: '60px', mb: '40px', backgroundColor: bgDefault, textAlign: 'center' }}>
        <Container maxWidth="sm">
          <Box sx={{ width: '40px', height: '3px', backgroundColor: '#2E7D32', mx: 'auto', mb: '32px', borderRadius: '4px' }} />
          <Typography sx={{ fontSize: '18px', fontWeight: 600, color: textPrimary, mb: '16px', lineHeight: 1.4 }}>
            Our decision engine evaluates multiple agricultural parameters
          </Typography>
          <Typography sx={{ fontSize: '15px', color: textSecondary, lineHeight: 1.7 }}>
            including soil nutrients, rainfall variability, seasonal trends and historical productivity patterns to execute mathematically rigorous predictive modeling.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default HowItWorksPage;
