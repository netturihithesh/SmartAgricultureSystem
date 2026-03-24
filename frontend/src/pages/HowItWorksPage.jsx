import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Card } from '@mui/material';
import { 
  Sensors as DataIcon, 
  Psychology as MLIcon, 
  Memory as PredictIcon, 
  Dashboard as InsightsIcon 
} from '@mui/icons-material';

const HowItWorksPage = () => {
  // Trigger animation state on load
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    setAnimate(true);
  }, []);

  const steps = [
    {
      title: 'Farm Data Input',
      description: 'User provides soil type, location, climate parameters and land details.',
      icon: <DataIcon sx={{ fontSize: 32, color: '#fff' }} />,
      gradient: 'linear-gradient(135deg, #66bb6a, #43a047)'
    },
    {
      title: 'Intelligent Data Analysis',
      description: 'System processes historical datasets and environmental variables.',
      icon: <MLIcon sx={{ fontSize: 32, color: '#fff' }} />,
      gradient: 'linear-gradient(135deg, #42a5f5, #1e88e5)'
    },
    {
      title: 'Machine Learning Prediction',
      description: 'AI models evaluate crop suitability and productivity outcomes.',
      icon: <PredictIcon sx={{ fontSize: 32, color: '#fff' }} />,
      gradient: 'linear-gradient(135deg, #ab47bc, #8e24aa)'
    },
    {
      title: 'Actionable Insights Dashboard',
      description: 'User receives visual analytics, profit estimation and planning guidance.',
      icon: <InsightsIcon sx={{ fontSize: 32, color: '#fff' }} />,
      gradient: 'linear-gradient(135deg, #ffa726, #fb8c00)'
    }
  ];

  return (
    <Box sx={{ width: '100%', backgroundColor: '#FFFFFF', minHeight: '100vh', overflow: 'hidden' }}>
      
      {/* 1️⃣ Micro Hero (Compact Intro) */}
      <Box sx={{ 
        pt: { xs: '110px', md: '130px' }, // Clears absolute position navbar
        pb: '40px', 
        background: 'linear-gradient(180deg, #f8fbf9, #ffffff)',
        textAlign: 'center'
      }}>
        <Container maxWidth="md">
          <Typography variant="h1" sx={{ fontSize: { xs: '32px', md: '42px' }, fontWeight: 800, color: '#111', mb: '16px', letterSpacing: '-0.5px' }}>
            How SmartAgri Intelligence Works
          </Typography>
          <Typography sx={{ fontSize: '16px', color: '#555', maxWidth: '720px', mx: 'auto', lineHeight: 1.6 }}>
            From farm data input to AI-driven crop recommendations — discover the intelligent workflow behind smarter agricultural planning.
          </Typography>
        </Container>
      </Box>

      {/* 2️⃣ CRAZY DIFFERENT MAIN VISUAL — AI Pipeline Flow */}
      <Box sx={{ py: '80px', position: 'relative' }}>
        <Container maxWidth="lg" sx={{ maxWidth: '1100px !important' }}>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            alignItems: { xs: 'center', md: 'flex-start' },
            justifyContent: 'space-between',
            position: 'relative',
            gap: { xs: '40px', md: 0 }
          }}>
            
            {/* Background Animated Connector Line (Desktop) */}
            <Box sx={{ 
              display: { xs: 'none', md: 'block' },
              position: 'absolute',
              top: '38px', // Dynamically centered directly beneath the icon layout ring
              left: '10%',
              right: '10%',
              height: '4px',
              backgroundColor: '#e8ecea',
              borderRadius: '4px',
              zIndex: 0,
              overflow: 'hidden'
            }}>
              <Box sx={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, #66bb6a, #2e7d32, transparent)',
                backgroundSize: '200% 100%',
                animation: 'flow 3s linear infinite',
                '@keyframes flow': {
                  '0%': { transform: 'translateX(-100%)' },
                  '100%': { transform: 'translateX(100%)' }
                }
              }} />
            </Box>

            {/* Background Animated Connector Line (Mobile) */}
            <Box sx={{ 
              display: { xs: 'block', md: 'none' },
              position: 'absolute',
              top: '8%',
              bottom: '8%',
              left: '50%',
              width: '4px',
              transform: 'translateX(-50%)',
              backgroundColor: '#e8ecea',
              borderRadius: '4px',
              zIndex: 0,
              overflow: 'hidden'
            }}>
              <Box sx={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(180deg, transparent, #66bb6a, #2e7d32, transparent)',
                backgroundSize: '100% 200%',
                animation: 'flowVertical 3s linear infinite',
                '@keyframes flowVertical': {
                  '0%': { transform: 'translateY(-100%)' },
                  '100%': { transform: 'translateY(100%)' }
                }
              }} />
            </Box>

            {/* Pipeline Stage Iterators */}
            {steps.map((step, i) => (
              <Box 
                key={i}
                sx={{ 
                  width: { xs: '100%', sm: '320px', md: '240px' },
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  position: 'relative', zIndex: 2,
                  opacity: animate ? 1 : 0,
                  transform: animate ? 'translateY(0)' : 'translateY(40px)',
                  transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.2}s`
                }}
              >
                {/* Glowing Neural Ring Block */}
                <Box sx={{
                  width: '76px', height: '76px', borderRadius: '50%', mb: '24px',
                  background: step.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 12px 24px rgba(46, 125, 50, 0.2)',
                  position: 'relative',
                  transition: 'transform 0.3s ease',
                  '&::before': {
                    content: '""', position: 'absolute', top: -5, left: -5, right: -5, bottom: -5,
                    borderRadius: '50%', border: '2px solid rgba(76, 175, 80, 0.3)',
                    animation: 'pulse 2s infinite ease-out',
                  },
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(0.9)', opacity: 1 },
                    '100%': { transform: 'scale(1.25)', opacity: 0 }
                  }
                }}>
                  {step.icon}
                </Box>

                {/* Data Glass Card */}
                <Card 
                  elevation={0}
                  sx={{ 
                    p: '24px', 
                    borderRadius: '18px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e8ecea',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.03)',
                    textAlign: 'center',
                    height: '100%',
                    width: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 24px 48px rgba(0,0,0,0.08)',
                      borderColor: '#d1cdc9'
                    },
                    '&:hover .icon-ring': {
                      transform: 'rotate(10deg) scale(1.05)'
                    }
                  }}
                >
                  <Typography variant="overline" sx={{ color: '#888', fontWeight: 800, letterSpacing: '1px', mb: '6px', display: 'block' }}>
                    STEP {i + 1}
                  </Typography>
                  <Typography className="step-title" variant="h3" sx={{ fontSize: '18px', fontWeight: 700, color: '#111', mb: '12px', transition: 'color 0.2s' }}>
                    {step.title}
                  </Typography>
                  <Typography sx={{ fontSize: '14px', color: '#666', lineHeight: 1.6 }}>
                    {step.description}
                  </Typography>
                </Card>
              </Box>
            ))}

          </Box>
        </Container>
      </Box>

      {/* 3️⃣ AI Logic Highlight Priority Block */}
      <Box sx={{ py: '60px', mb: '40px', backgroundColor: '#FFFFFF', textAlign: 'center' }}>
        <Container maxWidth="sm">
          <Box sx={{ width: '40px', height: '3px', backgroundColor: '#2E7D32', mx: 'auto', mb: '32px', borderRadius: '4px' }} />
          <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#222', mb: '16px', lineHeight: 1.4 }}>
            Our decision engine evaluates multiple agricultural parameters
          </Typography>
          <Typography sx={{ fontSize: '15px', color: '#666', lineHeight: 1.7 }}>
            including soil nutrients, rainfall variability, seasonal trends and historical productivity patterns to execute mathematically rigorous predictive modeling.
          </Typography>
        </Container>
      </Box>

    </Box>
  );
};

export default HowItWorksPage;
