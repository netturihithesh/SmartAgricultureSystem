import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Button, Chip, Container, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { Agriculture, Add, Edit, Delete, CheckCircle, Event, LocationOn, Straighten, ArrowForward, Spa } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import cropProcessData from '../data/crop_process.json';

const MyCropsPage = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [cropsList, setCropsList] = useState([]);
  const [activeCropIndex, setActiveCropIndex] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) {
        const crops = JSON.parse(localStorage.getItem(`user_crops_${session.user.id}`) || '[]');
        if (Array.isArray(crops) && crops.length > 0) {
          setCropsList(crops);
        } else {
          // Default initial crop if empty
          const defaultCrops = [
            { cropName: 'Paddy (Basmati)', sowDate: '2026-06-15', landArea: '2.5 Acres', status: 'Active' },
            { cropName: 'Groundnut', sowDate: '2026-05-01', landArea: '1.5 Acres', status: 'Completed' }
          ];
          setCropsList(defaultCrops);
          localStorage.setItem(`user_crops_${session.user.id}`, JSON.stringify(defaultCrops));
        }
        const idx = parseInt(localStorage.getItem(`active_crop_index_${session.user.id}`) || '0');
        setActiveCropIndex(isNaN(idx) ? 0 : idx);
      }
    });
  }, []);

  const handleSelectActiveCrop = (idx) => {
    setActiveCropIndex(idx);
    if (session?.user?.id) {
      localStorage.setItem(`active_crop_index_${session.user.id}`, idx.toString());
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3, lg: 4 }, pb: 10, bgcolor: '#F8FAFC', minHeight: '100vh', width: '100%' }}>
      
      {/* Header */}
      <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, mb: 4, borderRadius: '24px', position: 'relative', overflow: 'hidden', bgcolor: '#fff', border: '1px solid #E2E8F0' }}>
        <Box sx={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '100%', opacity: 0.15, backgroundImage: `url('/assets/bg_abstract_green.png')`, backgroundSize: 'cover', backgroundPosition: 'center', maskImage: 'linear-gradient(to right, transparent 30%, black 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 30%, black 100%)', pointerEvents: 'none' }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1, flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
              <Spa sx={{ fontSize: 36 }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', fontSize: { xs: '26px', md: '32px' } }}>
                My Crops
              </Typography>
              <Typography variant="body1" sx={{ color: '#64748B', mt: 0.5, fontWeight: 500 }}>
                Manage active farm crops, land locations, and harvest cycles.
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add sx={{ fontSize: 20 }} />}
            onClick={() => navigate('/add-crop')}
            sx={{
              bgcolor: '#059669',
              color: '#fff',
              fontWeight: 800,
              borderRadius: '12px',
              textTransform: 'none',
              px: 3,
              py: 1.2,
              boxShadow: '0 4px 12px rgba(5,150,105,0.2)',
              '&:hover': { bgcolor: '#047857' }
            }}
          >
            Add New Crop
          </Button>
        </Box>
      </Paper>

      {/* Crops Cards Grid */}
      <Grid container spacing={3} alignItems="stretch">
        {cropsList.map((crop, idx) => {
          const isActive = idx === activeCropIndex;
          return (
            <Grid item xs={12} md={6} key={idx} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Paper
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: '24px',
                  bgcolor: '#fff',
                  border: isActive ? '1.5px solid #059669' : '1.5px solid #E2E8F0',
                  boxShadow: isActive ? '0 8px 24px rgba(5, 150, 105, 0.08)' : '0 4px 12px rgba(0,0,0,0.02)',
                  position: 'relative',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                    <Box sx={{ width: 84, height: 84, bgcolor: '#F4FBF7', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, border: '1px solid #ECFDF5', flexShrink: 0 }}>
                      {crop.cropName.includes('Paddy') ? '🌾' : '🧅'}
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', mb: 1, wordBreak: 'break-word' }}>
                        {crop.cropName}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Event sx={{ fontSize: 16, color: '#059669' }} />
                        <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 700 }}>
                          Sown on: 15 Jun 2026
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  {isActive && (
                    <Chip
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#059669' }} />
                          <Typography sx={{ fontWeight: 900, fontSize: '11px', letterSpacing: '0.5px' }}>ACTIVE CROP</Typography>
                        </Box>
                      }
                      sx={{ bgcolor: '#ECFDF5', color: '#059669', height: '32px', borderRadius: '8px' }}
                    />
                  )}
                </Box>

                <Box sx={{ height: '1px', width: '100%', bgcolor: '#F1F5F9', mb: 3 }} />

                <Grid container spacing={2} sx={{ mb: 4 }}>
                  <Grid item xs={6}>
                    <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '16px', textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#059669', fontWeight: 800, display: 'block', mb: 1, letterSpacing: '0.5px' }}>LAND AREA</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <Agriculture sx={{ fontSize: 18, color: '#059669' }} />
                        <Typography variant="body1" sx={{ fontWeight: 900, color: '#0F172A' }}>{crop.landArea || '2.5 Acres'}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '16px', textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#059669', fontWeight: 800, display: 'block', mb: 1, letterSpacing: '0.5px' }}>EST. HARVEST</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <Event sx={{ fontSize: 18, color: '#059669' }} />
                        <Typography variant="body1" sx={{ fontWeight: 900, color: '#0F172A' }}>Nov 2026</Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
                  {!isActive && (
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => handleSelectActiveCrop(idx)}
                      startIcon={<CheckCircle sx={{ fontSize: 20 }} />}
                      sx={{ borderColor: '#059669', color: '#059669', fontWeight: 800, borderRadius: '12px', textTransform: 'none', py: 1.2, '&:hover': { bgcolor: '#F0FDF4' } }}
                    >
                      Set Active
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate('/journey')}
                    endIcon={<ArrowForward />}
                    sx={{ bgcolor: '#059669', color: '#fff', fontWeight: 800, borderRadius: '12px', textTransform: 'none', py: 1.2, boxShadow: '0 4px 12px rgba(5,150,105,0.2)', '&:hover': { bgcolor: '#047857' } }}
                  >
                    View Journey
                  </Button>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

    </Box>
  );
};

export default MyCropsPage;
