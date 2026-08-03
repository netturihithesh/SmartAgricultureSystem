import React, { useMemo, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ColorModeProvider, useColorMode } from './context/ThemeContext';
import { getTheme } from './theme';
import { supabase } from './supabase';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeaturesPage from './pages/FeaturesPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import RecommendationPage from './pages/RecommendationPage';
import FarmCalendar from './pages/FarmCalendar';
import WeatherCenter from './pages/WeatherCenter';
import ProfitPage from './pages/ProfitPage';
import CropJourneyPage from './pages/CropJourneyPage';
import MyCropsPage from './pages/MyCropsPage';
import DiseaseDetectionPage from './pages/DiseaseDetectionPage';
import KnowledgeCenterPage from './pages/KnowledgeCenterPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import AddCropPage from './pages/AddCropPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import './index.css';

import { Box } from '@mui/material';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const MainLayout = ({ children, session }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 80 : 250;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%', bgcolor: '#F8FAFC' }}>
      {session ? (
        <>
          <Sidebar session={session} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
          <Box sx={{ 
            width: { xs: '100%', md: `calc(100% - ${sidebarWidth}px)` }, 
            minWidth: 0, 
            ml: { xs: 0, md: `${sidebarWidth}px` }, 
            transition: 'all 0.3s ease',
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh' 
          }}>
            <main style={{ flex: 1, paddingTop: '10px' }}>{children}</main>
            <Footer />
          </Box>
        </>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
          <Navbar session={session} />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </Box>
      )}
    </Box>
  );
};

function ThemedApp() {
  const { mode } = useColorMode();
  const theme = useMemo(() => getTheme(mode), [mode]);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0ebe0', color: '#2d5a1b', fontFamily: 'sans-serif' }}>Loading SmartAgri...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout session={session}><HomePage /></MainLayout>} />
          <Route path="/features" element={<MainLayout session={session}><FeaturesPage /></MainLayout>} />
          <Route path="/contact" element={<MainLayout session={session}><ContactPage /></MainLayout>} />
          <Route path="/about" element={<MainLayout session={session}><AboutPage /></MainLayout>} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/my-crops" element={<PrivateRoute session={session}><MainLayout session={session}><MyCropsPage /></MainLayout></PrivateRoute>} />
          <Route path="/calendar" element={<PrivateRoute session={session}><MainLayout session={session}><FarmCalendar /></MainLayout></PrivateRoute>} />
          <Route path="/weather" element={<PrivateRoute session={session}><MainLayout session={session}><WeatherCenter /></MainLayout></PrivateRoute>} />
          <Route path="/profit" element={<PrivateRoute session={session}><MainLayout session={session}><ProfitPage /></MainLayout></PrivateRoute>} />
          <Route path="/journey" element={<PrivateRoute session={session}><MainLayout session={session}><CropJourneyPage /></MainLayout></PrivateRoute>} />
          <Route path="/disease-detection" element={<PrivateRoute session={session}><MainLayout session={session}><DiseaseDetectionPage /></MainLayout></PrivateRoute>} />
          <Route path="/knowledge-center" element={<PrivateRoute session={session}><MainLayout session={session}><KnowledgeCenterPage /></MainLayout></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute session={session}><MainLayout session={session}><NotificationsPage /></MainLayout></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute session={session}><MainLayout session={session}><ProfilePage /></MainLayout></PrivateRoute>} />
          <Route path="/recommendation" element={<PrivateRoute session={session}><MainLayout session={session}><RecommendationPage /></MainLayout></PrivateRoute>} />
          <Route path="/add-crop" element={<PrivateRoute session={session}><MainLayout session={session}><AddCropPage /></MainLayout></PrivateRoute>} />
          <Route path="/admin" element={<MainLayout session={session}><AdminDashboardPage /></MainLayout>} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

function App() {
  return (
    <ColorModeProvider>
      <ThemedApp />
    </ColorModeProvider>
  );
}

export default App;
