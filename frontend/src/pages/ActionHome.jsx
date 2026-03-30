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
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '800px', margin: '0 auto', minHeight: '80vh', mt: { xs: 2, md: 4 } }}>
      
      {/* 1. Top Bar */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#111', fontSize: { xs: '26px', sm: '32px' } }}>
          Welcome, {profile.full_name?.split(' ')[0]} 👋
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip 
            icon={<LocationOn sx={{ color: '#E64A19 !important' }} />} 
            label={profile.location} 
            sx={{ backgroundColor: '#FBE9E7', color: '#D84315', fontWeight: 600, fontSize: '14px', px: 1 }} 
          />
          <Chip 
            icon={<WbSunny sx={{ color: '#F57F17 !important' }} />} 
            label={`Season: ${profile.season || 'Kharif'}`} 
            sx={{ backgroundColor: '#FFFDE7', color: '#F57F17', fontWeight: 600, fontSize: '14px', px: 1 }} 
          />
        </Box>
      </Box>

      {/* 4. Smart Alert */}
      {smartAlert && (
        <Paper sx={{ 
          p: 2.5, mb: 4, borderRadius: '16px', backgroundColor: smartAlert.bgColor, 
          border: `1px solid ${smartAlert.iconColor}40`, display: 'flex', alignItems: 'center', gap: 2 
        }}>
          <Avatar sx={{ backgroundColor: smartAlert.iconColor, color: '#fff' }}>
            {smartAlert.severity === 'success' ? <Spoke /> : <WarningAmber />}
          </Avatar>
          <Box>
            <Typography sx={{ fontWeight: 700, color: smartAlert.iconColor, fontSize: '15px' }}>
              {smartAlert.title}
            </Typography>
            <Typography sx={{ color: '#555', fontSize: '14px', fontWeight: 500 }}>
              {smartAlert.message}
            </Typography>
          </Box>
        </Paper>
      )}

      {/* 2. Main Action (CENTER FOCUS) OR 5. Current Crop */}
      <Paper sx={{ 
        p: { xs: 4, sm: 6 }, mb: 4, borderRadius: '24px', textAlign: 'center',
        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
        color: '#fff', boxShadow: '0 24px 48px rgba(46,125,50,0.3)',
        position: 'relative', overflow: 'hidden'
      }}>
        <Spoke sx={{ position: 'absolute', top: '-10%', left: '-5%', fontSize: '150px', color: 'rgba(255,255,255,0.05)', animation: 'spin 20s linear infinite', '@keyframes spin': { '100%': { transform: 'rotate(360deg)' } } }} />
        
        {hasCurrentCrop ? (
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Agriculture sx={{ fontSize: '48px', mb: 2, color: '#C8E6C9' }} />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.5px' }}>
              🌾 Current Crop: Paddy
            </Typography>
            <Typography sx={{ fontSize: '16px', color: '#E8F5E9', mb: 4, fontWeight: 500 }}>
              Next Task: Apply Fertilizer Tomorrow
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/dashboard')}
              sx={{ 
                backgroundColor: '#fff', color: '#1B5E20', borderRadius: '14px', py: 1.5, px: 4,
                fontSize: '16px', fontWeight: 800, textTransform: 'none',
                '&:hover': { backgroundColor: '#F1F8E9', transform: 'scale(1.02)' }, transition: 'all 0.2s ease'
              }}
            >
              View Plan
            </Button>
          </Box>
        ) : (
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Agriculture sx={{ fontSize: '56px', mb: 2, color: '#C8E6C9' }} />
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5, letterSpacing: '-0.5px', fontSize: { xs: '24px', sm: '32px' } }}>
              Start Crop Recommendation
            </Typography>
            <Typography sx={{ fontSize: '15px', color: '#E8F5E9', mb: 4, maxWidth: '400px', mx: 'auto', fontWeight: 500 }}>
              Let our AI analyze your soil, land size, and weather to predict the most profitable crop.
            </Typography>
            <Button 
              variant="contained" 
              endIcon={<ArrowForward />}
              onClick={handleRecommendationClick}
              sx={{ 
                backgroundColor: '#fff', color: '#1B5E20', borderRadius: '16px', py: 2, px: 5,
                fontSize: { xs: '16px', sm: '18px' }, fontWeight: 800, textTransform: 'none',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                '&:hover': { backgroundColor: '#F1F8E9', transform: 'translateY(-2px)', boxShadow: '0 12px 32px rgba(0,0,0,0.2)' }, transition: 'all 0.3s ease'
              }}
            >
              Get Recommendation
            </Button>
          </Box>
        )}
      </Paper>

      {/* 3. Quick Options */}
      <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#444', mb: 2 }}>Quick Access</Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Box sx={{ p: 2, borderRadius: '16px', backgroundColor: '#FAFAFA', border: '1px solid #EEE', display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', '&:hover': { backgroundColor: '#F5F5F5' } }}>
            <CalendarMonth sx={{ color: '#1976D2' }} />
            <Typography sx={{ fontWeight: 600, color: '#333', fontSize: '15px' }}>Open Calendar</Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Box sx={{ p: 2, borderRadius: '16px', backgroundColor: '#FAFAFA', border: '1px solid #EEE', display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', '&:hover': { backgroundColor: '#F5F5F5' } }}>
            <WbCloudy sx={{ color: '#0288D1' }} />
            <Typography sx={{ fontWeight: 600, color: '#333', fontSize: '15px' }}>Weather Alerts</Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Box sx={{ p: 2, borderRadius: '16px', backgroundColor: '#FAFAFA', border: '1px solid #EEE', display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', '&:hover': { backgroundColor: '#F5F5F5' } }}>
            <BarChart sx={{ color: '#7B1FA2' }} />
            <Typography sx={{ fontWeight: 600, color: '#333', fontSize: '15px' }}>Analytics</Typography>
          </Box>
        </Grid>
      </Grid>
      
    </Box>
  );
};

export default ActionHome;
