import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper,
  Stack
} from '@mui/material';
import { 
  Lightbulb as SolutionIcon,
  WbCloudy as WeatherIcon,
  CalendarToday as CalendarIcon,
  Insights as AnalyticsIcon,
  EmojiObjects as ProblemIcon,
  TipsAndUpdates as IdeasIcon,
} from '@mui/icons-material';

const AboutPage = () => {
  return (
    <Box sx={{ mt: '70px', width: '100%', pb: 0, backgroundColor: '#ffffff' }}>
      
      {/* 1. Top Intro Block */}
      <Box 
        sx={{ 
          backgroundColor: '#f7faf8', 
          pt: '70px', 
          pb: '40px',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md" sx={{ maxWidth: '720px !important', margin: 'auto' }}>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ fontWeight: 800, color: '#1a1a1a', mb: 2, fontSize: { xs: '2.2rem', md: '2.8rem' } }}
          >
            About SmartAgri
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ color: '#555', fontWeight: 400, lineHeight: 1.6 }}
          >
            SmartAgri is an AI-based agriculture decision support platform<br/>
            that helps farmers choose suitable crops, plan cultivation activities,<br/>
            and reduce farming risks using data analytics.
          </Typography>
        </Container>
      </Box>

      {/* 2. Agriculture Problem Explanation */}
      <Box sx={{ py: '60px' }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center" justifyContent="center">
            {/* Left: Text */}
            <Grid item xs={12} md={6}>
              <Box sx={{ maxWidth: '520px', mx: 'auto' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 4 }}>
                  Challenges in Modern Agriculture
                </Typography>
                <Stack spacing={2.5}>
                  <Typography variant="body1" sx={{ color: '#555', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box component="span" sx={{ minWidth: 8, height: 8, borderRadius: '50%', backgroundColor: '#2e7d32' }} />
                    Climate uncertainty
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#555', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box component="span" sx={{ minWidth: 8, height: 8, borderRadius: '50%', backgroundColor: '#2e7d32' }} />
                    Wrong crop selection
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#555', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box component="span" sx={{ minWidth: 8, height: 8, borderRadius: '50%', backgroundColor: '#2e7d32' }} />
                    Poor fertilizer planning
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#555', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box component="span" sx={{ minWidth: 8, height: 8, borderRadius: '50%', backgroundColor: '#2e7d32' }} />
                    Lack of digital guidance
                  </Typography>
                </Stack>
              </Box>
            </Grid>
            {/* Right: Abstract Illustration */}
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  height: '280px', 
                  borderRadius: '16px', 
                  backgroundColor: '#f7faf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px dashed #c8e6c9'
                }}
              >
                <ProblemIcon sx={{ fontSize: 80, color: '#c8e6c9' }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 3. Our Smart Solution (Core Part) */}
      <Box sx={{ py: '60px', backgroundColor: '#fdfdfd' }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center" direction={{ xs: 'column-reverse', md: 'row' }} justifyContent="center">
            {/* Left: Content Illustration */}
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  height: '320px', 
                  borderRadius: '16px', 
                  backgroundColor: '#e8f5e9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <IdeasIcon sx={{ fontSize: 100, color: '#2e7d32', opacity: 0.8 }} />
              </Box>
            </Grid>
            {/* Right: Text */}
            <Grid item xs={12} md={6}>
              <Box sx={{ maxWidth: '520px', mx: 'auto' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 3 }}>
                  Our Smart Solution
                </Typography>
                <Typography variant="body1" sx={{ color: '#555', mb: 4, lineHeight: 1.8 }}>
                  SmartAgri uses intelligent systems to provide active support to modern farmers.
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32', display: 'flex', alignItems: 'center', gap: 1 }}>
                      ✓ AI crop recommendation
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32', display: 'flex', alignItems: 'center', gap: 1 }}>
                      ✓ Cultivation guidance
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32', display: 'flex', alignItems: 'center', gap: 1 }}>
                      ✓ Weather-based alerts
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32', display: 'flex', alignItems: 'center', gap: 1 }}>
                      ✓ Smart farming calendar
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32', display: 'flex', alignItems: 'center', gap: 1 }}>
                      ✓ Analytics dashboard
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 4. Feature Highlight Mini Cards */}
      <Box sx={{ mt: '40px', pb: '60px' }}>
        <Container maxWidth="lg">
          <Grid container spacing={3.5} justifyContent="center">
            
            {[
              { icon: <SolutionIcon />, title: "AI Crop Recommendation", desc: "Smarter crop selection" },
              { icon: <CalendarIcon />, title: "Smart Activity Calendar", desc: "Plan cultivation steps" },
              { icon: <WeatherIcon />, title: "Weather Risk Alerts", desc: "Real-time updates" },
              { icon: <AnalyticsIcon />, title: "Yield & Profit Analytics", desc: "Data-driven growth" }
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: '22px', 
                    borderRadius: '14px', 
                    border: '1px solid #e8ecea',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                  }}
                >
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: '12px', 
                    backgroundColor: '#e8f5e9', 
                    color: '#2e7d32',
                    mb: 2,
                    display: 'inline-flex'
                  }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    {feature.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}

          </Grid>
        </Container>
      </Box>

      {/* 5. Vision Section (Premium Feel) */}
      <Box sx={{ py: '70px', backgroundColor: '#f7faf8' }}>
        <Container maxWidth="md" sx={{ textAlign: 'center', maxWidth: '620px !important' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a1a1a', mb: 4 }}>
            Our vision
          </Typography>
          <Typography variant="h6" sx={{ color: '#444', fontWeight: 400, lineHeight: 1.8 }}>
            Our vision is to support sustainable agriculture by integrating artificial intelligence, environmental data analysis, and digital planning tools that empower farmers to make informed and profitable decisions.
          </Typography>
        </Container>
      </Box>

      {/* 6. Small Academic Info Footer */}
      <Box sx={{ p: '40px', textAlign: 'center', opacity: 0.8 }}>
        <Typography variant="body2" sx={{ fontSize: '14px', color: '#1a1a1a', fontWeight: 600, mb: 0.5 }}>
          Smart Agriculture System
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '14px', color: '#555' }}>
          Developed By: Netturi Hithesh & Team<br/>
          Technologies: React, FastAPI, Scikit-learn, Firebase
        </Typography>
      </Box>

    </Box>
  );
};

export default AboutPage;
