import React from 'react';
import {
  Box, Container, Typography, Grid, Paper, Stack
} from '@mui/material';
import {
  Lightbulb as SolutionIcon,
  WbCloudy as WeatherIcon,
  CalendarToday as CalendarIcon,
  Insights as AnalyticsIcon,
  EmojiObjects as ProblemIcon,
  TipsAndUpdates as IdeasIcon,
} from '@mui/icons-material';
import { useColorMode } from '../context/ThemeContext';

const AboutPage = () => {
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
    <Box sx={{ mt: '70px', width: '100%', pb: 0, backgroundColor: bgDefault }}>

      {/* 1. Top Intro Block */}
      <Box sx={{ backgroundColor: altBg, pt: '70px', pb: '40px', textAlign: 'center' }}>
        <Container maxWidth="md" sx={{ maxWidth: '720px !important', margin: 'auto' }}>
          <Typography variant="h3" component="h1"
            sx={{ fontWeight: 800, color: textPrimary, mb: 2, fontSize: { xs: '2.2rem', md: '2.8rem' } }}>
            About SmartAgri
          </Typography>
          <Typography variant="h6" sx={{ color: textSecondary, fontWeight: 400, lineHeight: 1.6 }}>
            SmartAgri is an AI-based agriculture decision support platform<br/>
            that helps farmers choose suitable crops, plan cultivation activities,<br/>
            and reduce farming risks using data analytics.
          </Typography>
        </Container>
      </Box>

      {/* 2. Agriculture Problem Explanation */}
      <Box sx={{ py: '60px', backgroundColor: bgDefault }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ maxWidth: '520px', mx: 'auto' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: textPrimary, mb: 4 }}>
                  Challenges in Modern Agriculture
                </Typography>
                <Stack spacing={2.5}>
                  {['Climate uncertainty', 'Wrong crop selection', 'Poor fertilizer planning', 'Lack of digital guidance'].map((item) => (
                    <Typography key={item} variant="body1" sx={{ color: textSecondary, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box component="span" sx={{ minWidth: 8, height: 8, borderRadius: '50%', backgroundColor: accentColor }} />
                      {item}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{
                height: '280px', borderRadius: '16px', backgroundColor: altBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px dashed ${borderColor}`
              }}>
                <ProblemIcon sx={{ fontSize: 80, color: borderColor }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 3. Our Smart Solution */}
      <Box sx={{ py: '60px', backgroundColor: altBg }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center" direction={{ xs: 'column-reverse', md: 'row' }} justifyContent="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ height: '320px', borderRadius: '16px', backgroundColor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IdeasIcon sx={{ fontSize: 100, color: accentColor, opacity: 0.8 }} />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ maxWidth: '520px', mx: 'auto' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: textPrimary, mb: 3 }}>Our Smart Solution</Typography>
                <Typography variant="body1" sx={{ color: textSecondary, mb: 4, lineHeight: 1.8 }}>
                  SmartAgri uses intelligent systems to provide active support to modern farmers.
                </Typography>
                <Grid container spacing={2}>
                  {['AI crop recommendation', 'Cultivation guidance', 'Weather-based alerts', 'Smart farming calendar', 'Analytics dashboard'].map((item) => (
                    <Grid item xs={12} sm={6} key={item}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: accentColor, display: 'flex', alignItems: 'center', gap: 1 }}>
                        ✓ {item}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 4. Feature Highlight Mini Cards */}
      <Box sx={{ mt: '40px', pb: '60px', backgroundColor: bgDefault }}>
        <Container maxWidth="lg">
          <Grid container spacing={3.5} justifyContent="center">
            {[
              { icon: <SolutionIcon />, title: "AI Crop Recommendation", desc: "Smarter crop selection" },
              { icon: <CalendarIcon />, title: "Smart Activity Calendar", desc: "Plan cultivation steps" },
              { icon: <WeatherIcon />, title: "Weather Risk Alerts", desc: "Real-time updates" },
              { icon: <AnalyticsIcon />, title: "Yield & Profit Analytics", desc: "Data-driven growth" }
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper elevation={0} sx={{
                  p: '22px', borderRadius: '14px', border: `1px solid ${borderColor}`,
                  backgroundColor: bgPaper, display: 'flex', flexDirection: 'column',
                  backdropFilter: isDark ? 'blur(10px)' : 'none',
                  alignItems: 'center', textAlign: 'center', justifyContent: 'center', height: '100%'
                }}>
                  <Box sx={{ p: 1.5, borderRadius: '12px', backgroundColor: iconBg, color: accentColor, mb: 2, display: 'inline-flex' }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: textPrimary, mb: 1 }}>{feature.title}</Typography>
                  <Typography variant="body2" sx={{ color: textSecondary }}>{feature.desc}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 5. Vision Section */}
      <Box sx={{ py: '70px', backgroundColor: altBg }}>
        <Container maxWidth="md" sx={{ textAlign: 'center', maxWidth: '620px !important' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: textPrimary, mb: 4 }}>Our vision</Typography>
          <Typography variant="h6" sx={{ color: textSecondary, fontWeight: 400, lineHeight: 1.8 }}>
            Our vision is to support sustainable agriculture by integrating artificial intelligence,
            environmental data analysis, and digital planning tools that empower farmers to make
            informed and profitable decisions.
          </Typography>
        </Container>
      </Box>

      {/* 6. Academic Footer */}
      <Box sx={{ p: '40px', textAlign: 'center', opacity: 0.8, backgroundColor: bgDefault }}>
        <Typography variant="body2" sx={{ fontSize: '14px', color: textPrimary, fontWeight: 600, mb: 0.5 }}>
          Smart Agriculture System
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '14px', color: textSecondary }}>
          Developed By: Netturi Hithesh & Team<br/>
          Technologies: React, FastAPI, Scikit-learn, Firebase
        </Typography>
      </Box>
    </Box>
  );
};

export default AboutPage;
