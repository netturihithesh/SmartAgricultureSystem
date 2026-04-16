import React from 'react';
import {
  Box, Container, Typography, Grid, TextField, Button, Paper, Stack
} from '@mui/material';
import {
  LocationOn as LocationIcon, Email as EmailIcon,
  AccessTime as AccessTimeIcon, ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useColorMode } from '../context/ThemeContext';

const ContactPage = () => {
  const [isSent, setIsSent] = React.useState(false);
  const { mode } = useColorMode();
  const isDark = mode === 'dark';

  const bgDefault = isDark ? '#0A0D0B' : '#ffffff';
  const bgPaper = isDark ? '#0A0D0B' : '#ffffff';
  const textPrimary = isDark ? '#e2e8f0' : '#1e293b';
  const textSecondary = isDark ? '#94a3b8' : '#475569';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e8ecea';
  const altBg = isDark ? '#0A0D0B' : '#f7faf8';
  const iconBg = isDark ? 'rgba(57,255,106,0.1)' : '#e8f5e9';
  const accentColor = isDark ? '#39FF6A' : '#2e7d32';

  return (
    <Box sx={{ mt: '70px', width: '100%', pb: 8, backgroundColor: bgDefault }}>
      {/* Header */}
      <Box sx={{ backgroundColor: altBg, pt: '60px', pb: '30px', textAlign: 'center' }}>
        <Container maxWidth="md" sx={{ maxWidth: '680px !important' }}>
          <Typography variant="h3" component="h1"
            sx={{ fontWeight: 800, color: textPrimary, mb: 2, fontSize: { xs: '2.5rem', md: '3rem' } }}>
            Contact SmartAgri
          </Typography>
          <Typography variant="h6" sx={{ color: textSecondary, fontWeight: 400, lineHeight: 1.6 }}>
            Have questions about smart crop planning or AI recommendations?<br />
            Our team is here to help you.
          </Typography>
        </Container>
      </Box>

      {/* Main Contact Section */}
      <Container maxWidth="lg" sx={{ pt: 8, pb: 8 }}>
        <Grid container spacing={8} justifyContent="center" alignItems="stretch">

          {/* Contact Form */}
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{
              p: '30px', borderRadius: '16px', border: `1px solid ${borderColor}`,
              backgroundColor: bgPaper
            }}>
              <form onSubmit={(e) => { e.preventDefault(); setIsSent(true); }}>
                <Stack spacing={'16px'}>
                  <TextField fullWidth label="Full Name" variant="outlined" placeholder="John Doe" required
                    InputProps={{ sx: { borderRadius: '8px' } }} />
                  <TextField fullWidth label="Email Address" type="email" variant="outlined" placeholder="john@example.com" required
                    InputProps={{ sx: { borderRadius: '8px' } }} />
                  <TextField fullWidth label="Subject" variant="outlined" placeholder="How can we help you?"
                    InputProps={{ sx: { borderRadius: '8px' } }} />
                  <TextField fullWidth label="Message" multiline rows={4} variant="outlined"
                    placeholder="Type your message here..." required
                    sx={{ '& .MuiInputBase-root': { minHeight: '120px', alignItems: 'flex-start', borderRadius: '8px' } }} />
                  <Button type="submit" variant="contained" sx={{
                    mt: 1, height: '48px', borderRadius: '10px',
                    backgroundColor: accentColor, color: isDark ? '#000' : 'white', fontWeight: 600,
                    textTransform: 'none', fontSize: '16px',
                    '&:hover': { backgroundColor: isDark ? '#2fe058' : '#1b5e20' }
                  }}>
                    {isSent ? 'Sent ✓' : 'Send Message'}
                  </Button>
                </Stack>
              </form>
            </Paper>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={5}>
            <Box sx={{
              backgroundColor: altBg, p: '30px', borderRadius: '16px',
              height: '100%', display: 'flex', flexDirection: 'column',
              border: `1px solid ${borderColor}`
            }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: textPrimary, mb: 3 }}>Get in Touch</Typography>
              <Stack spacing={'18px'}>
                {[
                  { icon: <LocationIcon />, label: 'Address', value: 'Osmania University, Hyderabad' },
                  { icon: <EmailIcon />, label: 'Email Support', value: 'support@smartagri.ai' },
                  { icon: <AccessTimeIcon />, label: 'Support Hours', value: 'Mon – Sat : 9AM – 6PM' },
                ].map(({ icon, label, value }) => (
                  <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', p: 1.2, backgroundColor: iconBg, borderRadius: '10px', color: accentColor }}>
                      {icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>{label}</Typography>
                      {label === 'Address' ? (
                        <Typography
                          variant="body1"
                          fontWeight={600}
                          color="text.primary"
                          component="a"
                          href="https://maps.app.goo.gl/xi53BKjYm8Ek6jt4A"
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            textDecoration: 'none',
                            '&:hover': { color: accentColor, textDecoration: 'underline' },
                            cursor: 'pointer',
                            display: 'block'
                          }}
                        >
                          {value}
                        </Typography>
                      ) : (
                        <Typography variant="body1" fontWeight={600} color="text.primary">{value}</Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Stack>

              {/* Google Map Embed */}
              <Box sx={{ mt: 'auto', pt: 4 }}>
                <Box sx={{
                  width: '100%', height: '200px', borderRadius: '12px',
                  overflow: 'hidden', border: `1px solid ${borderColor}`
                }}>
                  <iframe
                    title="Osmania University Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3807.135272639016!2d78.52514732609063!3d17.418003883474937!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9971a0691e33%3A0x7d190f2a686a424e!2sOsmania%20University!5e0!3m2!1sen!2sin!4v1743068102640!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Bottom CTA */}
      <Box sx={{ mt: '60px', pt: '50px', textAlign: 'center', borderTop: `1px solid ${borderColor}` }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: textPrimary, mb: 2 }}>
          Ready to start smart crop planning?
        </Typography>
        <Button variant="outlined" endIcon={<ArrowForwardIcon />} sx={{
          color: accentColor, borderColor: accentColor, borderRadius: '8px',
          textTransform: 'none', fontWeight: 600, px: 3, py: 1,
          '&:hover': { backgroundColor: isDark ? 'rgba(57,255,106,0.1)' : '#f1f8e9', borderColor: isDark ? '#39FF6A' : '#1b5e20' }
        }}>
          Get Recommendation
        </Button>
      </Box>
    </Box>
  );
};

export default ContactPage;
