import React from 'react';
import { Box, Typography, Container, Link, Stack, IconButton, Grid } from '@mui/material';
import { Agriculture as EcoIcon, Twitter, LinkedIn, GitHub, Facebook } from '@mui/icons-material';
import { useColorMode } from '../context/ThemeContext';

const Footer = () => {
  const { mode } = useColorMode();
  const isDark = mode === 'dark';

  const footerBg = isDark ? '#0A0D0B' : '#1e293b';
  const textColor = isDark ? '#e2e8f0' : '#f8fafc';
  const accentColor = isDark ? '#39FF6A' : '#16a34a';
  const hoverBg = isDark ? 'rgba(57,255,106,0.1)' : '#16a34a';

  return (
    <Box sx={{ bgcolor: footerBg, color: textColor, pt: 8, pb: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Stack spacing={3} alignItems={{ xs: 'center', sm: 'flex-start' }} textAlign={{ xs: 'center', sm: 'left' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <EcoIcon sx={{ color: accentColor, fontSize: 32 }} />
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
                      '&:hover': { color: isDark ? accentColor : '#fff', bgcolor: hoverBg, transform: 'scale(0.98)' },
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
                <Link key={item} href="#" underline="none" sx={{ color: '#94a3b8', fontSize: '14px', '&:hover': { color: accentColor } }}>{item}</Link>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 3, lg: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Company</Typography>
            <Stack spacing={2}>
              {['About', 'Contact', 'Blog', 'Careers'].map((item) => (
                <Link key={item} href="#" underline="none" sx={{ color: '#94a3b8', fontSize: '14px', '&:hover': { color: accentColor } }}>{item}</Link>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Support</Typography>
            <Stack spacing={2}>
              {['Help Center', 'Documentation', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <Link key={item} href="#" underline="none" sx={{ color: '#94a3b8', fontSize: '14px', '&:hover': { color: accentColor } }}>{item}</Link>
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

