import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, TextField, MenuItem, Button,
  Autocomplete, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Spa, Add } from '@mui/icons-material';
import cropProcessData from '../data/crop_process.json';
import { supabase } from '../supabase';

// ─── Static Options ────────────────────────────────────────────────────────────
const cropOptions = cropProcessData.map(c => c.crop_name).sort();

// Quick lookup: crop name → duration
const cropDurationMap = cropProcessData.reduce((acc, c) => {
  acc[c.crop_name] = c.total_duration_days;
  return acc;
}, {});


const waterOptions = [
  { label: 'High (Canal / Good Water)', value: 'Good Water Available' },
  { label: 'Medium (Borewell / Limited)', value: 'Limited Water' },
  { label: 'Low (Rainfed / No Irrigation)', value: 'No Irrigation' },
];

const durationOptions = [
  { label: 'Short (< 4 months)', value: 'short_term' },
  { label: 'Medium (4–6 months)', value: 'medium_term' },
  { label: 'Long (> 6 months)', value: 'long_term' },
  { label: 'Perennial (Years)', value: 'perennial' },
];

const parseLandSize = (raw) => (raw ? raw.replace(/[^0-9.]/g, '').trim() : '');

// ─── Component ─────────────────────────────────────────────────────────────────
const AddCropPage = () => {
  const navigate = useNavigate();
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [formData, setFormData] = useState({
    cropName: null,
    landSize: '',
    waterSource: '',
    duration: '',
    sowingDate: '',
    notes: '',
  });

  // ── Load profile for land size and water source ─────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoadingProfile(false); return; }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('land_size, irrigation')
          .eq('id', user.id)
          .single();

        if (!error && profile) {
          setFormData(prev => ({
            ...prev,
            landSize: parseLandSize(profile.land_size),
            waterSource: profile.irrigation || '',
          }));
        }
      } catch (err) {
        console.warn('Profile load failed:', err.message);
      } finally {
        setLoadingProfile(false);
      }
    };
    load();
  }, []);

  // ── When crop name changes, auto-fill duration ─────────────────────────────
  const handleCropChange = (_, newVal) => {
    const days = newVal ? (cropDurationMap[newVal] || 0) : 0;
    let durationType = 'medium_term';
    if (days < 90) durationType = 'short_term';
    else if (days > 180) durationType = 'long_term';
    
    setFormData(prev => ({ ...prev, cropName: newVal, duration: durationType }));
  };


  const set = (key) => (e) => setFormData(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.cropName && formData.sowingDate) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const crops = JSON.parse(localStorage.getItem(`user_crops_${user.id}`) || '[]');
        if (crops.length >= 2) {
          alert('You can only manage a maximum of two crops simultaneously. Please delete a crop first.');
          return;
        }
        crops.push({
          id: Date.now(),
          cropName: formData.cropName,
          startDate: new Date(formData.sowingDate).toISOString(),
        });
        localStorage.setItem(`user_crops_${user.id}`, JSON.stringify(crops));
        localStorage.setItem(`active_crop_index_${user.id}`, crops.length - 1);
        navigate('/');
      }
    }
  };

  const inputSx = { borderRadius: '14px', backgroundColor: '#fafafa' };

  if (loadingProfile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress sx={{ color: '#2e7d32' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '650px', margin: '0 auto', padding: '24px', minHeight: '80vh', pt: { xs: '90px', md: '110px' } }}>

      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: '32px' }}>
        <Typography variant="h4" sx={{
          fontWeight: 800, color: '#111', fontSize: '32px',
          letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5
        }}>
          Add Crop <Spa sx={{ color: '#2e7d32', fontSize: '32px' }} />
        </Typography>
        <Typography sx={{ color: '#555', fontSize: '15px', mt: 1, fontWeight: 500 }}>
          Quickly add your crop plan
        </Typography>
      </Box>

      {/* Form Card */}
      <Paper sx={{
        background: '#ffffff', border: '1px solid #e5e7eb',
        borderRadius: '20px', padding: { xs: '24px', sm: '32px' },
        boxShadow: '0 6px 18px rgba(0,0,0,0.04)'
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

          {/* Crop Name */}
          <Box>
            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px', mb: '8px' }}>
              Crop Name
            </Typography>
            <Autocomplete
              options={cropOptions}
              value={formData.cropName}
              onChange={handleCropChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  placeholder="Select or type crop name"
                  InputProps={{ ...params.InputProps, sx: inputSx }}
                />
              )}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
            />
          </Box>

          {/* Land Size */}
          <Box>
            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px', mb: '8px' }}>
              Land Size (Acres)
            </Typography>
            <TextField
              type="number"
              required
              fullWidth
              placeholder="e.g., 5.5"
              value={formData.landSize}
              onChange={set('landSize')}
              error={formData.landSize !== '' && Number(formData.landSize) <= 0}
              helperText={formData.landSize !== '' && Number(formData.landSize) <= 0 ? 'Land size must be greater than 0' : ''}
              InputProps={{ sx: inputSx, inputProps: { min: 0.01, step: 'any' } }}
            />
          </Box>

          {/* Water Availability */}
          <Box>
            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px', mb: '8px' }}>
              Water Availability
            </Typography>
            <TextField
              select
              required
              fullWidth
              value={formData.waterSource}
              onChange={set('waterSource')}
              InputProps={{ sx: inputSx }}
            >
              {waterOptions.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Duration — auto-filled from crop data */}
          <Box>
            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px', mb: '8px' }}>
              Crop Duration
            </Typography>
            <TextField
              select
              required
              fullWidth
              value={formData.duration}
              onChange={set('duration')}
              InputProps={{ sx: inputSx }}
            >
              <MenuItem value="" disabled>
                {formData.cropName ? 'Select duration' : 'Select a crop first'}
              </MenuItem>
              {durationOptions.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Sowing Date */}
          <Box>
            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px', mb: '8px' }}>
              Sowing Date
            </Typography>
            <TextField
              type="date"
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.sowingDate}
              onChange={set('sowingDate')}
              inputProps={{
                min: "2025-01-01",
                max: "2027-12-31"
              }}
              error={formData.sowingDate !== '' && (new Date(formData.sowingDate).getFullYear() < 2025 || new Date(formData.sowingDate).getFullYear() > 2027)}
              helperText={formData.sowingDate !== '' && (new Date(formData.sowingDate).getFullYear() < 2025 || new Date(formData.sowingDate).getFullYear() > 2027) ? 'Date must be between 2025 and 2027' : ''}
              InputProps={{ sx: inputSx }}
            />
          </Box>

          {/* Notes */}
          <Box>
            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px', mb: '8px' }}>
              Notes <Box component="span" sx={{ fontWeight: 400, fontSize: '12px', color: '#aaa' }}>(Optional)</Box>
            </Typography>
            <TextField
              multiline
              rows={2}
              fullWidth
              placeholder="e.g., Expecting early monsoon"
              value={formData.notes}
              onChange={set('notes')}
              InputProps={{ sx: inputSx }}
            />
          </Box>

          {/* Submit */}
          <Box sx={{ mt: '12px' }}>
            <Button
              type="submit"
              variant="contained"
              sx={{
                width: '100%', height: '56px', borderRadius: '16px',
                background: '#2e7d32', color: 'white',
                fontSize: '18px', fontWeight: 700, textTransform: 'none',
                boxShadow: '0 8px 24px rgba(46,125,50,0.2)',
                '&:hover': { background: '#1b5e20', transform: 'translateY(-2px)' },
                transition: 'all 0.2s ease',
                display: 'flex', gap: 1
              }}
            >
              <Add /> Add Crop to Dashboard
            </Button>
            <Typography sx={{ textAlign: 'center', color: '#888', fontSize: '13px', mt: '16px', fontWeight: 500 }}>
              This crop will be added to your calendar and analytics.
            </Typography>
          </Box>

        </form>
      </Paper>
    </Box>
  );
};

export default AddCropPage;
