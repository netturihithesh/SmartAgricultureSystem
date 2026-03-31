import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, Grid, Avatar, CircularProgress, Chip } from '@mui/material';
import { 
  LocationOn, WbSunny, CalendarMonth, WbCloudy, BarChart, WarningAmber, 
  Agriculture, ArrowForward, Spoke
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { fetchWeatherAndAlerts } from '../services/weatherService';

const ActionHome = ({ session }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasCurrentCrop, setHasCurrentCrop] = useState(false); // Mock condition for now
  const [smartAlert, setSmartAlert] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (!error && data) {
          setProfile(data);
          
          // Fetch Real Weather Alerts
          const weatherSummary = await fetchWeatherAndAlerts(data.location, import.meta.env.VITE_OPENWEATHER_API_KEY);
          if (weatherSummary && weatherSummary.alert) {
            setSmartAlert(weatherSummary.alert);
          } else {
            // Fallback mock alert if API key is missing or request fails
            setSmartAlert({
              title: "⚠️ Rain expected today",
              message: "Avoid applying fertilizer on your fields to prevent runoff.",
              severity: "warning",
              bgColor: '#FFF8E1',
              iconColor: '#F57F17'
            });
          }
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [session]);

  const handleRecommendationClick = () => {
    // Navigate directly to the interactive recommendation engine flow
    navigate('/recommendation');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress sx={{ color: '#2E7D32' }} />
      </Box>
    );
  }

  if (!profile) return null; // Or some fallback error state

  return (
    <Box className="dashboard-container" sx={{ maxWidth: '1100px', margin: '0 auto', padding: { xs: '16px', md: '32px 24px' }, pt: { xs: '90px', md: '110px' }, minHeight: '80vh' }}>
      
      {/* 1. Top Bar */}
      <Box className="hero-section" sx={{ mt: '20px', mb: '24px' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#111', fontSize: '26px', letterSpacing: '-0.5px' }}>
          Welcome, {profile.full_name?.split(' ')[0]} 👋
        </Typography>
        
        <Box className="badge-row" sx={{ display: 'flex', gap: '12px', flexWrap: 'wrap', mt: '12px' }}>
          <Chip 
            icon={<LocationOn fontSize="small" sx={{ color: '#888 !important' }} />} 
            label={profile.location} 
            size="small"
            sx={{ backgroundColor: '#FAFAFA', color: '#444', fontWeight: 600, fontSize: '13px', border: '1px solid #E0E0E0', borderRadius: '6px' }} 
          />
          <Chip 
            icon={<WbSunny fontSize="small" sx={{ color: '#888 !important' }} />} 
            label={`Season: ${profile.season || 'Kharif'}`} 
            size="small"
            sx={{ backgroundColor: '#FAFAFA', color: '#444', fontWeight: 600, fontSize: '13px', border: '1px solid #E0E0E0', borderRadius: '6px' }} 
          />
        </Box>
      </Box>

      {/* 4. Smart Alert */}
      {smartAlert && (
        <Paper className="alert-card" sx={{ 
          padding: '16px 18px', marginTop: '18px', marginBottom: '24px', borderRadius: '18px', backgroundColor: smartAlert.bgColor, 
          border: `1px solid ${smartAlert.iconColor}40`, display: 'flex', alignItems: 'flex-start', gap: '12px', boxShadow: 'none'
        }}>
          <Avatar sx={{ backgroundColor: smartAlert.iconColor, color: '#fff', width: 36, height: 36 }}>
            {smartAlert.severity === 'success' ? <Spoke fontSize="small" /> : <WarningAmber fontSize="small" />}
          </Avatar>
          <Box className="alert-content">
            <Typography sx={{ fontWeight: 700, color: smartAlert.iconColor, fontSize: '15px', mb: '4px' }}>
              {smartAlert.title}
            </Typography>
            <Typography sx={{ color: '#555', fontSize: '14px', fontWeight: 500, lineHeight: 1.4 }}>
              {smartAlert.message}
            </Typography>
          </Box>
        </Paper>
      )}

      {/* 2. Main Action: Split Hero or Current Crop */}
      {hasCurrentCrop ? (
        <Paper className="home-card" sx={{ 
          p: '28px', mb: '24px', borderRadius: '22px', textAlign: 'center', minHeight: '220px',
          background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
          color: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
          position: 'relative', overflow: 'hidden'
        }}>
          <Spoke sx={{ position: 'absolute', top: '-10%', left: '-5%', fontSize: '150px', color: 'rgba(255,255,255,0.05)', animation: 'spin 20s linear infinite', '@keyframes spin': { '100%': { transform: 'rotate(360deg)' } } }} />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Agriculture sx={{ fontSize: '48px', mb: 2, color: '#C8E6C9' }} />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.5px' }}>
              🌾 Current Crop: Paddy
            </Typography>
            <Typography sx={{ fontSize: '16px', color: '#E8F5E9', mb: 3, fontWeight: 500 }}>
              Next Task: Apply Fertilizer Tomorrow
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/dashboard')}
              sx={{ 
                backgroundColor: '#fff', color: '#1B5E20', borderRadius: '14px', py: 1.5, px: 4, width: '100%', maxWidth: '300px',
                fontSize: '16px', fontWeight: 800, textTransform: 'none',
                '&:hover': { backgroundColor: '#F1F8E9', transform: 'scale(1.02)' }, transition: 'all 0.2s ease'
              }}
            >
              View Plan
            </Button>
          </Box>
        </Paper>
      ) : (
        <Box className="main-grid" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: '24px', mt: '24px', mb: '24px' }}>
          {/* Path A: Machine Learning Route */}
          <Paper className="home-card" sx={{
            p: '28px', borderRadius: '22px', backgroundColor: '#fff',
            border: '1px solid #ececec', boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
            display: 'flex', flexDirection: 'column', minHeight: '220px'
          }}>
            <Box sx={{ flexGrow: 1, mb: '18px' }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: '10px', color: '#222', letterSpacing: '-0.5px' }}>
                🌾 Crop Recommendation
              </Typography>
              <Typography sx={{ fontSize: '15px', color: '#666', fontWeight: 500, lineHeight: 1.5 }}>
                Get smart AI suggestions taking your farm metrics into account to maximize yield.
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              onClick={handleRecommendationClick}
              sx={{ 
                backgroundColor: '#2e7d32', color: '#fff', borderRadius: '14px', height: '52px',
                fontSize: '16px', fontWeight: 700, textTransform: 'none', width: '100%',
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#1b5e20' }, transition: 'all 0.2s ease'
              }}
            >
              Analyze Best Crops
            </Button>
          </Paper>

          {/* Path B: Manual Expert Route */}
          <Paper className="home-card" sx={{
            p: '28px', borderRadius: '22px', backgroundColor: '#fff',
            border: '1px solid #ececec', boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
            display: 'flex', flexDirection: 'column', minHeight: '220px'
          }}>
            <Box sx={{ flexGrow: 1, mb: '18px' }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: '10px', color: '#222', letterSpacing: '-0.5px' }}>
                🌱 Add Existing Plan
              </Typography>
              <Typography sx={{ fontSize: '15px', color: '#666', fontWeight: 500, lineHeight: 1.5 }}>
                Already know what you're planting? Add your crop manually directly to your dashboard.
              </Typography>
            </Box>
            <Button 
              variant="outlined" 
              sx={{ 
                backgroundColor: '#f5fdf6', color: '#2e7d32', borderRadius: '14px', height: '52px',
                fontSize: '16px', fontWeight: 700, textTransform: 'none', width: '100%',
                border: '1px solid #cce8d0',
                '&:hover': { backgroundColor: '#e8f5e9', borderColor: '#2e7d32' }, transition: 'all 0.2s ease'
              }}
              onClick={() => navigate('/add-crop')}
            >
              ➕ Add Crop Manually
            </Button>
          </Paper>
        </Box>
      )}

      {/* 3. Quick Options */}
      <Box className="quick-access" sx={{ mt: '28px', mb: '48px' }}>
        <Typography sx={{ fontSize: '16px', fontWeight: 800, color: '#222', mb: '16px' }}>Quick Access</Typography>
        <Box className="quick-grid" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: '18px' }}>
          <Box className="quick-card" onClick={() => navigate('/dashboard/calendar')} sx={{ height: '72px', borderRadius: '16px', backgroundColor: '#fff', border: '1px solid #e8e8e8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.25s ease', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' } }}>
            <CalendarMonth sx={{ color: '#1976D2', fontSize: '24px' }} />
            <Typography sx={{ fontWeight: 600, color: '#333', fontSize: '13px' }}>Calendar</Typography>
          </Box>
          <Box className="quick-card" onClick={() => navigate('/dashboard/weather')} sx={{ height: '72px', borderRadius: '16px', backgroundColor: '#fff', border: '1px solid #e8e8e8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.25s ease', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' } }}>
            <WbCloudy sx={{ color: '#0288D1', fontSize: '24px' }} />
            <Typography sx={{ fontWeight: 600, color: '#333', fontSize: '13px' }}>Weather</Typography>
          </Box>
          <Box className="quick-card" onClick={() => navigate('/dashboard/analytics')} sx={{ height: '72px', borderRadius: '16px', backgroundColor: '#fff', border: '1px solid #e8e8e8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.25s ease', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' } }}>
            <BarChart sx={{ color: '#7B1FA2', fontSize: '24px' }} />
            <Typography sx={{ fontWeight: 600, color: '#333', fontSize: '13px' }}>Analytics</Typography>
          </Box>
        </Box>
      </Box>
      
    </Box>
  );
};

export default ActionHome;
