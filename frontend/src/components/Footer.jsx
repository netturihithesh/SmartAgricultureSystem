import React from 'react';
import { Box, Typography, Container, Grid, Link, Stack, IconButton } from '@mui/material';
import { Agriculture, Twitter, LinkedIn, GitHub, Facebook } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box sx={{ bgcolor: '#1e293b', color: '#f8fafc', pt: 8, pb: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Agriculture sx={{ color: '#16a34a', fontSize: 32 }} />
                <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
                  SmartAgri
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.8, maxWidth: '300px' }}>
                Empowering farmers with AI-driven insights for sustainable and profitable agriculture.
              </Typography>
              <Stack direction="row" spacing={1.5}>
                {[Twitter, LinkedIn, GitHub, Facebook].map((Icon, i) => (
                  <IconButton 
                    key={i} 
                    size="small" 
                    sx={{ 
                      color: '#94a3b8', 
                      bgcolor: 'rgba(255,255,255,0.05)',
                      '&:hover': { color: '#fff', bgcolor: '#16a34a' } 
                    }}
                  >
                    <Icon fontSize="small" />
                  </IconButton>
                ))}
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Product</Typography>
            <Stack spacing={2}>
              {['Features', 'Crop Analysis', 'Weather advisory', 'Profit tools'].map((item) => (
                <Link key={item} href="#" underline="none" sx={{ color: '#94a3b8', fontSize: '14px', '&:hover': { color: '#16a34a' } }}>{item}</Link>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Company</Typography>
            <Stack spacing={2}>
              {['About', 'Contact', 'Blog', 'Careers'].map((item) => (
                <Link key={item} href="#" underline="none" sx={{ color: '#94a3b8', fontSize: '14px', '&:hover': { color: '#16a34a' } }}>{item}</Link>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Support</Typography>
            <Stack spacing={2}>
              {['Help Center', 'Documentation', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <Link key={item} href="#" underline="none" sx={{ color: '#94a3b8', fontSize: '14px', '&:hover': { color: '#16a34a' } }}>{item}</Link>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Contact</Typography>
            <Stack spacing={2}>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>support@smartagri.ai</Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>+1 (555) 000-0000</Typography>
            </Stack>
          </Grid>
        </Grid>

        <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.05)', mt: 8, pt: 4, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            © {new Date().getFullYear()} SmartAgri. Built with ❤️ for the farming community.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;

