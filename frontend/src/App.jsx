import React, { useMemo, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ColorModeProvider, useColorMode } from './context/ThemeContext';
import { getTheme } from './theme';
import { supabase } from './supabase';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeaturesPage from './pages/FeaturesPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import DashboardPage from './pages/DashboardPage';
import RecommendationPage from './pages/RecommendationPage';
import FarmCalendar from './pages/FarmCalendar';
import WeatherCenter from './pages/WeatherCenter';
import FarmAnalytics from './pages/FarmAnalytics';
import AddCropPage from './pages/AddCropPage';
import './index.css';

const MainLayout = ({ children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
    <Navbar />
    <main style={{ flex: 1 }}>{children}</main>
    <Footer />
  </div>
);

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
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
          <Route path="/features" element={<MainLayout><FeaturesPage /></MainLayout>} />
          <Route path="/contact" element={<MainLayout><ContactPage /></MainLayout>} />
          <Route path="/about" element={<MainLayout><AboutPage /></MainLayout>} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<PrivateRoute session={session}><MainLayout><DashboardPage /></MainLayout></PrivateRoute>} />
          <Route path="/dashboard/calendar" element={<PrivateRoute session={session}><MainLayout><FarmCalendar /></MainLayout></PrivateRoute>} />
          <Route path="/dashboard/weather" element={<PrivateRoute session={session}><MainLayout><WeatherCenter /></MainLayout></PrivateRoute>} />
          <Route path="/dashboard/analytics" element={<PrivateRoute session={session}><MainLayout><FarmAnalytics /></MainLayout></PrivateRoute>} />
          <Route path="/recommendation" element={<PrivateRoute session={session}><MainLayout><RecommendationPage /></MainLayout></PrivateRoute>} />
          <Route path="/add-crop" element={<PrivateRoute session={session}><MainLayout><AddCropPage /></MainLayout></PrivateRoute>} />

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

