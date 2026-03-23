import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Grid } from '@mui/material';

const AnimatedNumber = ({ target, suffix }) => {
  const [count, setCount] = useState(0);
  const numericTarget = parseInt(target.replace(/[^0-9]/g, ''));
  
  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = numericTarget / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= numericTarget) {
        clearInterval(timer);
        setCount(numericTarget);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [numericTarget]);

  return <>{count}{suffix}</>;
};

const StatsSection = () => {
  const stats = [
    { num: '95', suffix: '%', label: 'Prediction Accuracy' },
    { num: '10', suffix: 'k+', label: 'Dataset Records' },
    { num: '30', suffix: '%', label: 'Profit Optimization' },
    { num: '5', suffix: '', label: 'Climate Parameters' },
  ];

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)', 
      py: { xs: '40px', md: '56px' },
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Subtle dotted background pattern */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 2px, transparent 2px)',
        backgroundSize: '24px 24px',
        opacity: 0.4
      }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: { xs: '32px 16px', md: '32px' }
        }}>
          {stats.map((stat, i) => (
            <Box key={i} sx={{ textAlign: 'center', transition: 'all 0.25s ease', '&:hover': { transform: 'translateY(-4px)' } }}>
              <Typography sx={{ fontSize: { xs: '40px', md: '48px' }, color: '#fff', fontWeight: 800, mb: '8px', lineHeight: 1 }}>
                <AnimatedNumber target={stat.num} suffix={stat.suffix} />
              </Typography>
              <Typography sx={{ fontSize: { xs: '12px', md: '14px' }, color: '#E8F5E9', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default StatsSection;
