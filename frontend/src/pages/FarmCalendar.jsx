import React from 'react';
import { Box, Typography, Grid, Paper, Chip } from '@mui/material';
import { WaterDrop, LocalFlorist, Timeline, WarningAmber } from '@mui/icons-material';

const FarmCalendar = () => {
  return (
    <Box className="dashboard-container" sx={{ maxWidth: '1100px', margin: '0 auto', padding: { xs: '16px', md: '32px 24px' }, pt: { xs: '90px', md: '110px' }, minHeight: '80vh' }}>
      
      {/* Header */}
      <Box sx={{ mb: '32px' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#111', fontSize: '28px', letterSpacing: '-0.5px' }}>
          Farm Activity Calendar 📅
        </Typography>
        <Typography sx={{ color: '#555', fontSize: '15px', mt: 1 }}>
          Plan your sowing, irrigation, and harvesting timeline.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Main Calendar View (Left) */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: '24px', borderRadius: '24px', border: '1px solid #eaeaea', boxShadow: '0 8px 24px rgba(0,0,0,0.03)', minHeight: '600px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>October 2026</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label="Crop Tasks" size="small" sx={{ backgroundColor: '#e8f5e9', color: '#2e7d32', fontWeight: 600 }} />
                <Chip label="Irrigation" size="small" sx={{ backgroundColor: '#e3f2fd', color: '#1565c0', fontWeight: 600 }} />
                <Chip label="Fertilizer" size="small" sx={{ backgroundColor: '#fff3e0', color: '#e65100', fontWeight: 600 }} />
              </Box>
            </Box>
            
            {/* Minimalist Grid Placeholder */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px', textAlign: 'center' }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <Typography key={day} sx={{ fontWeight: 700, color: '#888', fontSize: '14px', mb: 2 }}>{day}</Typography>
              ))}
              {/* Dummy Days */}
              {Array.from({ length: 31 }).map((_, i) => (
                <Box key={i} sx={{ 
                  height: '80px', borderRadius: '12px', border: '1px solid #f0f0f0', p: 1, 
                  backgroundColor: i === 14 ? '#e8f5e9' : i === 22 ? '#fff3e0' : 'transparent',
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start'
                }}>
                  <Typography sx={{ fontWeight: 600, color: i === 14 || i === 22 ? '#111' : '#555' }}>{i + 1}</Typography>
                  {i === 14 && <Typography sx={{ fontSize: '10px', color: '#2e7d32', fontWeight: 700, mt: 'auto' }}>Sowing Task</Typography>}
                  {i === 22 && <Typography sx={{ fontSize: '10px', color: '#e65100', fontWeight: 700, mt: 'auto' }}>Fertilizer</Typography>}
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Sidebar Tasks (Right) */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <Paper sx={{ p: '24px', borderRadius: '24px', border: '1px solid #eaeaea', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3 }}>Today's Tasks</Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box sx={{ p: 1, borderRadius: '8px', backgroundColor: '#e3f2fd', color: '#1565c0', display: 'flex' }}><WaterDrop /></Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '14px' }}>Irrigation (Field 2)</Typography>
                  <Typography sx={{ fontSize: '13px', color: '#666' }}>Requires 2 hours watering.</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ p: 1, borderRadius: '8px', backgroundColor: '#fff3e0', color: '#e65100', display: 'flex' }}><LocalFlorist /></Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '14px' }}>Apply NPK Fertilizer</Typography>
                  <Typography sx={{ fontSize: '13px', color: '#666' }}>50kg expected coverage.</Typography>
                </Box>
              </Box>
            </Paper>

            <Paper sx={{ p: '24px', borderRadius: '24px', border: '1px solid #ffebee', backgroundColor: '#fffafb', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3, color: '#d32f2f', display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningAmber fontSize="small" /> Missed Tasks
              </Typography>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '14px', color: '#444' }}>Pesticide Spray</Typography>
                <Typography sx={{ fontSize: '13px', color: '#d32f2f' }}>Overdue by 2 days</Typography>
              </Box>
            </Paper>

          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FarmCalendar;
