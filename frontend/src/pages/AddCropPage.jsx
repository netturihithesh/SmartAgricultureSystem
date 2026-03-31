import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, MenuItem, Button, Autocomplete } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Spa, Add } from '@mui/icons-material';
import cropData from '../data/crop_data.json';

// Dynamic Database Mapping
const cropOptions = [...new Set(cropData.map(c => c.name))].sort();
const waterOptions = [
  { label: 'High (Canal)', value: 'more_water' },
  { label: 'Med (Borewell)', value: 'moderate_water' },
  { label: 'Low (Rainfed)', value: 'less_water' }
];
const durationOptions = [
  { label: 'Short (< 4 months)', value: 'short_term' },
  { label: 'Medium (4-6 months)', value: 'medium_term' },
  { label: 'Long (> 6 months)', value: 'long_term' },
  { label: 'Perennial (Years)', value: 'perennial' }
];

const AddCropPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cropName: null,
    landSize: '',
    waterSource: '',
    duration: '',
    sowingDate: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API Database Sync before returning to unified Dashboard Core
    setTimeout(() => {
      navigate('/dashboard');
    }, 400);
  };

  return (
    <Box className="add-crop-container" sx={{ maxWidth: '650px', margin: '0 auto', padding: '24px', minHeight: '80vh', pt: { xs: '90px', md: '110px' } }}>
      
      {/* Page Hero Header */}
      <Box sx={{ textAlign: 'center', mb: '32px' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#111', fontSize: '32px', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
          Add Crop <Spa sx={{ color: '#2e7d32', fontSize: '32px' }} />
        </Typography>
        <Typography sx={{ color: '#555', fontSize: '15px', mt: 1, fontWeight: 500 }}>
          Quickly add your crop plan
        </Typography>
      </Box>

      {/* Main Centered Minimal Form Card */}
      <Paper className="add-crop-card" sx={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '20px', padding: { xs: '24px', sm: '32px' }, boxShadow: '0 6px 18px rgba(0,0,0,0.04)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          <Autocomplete
            options={cropOptions}
            value={formData.cropName}
            onChange={(e, newVal) => setFormData({...formData, cropName: newVal})}
            renderInput={(params) => (
              <TextField {...params} label="Crop Name" required variant="outlined" placeholder="Select Crop" InputProps={{ ...params.InputProps, sx: { borderRadius: '14px', backgroundColor: '#fafafa' } }}/>
            )}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
          />

          <TextField 
            label="Land Size (Acres)" 
            type="number" 
            required 
            fullWidth 
            placeholder="e.g., 5.5"
            value={formData.landSize} 
            onChange={(e) => setFormData({...formData, landSize: e.target.value})} 
            InputProps={{ sx: { borderRadius: '14px', backgroundColor: '#fafafa' }, inputProps: { min: 0, step: 'any' } }}
          />

          <TextField 
            select 
            label="Water Availability" 
            required 
            fullWidth 
            value={formData.waterSource} 
            onChange={(e) => setFormData({...formData, waterSource: e.target.value})}
            InputProps={{ sx: { borderRadius: '14px', backgroundColor: '#fafafa' } }}
          >
            {waterOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
          </TextField>

          <TextField 
            select 
            label="Duration" 
            required 
            fullWidth 
            value={formData.duration} 
            onChange={(e) => setFormData({...formData, duration: e.target.value})}
            InputProps={{ sx: { borderRadius: '14px', backgroundColor: '#fafafa' } }}
          >
            {durationOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
          </TextField>

          <TextField 
            label="Sowing Date" 
            type="date" 
            required 
            fullWidth 
            InputLabelProps={{ shrink: true }}
            value={formData.sowingDate} 
            onChange={(e) => setFormData({...formData, sowingDate: e.target.value})} 
            InputProps={{ sx: { borderRadius: '14px', backgroundColor: '#fafafa' } }}
          />

          <TextField 
            label="Notes (Optional)" 
            multiline
            rows={2}
            fullWidth 
            placeholder="Example: Expecting early monsoon"
            value={formData.notes} 
            onChange={(e) => setFormData({...formData, notes: e.target.value})} 
            InputProps={{ sx: { borderRadius: '14px', backgroundColor: '#fafafa' } }}
          />

          {/* Submission Module */}
          <Box sx={{ mt: '12px' }}>
            <Button 
              type="submit" 
              variant="contained" 
              className="add-btn"
              sx={{ 
                width: '100%', height: '56px', borderRadius: '16px', background: '#2e7d32', color: 'white', 
                fontSize: '18px', fontWeight: 700, textTransform: 'none', boxShadow: '0 8px 24px rgba(46,125,50,0.2)',
                '&:hover': { background: '#1b5e20', transform: 'translateY(-2px)' }, transition: 'all 0.2s ease',
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
