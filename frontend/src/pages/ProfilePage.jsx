import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Container, TextField, Button, Avatar, Divider, Chip } from '@mui/material';
import { Person, LocationOn, Phone, Email, Straighten, Save, CheckCircle, CalendarToday, Security } from '@mui/icons-material';
import { supabase } from '../supabase';

const ProfilePage = () => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState({
    full_name: 'Netturi Hithesh',
    location: 'Kamareddy, Telangana',
    land_size: '2.5 Acres',
    phone: '+91 98765 43210',
    email: 'farmer@smartagri.com'
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data }) => {
          if (data) {
            setProfile({
              full_name: data.full_name || 'Netturi Hithesh',
              location: data.location || 'Kamareddy, Telangana',
              land_size: data.land_size || '2.5 Acres',
              phone: data.phone || '+91 98765 43210',
              email: session.user.email || 'farmer@smartagri.com'
            });
          }
        });
      }
    });
  }, []);

  const handleSaveProfile = async () => {
    if (session?.user?.id) {
      await supabase.from('profiles').upsert({
        id: session.user.id,
        full_name: profile.full_name,
        location: profile.location,
        land_size: profile.land_size,
        updated_at: new Date()
      });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3, lg: 4 }, pb: 10, bgcolor: '#F8FAFC', minHeight: '100vh', width: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        position: 'relative',
        minHeight: '120px'
      }}>
        <Box sx={{ zIndex: 2, position: 'relative' }}>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', fontSize: { xs: '26px', md: '32px' } }}>
            Farmer Profile & Settings
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748B', mt: 1, fontWeight: 500 }}>
            Manage your personal details, farm information, and preferences.
          </Typography>
        </Box>
        <Box 
          sx={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: '600px',
            height: '200px',
            backgroundImage: `url('/assets/bg_abstract_green.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%)',
            maskImage: 'linear-gradient(to right, transparent, black 40%)',
            opacity: 0.6,
            zIndex: 1,
            pointerEvents: 'none'
          }}
        />
      </Box>

      <Grid container spacing={4}>
        {/* Profile Card Left */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ borderRadius: '24px', bgcolor: '#fff', border: '1px solid #E2E8F0', textAlign: 'center', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <Box sx={{ height: '140px', bgcolor: '#86EFAC', backgroundImage: `linear-gradient(to bottom, rgba(5,150,105,0.85), rgba(16,185,129,0.75)), url('/assets/bg_abstract_green.png')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            
            <Box sx={{ px: 4, pb: 4, mt: -6 }}>
              <Avatar
                sx={{ width: 100, height: 100, bgcolor: '#059669', fontSize: 40, fontWeight: 900, margin: '0 auto', mb: 2, border: '5px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              >
                {profile.full_name?.slice(0, 2).toUpperCase() || 'NH'}
              </Avatar>

              <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', mb: 1 }}>
                {profile.full_name}
              </Typography>
              <Chip icon={<CheckCircle sx={{ fontSize: 16 }} />} label="Verified Farmer" sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 800, mb: 4 }} />

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, textAlign: 'left' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 1, bgcolor: '#F0FDF4', borderRadius: '10px', color: '#10B981', display: 'flex' }}><LocationOn sx={{ fontSize: 20 }} /></Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>Location</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#334155' }}>{profile.location}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 1, bgcolor: '#F0FDF4', borderRadius: '10px', color: '#10B981', display: 'flex' }}><Straighten sx={{ fontSize: 20 }} /></Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>Land Size</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#334155' }}>{profile.land_size}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 1, bgcolor: '#F0FDF4', borderRadius: '10px', color: '#10B981', display: 'flex' }}><Email sx={{ fontSize: 20 }} /></Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>Email</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#334155' }}>{profile.email}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 1, bgcolor: '#F0FDF4', borderRadius: '10px', color: '#10B981', display: 'flex' }}><CalendarToday sx={{ fontSize: 20 }} /></Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>Member Since</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#334155' }}>May 2024</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Profile Edit Form Right */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: '24px', bgcolor: '#fff', border: '1px solid #E2E8F0', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box sx={{ p: 1.5, bgcolor: '#ECFDF5', borderRadius: '12px', color: '#059669', display: 'flex' }}>
                <Person sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A' }}>
                  Edit Account Information
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
                  Update your details and keep your profile up to date.
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {saved && (
              <Box sx={{ p: 2, bgcolor: '#ECFDF5', borderRadius: '14px', border: '1px solid #A7F3D0', color: '#047857', fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle sx={{ fontSize: 20 }} />
                Profile details saved successfully!
              </Box>
            )}

            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person sx={{ fontSize: 16, color: '#10B981' }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569' }}>Full Name</Typography>
                </Box>
                <TextField
                  fullWidth
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone sx={{ fontSize: 16, color: '#10B981' }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569' }}>Phone Number</Typography>
                </Box>
                <TextField
                  fullWidth
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn sx={{ fontSize: 16, color: '#10B981' }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569' }}>Location / District</Typography>
                </Box>
                <TextField
                  fullWidth
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Straighten sx={{ fontSize: 16, color: '#10B981' }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569' }}>Land Size (Acres)</Typography>
                </Box>
                <TextField
                  fullWidth
                  value={profile.land_size}
                  onChange={(e) => setProfile({ ...profile, land_size: e.target.value })}
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
            </Grid>

            {/* Security Banner */}
            <Box sx={{ mt: 'auto', pt: 6 }}>
              <Box sx={{ p: 2.5, bgcolor: '#F0FDF4', borderRadius: '16px', border: '1px solid #DCFCE7', display: 'flex', alignItems: 'center', gap: 2, position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ p: 1.2, bgcolor: '#10B981', borderRadius: '12px', color: '#fff', display: 'flex', zIndex: 2 }}>
                  <Security sx={{ fontSize: 24 }} />
                </Box>
                <Box sx={{ zIndex: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0F172A' }}>Your information is secure</Typography>
                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>We use industry standard security to protect your data.</Typography>
                </Box>
                <Security sx={{ position: 'absolute', right: -20, top: -20, fontSize: 140, color: '#10B981', opacity: 0.1, zIndex: 1 }} />
              </Box>
            </Box>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSaveProfile}
                sx={{ bgcolor: '#059669', color: '#fff', fontWeight: 800, borderRadius: '12px', textTransform: 'none', px: 4, py: 1.5, '&:hover': { bgcolor: '#047857' } }}
              >
                Save Changes
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
