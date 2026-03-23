import React from 'react';
import { Box, Typography, Container, Button, Grid, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';

const AboutSection = () => {
  const highlights = [
    "Machine Learning Crop Yield Prediction",
    "Real-time Fertilizer Optimization",
    "Climate Data Forecasting Models"
  ];

  return (
    <Box sx={{ py: { xs: '48px', md: '72px' }, backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
      <Container maxWidth="lg" sx={{ px: '20px' }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
          gap: { xs: '48px', md: '64px' },
          alignItems: 'center'
        }}>
          <Box 
            sx={{ 
              margin: '0 auto',
              width: '100%',
              position: 'relative',
              transition: 'transform 0.5s ease',
              transformStyle: 'preserve-3d',
              perspective: '1000px',
              '&:hover': {
                transform: 'rotateY(5deg) rotateX(2deg)'
              }
            }}
          >
            <Box sx={{ padding: '12px', borderRadius: '24px', backgroundColor: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>
              <img 
                src="/vision_growth.jpg" 
                alt="Crop growth progression from seed to plant" 
                style={{ width: '100%', borderRadius: '16px', display: 'block' }} 
              />
            </Box>
            <Box sx={{ position: 'absolute', bottom: -16, right: -16, width: '100%', height: '100%', border: '3px solid rgba(102, 187, 106, 0.4)', borderRadius: '24px', zIndex: -1 }} />
          </Box>

          <Box sx={{ maxWidth: { xs: '100%', md: '520px' }, margin: { xs: '0 auto', md: 0 }, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="h2" sx={{ color: '#1B5E20', mb: '24px', fontSize: { xs: '32px', md: '42px' }, fontWeight: 800, lineHeight: 1.2 }}>
              Our Vision for the Future
            </Typography>
            <Typography sx={{ fontSize: '16px', color: '#555', lineHeight: 1.6, mb: '24px' }}>
              We believe the future of farming lies at the intersection of traditional agricultural wisdom and modern data science. Our mission is to empower farmers globally with an AI-driven software platform that accurately predicts yields, optimizes fertilization, and ensures a profitable and sustainable ecosystem.
            </Typography>
            
            <List sx={{ mb: '32px', mt: '16px', display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-start' } }}>
              {highlights.map((text, i) => (
                <ListItem key={i} sx={{ px: 0, py: 0.5, width: 'auto' }}>
                  <ListItemIcon sx={{ minWidth: '32px' }}>
                    <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText primary={text} primaryTypographyProps={{ fontSize: '15px', color: '#444', fontWeight: 600, lineHeight: 1.8 }} />
                </ListItem>
              ))}
            </List>

            <Button 
              variant="contained" 
              sx={{ 
                backgroundColor: '#2E7D32', color: '#fff', py: '12px', px: '32px', borderRadius: '8px', fontSize: '16px', fontWeight: 600,
                boxShadow: '0 8px 16px rgba(46, 125, 50, 0.25)', transition: 'all 0.25s ease',
                '&:hover': { backgroundColor: '#1B5E20', transform: 'translateY(-2px)', boxShadow: '0 12px 24px rgba(46, 125, 50, 0.35)' }
              }}
            >
              Read Our Story
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AboutSection;
