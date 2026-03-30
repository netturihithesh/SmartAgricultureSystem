import React from 'react';
import { Box, Typography, Grid, Link, Container, IconButton, useTheme } from '@mui/material';
import { Agriculture as EcoIcon, Twitter, LinkedIn, GitHub } from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const footerBg = isDark ? '#0a1f0a' : '#123D15';
  const bottomBg = isDark ? '#060f06' : '#0D3010';

  return (
    <Box sx={{ backgroundColor: footerBg, color: 'rgba(255,255,255,0.8)', pt: { xs: '48px', md: '72px' }, transition: 'background-color 0.3s ease' }}>
      <Container maxWidth="lg">
        <Grid container spacing={5} sx={{ mb: '48px' }}>
          {/* Col 1 */}
          <Grid item xs={12} md={4} sx={{ borderRight: { md: '1px solid rgba(255,255,255,0.1)' }, pr: { md: '32px' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: '#fff' }}>
              <EcoIcon fontSize="large" sx={{ color: '#66BB6A' }} />
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '0.5px' }}>SmartAgri</Typography>
            </Box>
            <Typography sx={{ fontSize: '14px', lineHeight: 1.6, mb: 3, opacity: 0.8 }}>
              Empowering agriculture through predictive analytics, machine learning, and AI-driven decision support systems.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[<Twitter />, <LinkedIn />, <GitHub />].map((icon, i) => (
                <IconButton key={i} sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.1)' } }}>
                  {icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Col 2 */}
          <Grid item xs={12} sm={6} md={2} sx={{ pl: { md: '32px' } }}>
            <Typography sx={{ color: '#fff', fontSize: '16px', mb: '16px', fontWeight: 700 }}>Platform</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {['AI Models', 'Dashboard', 'Pricing', 'Case Studies'].map((item) => (
                <Link key={item} href="#" underline="none" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', transition: 'color 0.2s', '&:hover': { color: '#FBC02D' } }}>{item}</Link>
              ))}
            </Box>
          </Grid>

          {/* Col 3 */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography sx={{ color: '#fff', fontSize: '16px', mb: '16px', fontWeight: 700 }}>Solutions</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {['Crop Recommendation', 'Yield Prediction', 'Climate Analysis', 'Fertilizer Optimization'].map((item) => (
                <Link key={item} href="#" underline="none" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', transition: 'color 0.2s', '&:hover': { color: '#FBC02D' } }}>{item}</Link>
              ))}
            </Box>
          </Grid>

          {/* Col 4 */}
          <Grid item xs={12} sm={12} md={3}>
            <Typography sx={{ color: '#fff', fontSize: '16px', mb: '16px', fontWeight: 700 }}>Contact</Typography>
            <Typography sx={{ fontSize: '14px', mb: 1, opacity: 0.8 }}>Email: support@smartagri.ai</Typography>
            <Typography sx={{ fontSize: '14px', mb: 1, opacity: 0.8 }}>Phone: +1 (555) 123-4567</Typography>
            <Typography sx={{ fontSize: '14px', mb: 1, opacity: 0.8 }}>
              Location: 
              <Link 
                href="https://maps.app.goo.gl/xi53BKjYm8Ek6jt4A" 
                target="_blank" 
                rel="noopener noreferrer" 
                sx={{ ml: 0.5, color: '#66BB6A', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Osmania University, Hyderabad, India
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </Container>

      {/* Bottom Bar */}
      <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.08)', py: '24px', textAlign: 'center', backgroundColor: bottomBg }}>
        <Container maxWidth="lg">
          <Typography sx={{ fontSize: '14px', opacity: 0.6 }}>© {new Date().getFullYear()} SmartAgri System. All rights reserved.</Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer;
