import React, { useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ColorModeProvider, useColorMode } from './context/ThemeContext';
import { getTheme } from './theme';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeaturesPage from './pages/FeaturesPage';
import HowItWorksPage from './pages/HowItWorksPage';
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
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Navbar />
    <main style={{ flex: 1 }}>{children}</main>
    <Footer />
  </div>
);

function ThemedApp() {
  const { mode } = useColorMode();
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
          <Route path="/features" element={<MainLayout><FeaturesPage /></MainLayout>} />
          <Route path="/how-it-works" element={<MainLayout><HowItWorksPage /></MainLayout>} />
          <Route path="/contact" element={<MainLayout><ContactPage /></MainLayout>} />
          <Route path="/about" element={<MainLayout><AboutPage /></MainLayout>} />
          <Route path="/dashboard" element={<MainLayout><DashboardPage /></MainLayout>} />
          <Route path="/dashboard/calendar" element={<MainLayout><FarmCalendar /></MainLayout>} />
          <Route path="/dashboard/weather" element={<MainLayout><WeatherCenter /></MainLayout>} />
          <Route path="/dashboard/analytics" element={<MainLayout><FarmAnalytics /></MainLayout>} />
          <Route path="/add-crop" element={<MainLayout><AddCropPage /></MainLayout>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
        <Route path="/features" element={<MainLayout><FeaturesPage /></MainLayout>} />
        <Route path="/how-it-works" element={<MainLayout><HowItWorksPage /></MainLayout>} />
        <Route path="/contact" element={<MainLayout><ContactPage /></MainLayout>} />
        <Route path="/about" element={<MainLayout><AboutPage /></MainLayout>} />
        <Route path="/dashboard" element={<MainLayout><DashboardPage /></MainLayout>} />
        <Route path="/dashboard/calendar" element={<MainLayout><FarmCalendar /></MainLayout>} />
        <Route path="/dashboard/weather" element={<MainLayout><WeatherCenter /></MainLayout>} />
        <Route path="/dashboard/analytics" element={<MainLayout><FarmAnalytics /></MainLayout>} />
        <Route path="/add-crop" element={<MainLayout><AddCropPage /></MainLayout>} />
        <Route path="/recommendation" element={<MainLayout><RecommendationPage /></MainLayout>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
}

export default App;
