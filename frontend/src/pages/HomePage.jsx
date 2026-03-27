import React, { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabase';
import HeroSection from '../components/HeroSection';
import ProblemSection from '../components/ProblemSection';
import FeaturesSection from '../components/FeaturesSection';
import HowItWorks from '../components/HowItWorks';
import StatsSection from '../components/StatsSection';
import AboutSection from '../components/AboutSection';
import CTASection from '../components/CTASection';

const HomePage = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress sx={{ color: '#2E7D32' }} />
      </Box>
    );
  }

  // If the user is logged in, skip the marketing page and send them to their dashboard
  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

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
