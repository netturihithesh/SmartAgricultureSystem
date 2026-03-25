import React from 'react';
import { Box, Typography, Grid, Link, Container, IconButton } from '@mui/material';
import { Agriculture as EcoIcon, Twitter, LinkedIn, GitHub } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box sx={{ backgroundColor: '#123D15', color: 'rgba(255,255,255,0.8)', pt: { xs: '48px', md: '72px' } }}>
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
              <IconButton sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.1)' } }}>
                <Twitter />
              </IconButton>
              <IconButton sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.1)' } }}>
                <LinkedIn />
              </IconButton>
              <IconButton sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.1)' } }}>
                <GitHub />
              </IconButton>
            </Box>
          </Grid>
          
          {/* Col 2 */}
          <Grid item xs={12} sm={6} md={2} sx={{ pl: { md: '32px' } }}>
            <Typography sx={{ color: '#fff', fontSize: '16px', mb: '16px', fontWeight: 700 }}>Platform</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Link href="#" underline="none" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', transition: 'color 0.2s', '&:hover': { color: '#FBC02D' } }}>AI Models</Link>
              <Link href="#" underline="none" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', transition: 'color 0.2s', '&:hover': { color: '#FBC02D' } }}>Dashboard</Link>
              <Link href="#" underline="none" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', transition: 'color 0.2s', '&:hover': { color: '#FBC02D' } }}>Pricing</Link>
              <Link href="#" underline="none" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', transition: 'color 0.2s', '&:hover': { color: '#FBC02D' } }}>Case Studies</Link>
            </Box>
          </Grid>
          
          {/* Col 3 */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography sx={{ color: '#fff', fontSize: '16px', mb: '16px', fontWeight: 700 }}>Solutions</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Link href="#" underline="none" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', transition: 'color 0.2s', '&:hover': { color: '#FBC02D' } }}>Crop Recommendation</Link>
              <Link href="#" underline="none" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', transition: 'color 0.2s', '&:hover': { color: '#FBC02D' } }}>Yield Prediction</Link>
              <Link href="#" underline="none" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', transition: 'color 0.2s', '&:hover': { color: '#FBC02D' } }}>Climate Analysis</Link>
              <Link href="#" underline="none" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', transition: 'color 0.2s', '&:hover': { color: '#FBC02D' } }}>Fertilizer Optimization</Link>
            </Box>
          </Grid>
          
          {/* Col 4 */}
          <Grid item xs={12} sm={12} md={3}>
            <Typography sx={{ color: '#fff', fontSize: '16px', mb: '16px', fontWeight: 700 }}>Contact</Typography>
            <Typography sx={{ fontSize: '14px', mb: 1, opacity: 0.8 }}>Email: support@smartagri.ai</Typography>
            <Typography sx={{ fontSize: '14px', mb: 1, opacity: 0.8 }}>Phone: +1 (555) 123-4567</Typography>
            <Typography sx={{ fontSize: '14px', mb: 1, opacity: 0.8 }}>Location: Precision Farm Rd, Valley, CA</Typography>
          </Grid>
        </Grid>
      </Container>
      
      {/* Bottom bar */}
      <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.08)', py: '24px', textAlign: 'center', backgroundColor: '#0D3010' }}>
        <Container maxWidth="lg">
          <Typography sx={{ fontSize: '14px', opacity: 0.6 }}>&copy; {new Date().getFullYear()} SmartAgri System. All rights reserved.</Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer;
