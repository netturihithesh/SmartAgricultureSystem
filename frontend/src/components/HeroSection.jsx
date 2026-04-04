import React from 'react';
import { Box, Typography, Button, Container, Stack, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PlayCircleOutline } from '@mui/icons-material';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <Box 
      sx={{ 
        minHeight: { xs: '90vh', md: '95vh' },
        pt: { xs: '100px', md: '80px' },
        pb: { xs: '48px', md: '80px' },
        position: 'relative',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden'
      }}
    >
      {/* Decorative Elements */}
      <Box sx={{ position: 'absolute', top: '10%', right: '-5%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.05)', filter: 'blur(50px)', zIndex: 0 }} />
      <Box sx={{ position: 'absolute', bottom: '10%', left: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.08)', filter: 'blur(80px)', zIndex: 0 }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={7}>
            <Box sx={{ pr: { md: 4 } }}>
              <Typography 
                variant="h1" 
                sx={{ 
                  color: '#14532d', 
                  fontSize: { xs: '40px', sm: '52px', md: '72px' }, 
                  fontWeight: 900, 
                  lineHeight: 1.1, 
                  letterSpacing: '-2px',
                  mb: 3
                }}
              >
                Smart Farming with <Box component="span" sx={{ color: '#16a34a' }}>AI Intelligence 🌾</Box>
              </Typography>
              <Typography 
                sx={{ 
                  color: '#365314', 
                  fontSize: { xs: '18px', md: '22px' }, 
                  mb: 5, 
                  lineHeight: 1.6, 
                  fontWeight: 500, 
                  opacity: 0.8,
                  maxWidth: '600px'
                }}
              >
                Predict the best crops, track crop growth stages, get weather advisory, and maximize profit with AI-powered farming assistance.
              </Typography>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{ 
                    bgcolor: '#16a34a', 
                    color: '#fff', 
                    px: 5, 
                    py: 2.2, 
                    borderRadius: '16px', 
                    fontSize: '18px', 
                    fontWeight: 800, 
                    textTransform: 'none',
                    boxShadow: '0 20px 40px rgba(22, 163, 74, 0.25)',
                    '&:hover': { bgcolor: '#15803d', transform: 'translateY(-2px)', boxShadow: '0 25px 50px rgba(22, 163, 74, 0.35)' },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  Get Started
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  onClick={() => navigate('/login')}
                  startIcon={<PlayCircleOutline />}
                  sx={{ 
                    borderColor: '#16a34a', 
                    color: '#16a34a', 
                    px: 5, 
                    py: 2.2, 
                    borderRadius: '16px', 
                    fontSize: '18px', 
                    fontWeight: 800, 
                    textTransform: 'none',
                    borderWidth: '2.5px',
                    '&:hover': { borderWidth: '2.5px', bgcolor: 'rgba(22, 163, 74, 0.05)', transform: 'translateY(-2px)' },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Login
                </Button>
              </Stack>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box 
              sx={{ 
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: '-20px',
                  bgcolor: '#dcfce7',
                  borderRadius: '40px',
                  zIndex: -1,
                  transform: 'rotate(-3deg)'
                }
              }}
            >
              <img 
                src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800" 
                alt="Farmer with crops" 
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  borderRadius: '32px', 
                  boxShadow: '0 30px 60px rgba(0,0,0,0.12)',
                  display: 'block'
                }} 
              />
              {/* Floating Stat Card */}
              <Box sx={{ 
                position: 'absolute', 
                bottom: -20, 
                left: -30, 
                bgcolor: '#fff', 
                p: 2.5, 
                borderRadius: '20px', 
                boxShadow: '0 15px 30px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ fontSize: '24px' }}>📈</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}>Yield Increase</Typography>
                  <Typography variant="h6" sx={{ color: '#16a34a', fontWeight: 900 }}>+42% Average</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HeroSection;

