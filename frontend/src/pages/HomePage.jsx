import React from 'react';
import { Box } from '@mui/material';
import HeroSection from '../components/HeroSection';
import ProblemSection from '../components/ProblemSection';
import FeaturesSection from '../components/FeaturesSection';
import HowItWorks from '../components/HowItWorks';
import StatsSection from '../components/StatsSection';
import AboutSection from '../components/AboutSection';
import CTASection from '../components/CTASection';

const HomePage = () => {
  return (
    <Box sx={{ mt: '70px', overflowX: 'hidden' }}>
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorks />
      <StatsSection />
      <AboutSection />
      <CTASection />
    </Box>
  );
};

export default HomePage;
