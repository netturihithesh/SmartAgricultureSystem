import React from 'react';
import { Box, Typography, Grid, Link, Container, IconButton, useTheme } from '@mui/material';
import { Agriculture as EcoIcon, Twitter, LinkedIn, GitHub } from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const footerBg = isDark ? '#0a1f0a' : '#123D15';
  const bottomBg = isDark ? '#060f06' : '#0D3010';

  return (
    <Box className="footer" sx={{ backgroundColor: footerBg, color: 'rgba(255,255,255,0.8)', pt: '32px', pb: 0, mt: '48px', transition: 'background-color 0.3s ease' }}>
      <Container maxWidth={false} sx={{ maxWidth: '1100px', mx: 'auto', px: '24px' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', mb: '28px' }}>
          
          {/* Col 1: Brand & Contact */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: '12px', color: '#fff' }}>
              <EcoIcon sx={{ color: '#66BB6A' }} />
              <Typography sx={{ fontWeight: 800, fontSize: '16px', letterSpacing: '0.5px' }}>SmartAgri</Typography>
            </Box>
            <Typography sx={{ fontSize: '13px', lineHeight: 1.5, mb: '16px', opacity: 0.8 }}>
              AI-driven support systems for agriculture.
            </Typography>
            <Box sx={{ display: 'flex', gap: 0 }}>
              {[<Twitter fontSize="small" />, <LinkedIn fontSize="small" />, <GitHub fontSize="small" />].map((icon, i) => (
                <IconButton size="small" key={i} sx={{ color: 'rgba(255,255,255,0.8)', p: 0.5, mr: 1, '&:hover': { color: '#fff' } }}>
                  {icon}
                </IconButton>
              ))}
            </Box>
          </Box>

          {/* Col 2: Solutions + Links */}
          <Box sx={{ pl: '12px' }}>
            <Typography sx={{ color: '#fff', fontSize: '14px', mb: '12px', fontWeight: 700 }}>Solutions</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['Crop Analysis', 'Yield Prediction', 'My Dashboard'].map((item) => (
                <Link key={item} href="#" underline="none" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', transition: 'color 0.2s', '&:hover': { color: '#FBC02D' } }}>{item}</Link>
              ))}
              <Typography sx={{ fontSize: '13px', mt: '8px', opacity: 0.7, textDecoration: 'underline' }}>support@smartagri.ai</Typography>
            </Box>
          </Box>

        </Box>
      </Container>

      {/* Bottom Bar */}
      <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.08)', py: '18px', textAlign: 'center', backgroundColor: bottomBg }}>
        <Container maxWidth={false} sx={{ maxWidth: '1100px', mx: 'auto', px: '24px' }}>
          <Typography sx={{ fontSize: '12px', opacity: 0.6 }}>© {new Date().getFullYear()} SmartAgri. All rights reserved.</Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer;
