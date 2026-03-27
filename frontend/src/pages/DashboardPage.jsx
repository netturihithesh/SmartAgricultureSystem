import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Button, Avatar, Chip } from '@mui/material';
import { LocationOn, SquareFoot, Terrain, WaterDrop, WbSunny, Agriculture, Logout, Recommend } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          navigate('/login');
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;

        setProfile(profileData);
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress sx={{ color: '#2E7D32' }} />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
        <Typography variant="h5" color="text.secondary">Oops! We couldn't load your farm data.</Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/register')}>Back to Home</Button>
      </Box>
    );
  }

  const StatCard = ({ icon, title, value, color }) => (
    <Paper sx={{ 
      p: 3, 
      borderRadius: '20px', 
      display: 'flex', 
      alignItems: 'center', 
      gap: 2.5,
      boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
      border: '1px solid rgba(0,0,0,0.03)',
      transition: 'all 0.3s ease',
      '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }
    }}>
      <Box sx={{ width: 56, height: 56, borderRadius: '16px', backgroundColor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {React.cloneElement(icon, { sx: { color, fontSize: 28 } })}
      </Box>
      <Box>
        <Typography sx={{ fontSize: '14px', color: '#777', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', mb: '4px' }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: '18px', color: '#222', fontWeight: 700 }}>
          {value || 'Not provided'}
        </Typography>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ p: { xs: 3, md: 6 }, mt: { xs: 2, md: 4 }, maxWidth: '1200px', margin: '0 auto', minHeight: '80vh' }}>
      
      {/* Header Section */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 5, gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar sx={{ width: 72, height: 72, backgroundColor: '#2E7D32', fontSize: '28px', fontWeight: 700, boxShadow: '0 8px 24px rgba(46,125,50,0.2)' }}>
            {profile.full_name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#111', mb: '4px', wordBreak: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word' }}>
              Welcome back, {profile.full_name}! 👋
            </Typography>
            <Typography sx={{ fontSize: '16px', color: '#666', fontWeight: 500 }}>
              Here is the latest overview of your farm setup.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Content Grid */}
      <Grid container spacing={4}>
        
        {/* Left Column - Farm Details */}
        <Grid item xs={12} md={8}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#333', mb: 3 }}>Your Farm Profile</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <StatCard icon={<LocationOn />} title="Location" value={profile.location} color="#1976D2" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StatCard icon={<SquareFoot />} title="Land Size" value={profile.land_size} color="#E64A19" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StatCard icon={<Terrain />} title="Soil Type" value={profile.soil_type} color="#5D4037" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StatCard icon={<WaterDrop />} title="Irrigation Method" value={profile.irrigation} color="#0288D1" />
            </Grid>
            <Grid item xs={12}>
              <StatCard icon={<WbSunny />} title="Current Season" value={profile.season} color="#FFA000" />
            </Grid>
          </Grid>
        </Grid>

        {/* Right Column - AI Recommendations Placeholder */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 4, 
            borderRadius: '24px', 
            background: 'linear-gradient(145deg, #2E7D32 0%, #1B5E20 100%)',
            color: '#fff',
            boxShadow: '0 20px 40px rgba(46,125,50,0.3)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background pattern */}
            <Agriculture sx={{ position: 'absolute', fontSize: '200px', color: 'rgba(255,255,255,0.05)', top: '-50px', right: '-50px', transform: 'rotate(-15deg)' }} />
            
            <Recommend sx={{ fontSize: '56px', mb: 2, color: '#C8E6C9' }} />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>AI Crop Suggestions</Typography>
            <Typography sx={{ fontSize: '15px', color: '#E8F5E9', mb: 4, lineHeight: 1.6 }}>
              We are currently analyzing your soil type, irrigation limits, and regional data to generate the most profitable crop options for you.
            </Typography>
            <Chip 
              label="Check back shortly" 
              sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600, px: 2, py: 2.5, borderRadius: '12px', fontSize: '14px' }}
            />
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default DashboardPage;
