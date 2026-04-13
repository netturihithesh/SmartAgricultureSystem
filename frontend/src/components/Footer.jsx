import React from 'react';
import { Box, Typography, Container, Link, Stack, IconButton, Grid } from '@mui/material';
import { Agriculture, Twitter, LinkedIn, GitHub, Facebook } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box sx={{ bgcolor: '#1e293b', color: '#f8fafc', pt: 8, pb: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Stack spacing={3} alignItems={{ xs: 'center', sm: 'flex-start' }} textAlign={{ xs: 'center', sm: 'left' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Agriculture sx={{ color: '#16a34a', fontSize: 32 }} />
                <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
                  SmartAgri
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.8, maxWidth: '300px' }}>
                Empowering farmers with AI-driven insights for sustainable and profitable agriculture.
              </Typography>
              <Stack direction="row" spacing={1.5} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                {[Twitter, LinkedIn, GitHub, Facebook].map((Icon, i) => (
                  <IconButton 
                    key={i} 
                    size="small" 
                    sx={{ 
                      color: '#94a3b8', 
                      bgcolor: 'rgba(255,255,255,0.05)',
                      '&:hover': { color: '#fff', bgcolor: '#16a34a', transform: 'scale(0.98)' },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Icon fontSize="small" />
                  </IconButton>
                ))}
              </Stack>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 3, lg: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Product</Typography>
            <Stack spacing={2}>
              {['Features', 'Crop Prediction', 'Weather advisory', 'Profit tools'].map((item) => (
                <Link key={item} href="#" underline="none" sx={{ color: '#94a3b8', fontSize: '14px', '&:hover': { color: '#16a34a' } }}>{item}</Link>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 3, lg: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Company</Typography>
            <Stack spacing={2}>
              {['About', 'Contact', 'Blog', 'Careers'].map((item) => (
                <Link key={item} href="#" underline="none" sx={{ color: '#94a3b8', fontSize: '14px', '&:hover': { color: '#16a34a' } }}>{item}</Link>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Support</Typography>
            <Stack spacing={2}>
              {['Help Center', 'Documentation', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <Link key={item} href="#" underline="none" sx={{ color: '#94a3b8', fontSize: '14px', '&:hover': { color: '#16a34a' } }}>{item}</Link>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Contact</Typography>
            <Stack spacing={2}>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>support@smartagri.ai</Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>+1 (555) 000-0000</Typography>
            </Stack>
          </Grid>
        </Grid>

        <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.05)', mt: 8, padding: '24px 0', textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            © {new Date().getFullYear()} SmartAgri. Built with ❤️ for the farming community.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;

