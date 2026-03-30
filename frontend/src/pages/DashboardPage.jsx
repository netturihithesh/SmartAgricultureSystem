import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Chip, Divider, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Autocomplete } from '@mui/material';
import { LocationOn, SquareFoot, Terrain, AccountCircle, Spa, TrendingUp, MonetizationOn, Flag, Edit } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import FarmCalendar from '../components/FarmCalendar';
import statesData from '../data/statesDistricts.json';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // Edit Profile States
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({ full_name: '', state: '', district: '', soil_type: '', land_size: '', irrigation: '' });
  const [updating, setUpdating] = useState(false);

  const indianStates = Object.keys(statesData);
  const availableDistricts = editData.state ? (statesData[editData.state] || []) : [];

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
        
        // Hydrate District/State from profile.location (e.g., "Nizamabad, Telangana")
        let currentState = '';
        let currentDistrict = '';
        if (profileData.location) {
          const locParts = profileData.location.split(',').map(s => s.trim());
          if (locParts.length >= 2) {
            currentDistrict = locParts[0];
            currentState = locParts[1];
          } else {
            currentState = locParts[0] || '';
          }
        }

        setEditData({
          full_name: profileData.full_name || '',
          state: currentState,
          district: currentDistrict,
          soil_type: profileData.soil_type || '',
          land_size: profileData.land_size ? parseFloat(profileData.land_size) : '', 
          irrigation: profileData.irrigation || ''
        });
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [navigate]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress sx={{ color: '#2E7D32' }} />
      </Box>
    );
  }

  if (!profile) return null;

  const handleSaveProfile = async () => {
    setUpdating(true);
    try {
      const formattedLandSize = `${editData.land_size} Acres`;
      const formattedLocation = `${editData.district}, ${editData.state}`;

      const { error } = await supabase.from('profiles').update({
        full_name: editData.full_name,
        location: formattedLocation,
        soil_type: editData.soil_type,
        land_size: formattedLandSize,
        irrigation: editData.irrigation
      }).eq('id', profile.id);
      
      if (error) throw error;

      setProfile({ 
        ...profile, 
        full_name: editData.full_name, 
        location: formattedLocation,
        soil_type: editData.soil_type, 
        land_size: formattedLandSize, 
        irrigation: editData.irrigation 
      });
      setEditOpen(false);
    } catch (e) {
        console.error("Failed to update profile", e);
    } finally {
        setUpdating(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4, lg: 6 }, mt: { xs: 2, md: 4 }, maxWidth: '1300px', margin: '0 auto', minHeight: '80vh' }}>
      
      <Typography variant="h3" sx={{ fontWeight: 800, color: '#111', mb: 1, fontSize: { xs: '28px', md: '36px' } }}>
        Farm Dashboard
      </Typography>
      <Typography sx={{ fontSize: '16px', color: '#666', mb: 5, fontWeight: 500 }}>
        Detailed analytics, history, and farm health tracking.
      </Typography>

      <Grid container spacing={4}>
        
        {/* LEF T / TOP -> Profile Card */}
        <Grid size={{ xs: 12, md: 4, lg: 3 }}>
          <Paper sx={{ p: 3, borderRadius: '24px', backgroundColor: '#fff', boxShadow: '0 16px 40px rgba(0,0,0,0.06)', position: 'sticky', top: '100px' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3, textAlign: 'center' }}>
              <Box sx={{ width: 80, height: 80, borderRadius: '24px', backgroundColor: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <AccountCircle sx={{ fontSize: '50px', color: '#2E7D32' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#111', mb: 0.5, wordBreak: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word' }}>
                {profile.full_name}
              </Typography>
              <Chip icon={<LocationOn sx={{ fontSize: '16px' }} />} label={profile.location} size="small" sx={{ backgroundColor: '#F1F8E9', color: '#33691E', fontWeight: 600, mb: 2 }} />
              <Button variant="outlined" size="small" startIcon={<Edit />} onClick={() => setEditOpen(true)} sx={{ borderRadius: '8px', textTransform: 'none', color: '#2E7D32', borderColor: '#2E7D32' }}>
                Edit Profile
              </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '12px', backgroundColor: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Terrain sx={{ color: '#5D4037' }} /></Box>
                <Box>
                  <Typography sx={{ fontSize: '12px', color: '#888', fontWeight: 700, textTransform: 'uppercase' }}>Soil Type</Typography>
                  <Typography sx={{ fontSize: '15px', color: '#222', fontWeight: 700 }}>{profile.soil_type}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '12px', backgroundColor: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SquareFoot sx={{ color: '#E64A19' }} /></Box>
                <Box>
                  <Typography sx={{ fontSize: '12px', color: '#888', fontWeight: 700, textTransform: 'uppercase' }}>Land Size</Typography>
                  <Typography sx={{ fontSize: '15px', color: '#222', fontWeight: 700 }}>{profile.land_size}</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* RIGHT / BELOW -> Crop History & Tracking */}
        <Grid size={{ xs: 12, md: 8, lg: 9 }}>
          
          <Grid container spacing={3} sx={{ mb: 4, alignItems: 'stretch' }}>
            {/* Calendar Preview - NOW DYNAMIC */}
            <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                 <FarmCalendar profile={profile} />
              </Box>
            </Grid>

            {/* Analytics Snapshot */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper sx={{ p: 4, borderRadius: '24px', backgroundColor: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', height: '100%', border: '1px solid #F0F0F0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <TrendingUp sx={{ color: '#D84315' }} />
                  <Typography sx={{ fontSize: '18px', fontWeight: 800, color: '#333' }}>Analytics Snapshot</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Box sx={{ backgroundColor: '#FAFAFA', p: 2, borderRadius: '16px', border: '1px solid #EEE' }}>
                      <Typography sx={{ fontSize: '12px', color: '#888', fontWeight: 700, mb: 0.5 }}>AVG YIELD</Typography>
                      <Typography sx={{ fontSize: '20px', color: '#111', fontWeight: 800 }}>2.5 tons</Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Box sx={{ backgroundColor: '#FAFAFA', p: 2, borderRadius: '16px', border: '1px solid #EEE' }}>
                      <Typography sx={{ fontSize: '12px', color: '#888', fontWeight: 700, mb: 0.5 }}>PROFIT</Typography>
                      <Typography sx={{ fontSize: '20px', color: '#2E7D32', fontWeight: 800 }}>₹45,000</Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF59D', p: 2, borderRadius: '16px', border: '1px solid #FFF176' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MonetizationOn sx={{ color: '#F57F17' }} />
                        <Typography sx={{ fontSize: '13px', color: '#F57F17', fontWeight: 700 }}>BEST CROP</Typography>
                      </Box>
                      <Typography sx={{ fontSize: '16px', color: '#444', fontWeight: 800 }}>Paddy</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>

          {/* Crop History Timeline */}
          <Paper sx={{ p: 4, borderRadius: '24px', backgroundColor: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: '1px solid #F0F0F0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
              <Spa sx={{ color: '#2E7D32' }} />
              <Typography sx={{ fontSize: '20px', fontWeight: 800, color: '#333' }}>Crop History</Typography>
            </Box>
            
            {(profile.crop_history && profile.crop_history.length > 0) ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
                <Box sx={{ position: 'absolute', top: '24px', bottom: '24px', left: '23px', width: '2px', backgroundColor: '#EEEEEE' }} />
                
                {profile.crop_history.map((crop, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 3, position: 'relative', mb: index !== profile.crop_history.length - 1 ? 3 : 0 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, border: '4px solid #fff' }}>
                      <Flag sx={{ color: '#2E7D32', fontSize: '20px' }} />
                    </Box>
                    <Box sx={{ pt: 1, pb: 2, flex: 1 }}>
                      <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#222' }}>{crop.name}</Typography>
                      <Typography sx={{ fontSize: '14px', color: '#888', fontWeight: 600 }}>{crop.season} {crop.year}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center', backgroundColor: '#FAFAFA', borderRadius: '16px', border: '2px dashed #EEE' }}>
                <Spa sx={{ fontSize: '40px', color: '#BDBDBD', mb: 1 }} />
                <Typography sx={{ color: '#555', fontWeight: 700, fontSize: '16px' }}>No crop history recorded yet.</Typography>
                <Typography sx={{ color: '#888', fontSize: '14px', mt: 1, maxWidth: '300px', mx: 'auto' }}>
                  Once you complete a farming season and record your yield, your crop history will appear here.
                </Typography>
              </Box>
            )}

          </Paper>

        </Grid>
      </Grid>

      {/* Edit Profile Modal */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} PaperProps={{ sx: { borderRadius: '16px', p: 1, minWidth: { xs: '90%', sm: '400px' } } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#1B5E20' }}>Edit Farm Details</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          <TextField 
            label="Full Name" 
            fullWidth 
            value={editData.full_name} 
            onChange={(e) => setEditData({...editData, full_name: e.target.value})} 
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Autocomplete
              options={indianStates}
              value={editData.state || null}
              onChange={(e, newVal) => setEditData({...editData, state: newVal || '', district: ''})}
              sx={{ flex: 1 }}
              renderInput={(params) => <TextField {...params} label="State" variant="outlined" />}
            />
            <Autocomplete
              options={availableDistricts}
              value={editData.district || null}
              disabled={!editData.state}
              onChange={(e, newVal) => setEditData({...editData, district: newVal || ''})}
              sx={{ flex: 1 }}
              renderInput={(params) => <TextField {...params} label="District" variant="outlined" />}
            />
          </Box>
          <TextField 
            select 
            label="Soil Type" 
            fullWidth 
            value={editData.soil_type} 
            onChange={(e) => setEditData({...editData, soil_type: e.target.value})}
          >
            <MenuItem value="Alluvial Soil">Alluvial Soil</MenuItem>
            <MenuItem value="Black Soil">Black Soil</MenuItem>
            <MenuItem value="Red Soil">Red Soil</MenuItem>
            <MenuItem value="Laterite Soil">Laterite Soil</MenuItem>
            <MenuItem value="Sandy Soil">Sandy Soil</MenuItem>
            <MenuItem value="Clay Soil">Clay Soil</MenuItem>
            <MenuItem value="Loamy Soil">Loamy Soil</MenuItem>
          </TextField>
          <TextField 
            label="Land Size (Acres)" 
            type="number" 
            fullWidth 
            value={editData.land_size} 
            onChange={(e) => setEditData({...editData, land_size: e.target.value})} 
          />
          <TextField 
            select 
            label="Irrigation Level" 
            fullWidth 
            value={editData.irrigation} 
            onChange={(e) => setEditData({...editData, irrigation: e.target.value})}
          >
            <MenuItem value="Good Water Available">Good Water Available</MenuItem>
            <MenuItem value="Limited Water">Limited Water</MenuItem>
            <MenuItem value="No Irrigation">No Irrigation</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ color: '#666', fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleSaveProfile} disabled={updating} variant="contained" sx={{ backgroundColor: '#2E7D32', color: '#fff' }}>
            {updating ? 'Saving...' : 'Save Profile'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default DashboardPage;
