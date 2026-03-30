import React, { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { supabase } from '../supabase';
import ActionHome from './ActionHome';
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => subscription?.unsubscribe();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress sx={{ color: '#2E7D32' }} />
      </Box>
    );
  }

  // If the user is logged in, show the personalized Action Home instead of Marketing
  if (session) {
    return <ActionHome session={session} />;
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
