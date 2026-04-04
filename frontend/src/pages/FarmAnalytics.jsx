import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { AttachMoney, Grass, AccountBalance, TrendingUp, Timeline } from '@mui/icons-material';


const FarmAnalytics = () => {
  return (
    <Box className="dashboard-container" sx={{ maxWidth: '1100px', margin: '0 auto', padding: { xs: '16px', md: '32px 24px' }, pt: { xs: '90px', md: '110px' }, minHeight: '80vh' }}>
      
      {/* Header */}
      <Box sx={{ mb: '32px' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#111', fontSize: '28px', letterSpacing: '-0.5px' }}>
          Farm Performance Pro 📈
        </Typography>
        <Typography sx={{ color: '#555', fontSize: '15px', mt: 1 }}>
          High-level economics, yield tracking, and profitability trends.
        </Typography>
      </Box>

      {/* Main KPI Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: '20px', mb: '32px' }}>
        <Paper sx={{ p: '24px', borderRadius: '24px', border: '1px solid #eaeaea', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ p: 1, borderRadius: '8px', backgroundColor: '#e8f5e9', color: '#2e7d32', display: 'flex' }}><Grass /></Box>
            <Typography sx={{ fontWeight: 700, color: '#666', fontSize: '14px' }}>Active Crop</Typography>
          </Box>
          <Typography sx={{ fontSize: '24px', fontWeight: 800 }}>Paddy Rice</Typography>
        </Paper>
        
        <Paper sx={{ p: '24px', borderRadius: '24px', border: '1px solid #eaeaea', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ p: 1, borderRadius: '8px', backgroundColor: '#e3f2fd', color: '#1565c0', display: 'flex' }}><Timeline /></Box>
            <Typography sx={{ fontWeight: 700, color: '#666', fontSize: '14px' }}>Expected Yield</Typography>
          </Box>
          <Typography sx={{ fontSize: '24px', fontWeight: 800 }}>4,250 kg</Typography>
        </Paper>

        <Paper sx={{ p: '24px', borderRadius: '24px', border: '1px solid #eaeaea', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ p: 1, borderRadius: '8px', backgroundColor: '#fff3e0', color: '#e65100', display: 'flex' }}><AttachMoney /></Box>
            <Typography sx={{ fontWeight: 700, color: '#666', fontSize: '14px' }}>Market Rate</Typography>
          </Box>
          <Typography sx={{ fontSize: '24px', fontWeight: 800 }}>₹2,100 /qtl</Typography>
        </Paper>

        <Paper sx={{ p: '24px', borderRadius: '24px', border: '1px solid #eaeaea', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ p: 1, borderRadius: '8px', backgroundColor: '#f3e5f5', color: '#8e24aa', display: 'flex' }}><AccountBalance /></Box>
            <Typography sx={{ fontWeight: 700, color: '#666', fontSize: '14px' }}>Est. Revenue</Typography>
          </Box>
          <Typography sx={{ fontSize: '24px', fontWeight: 800, color: '#2e7d32' }}>₹89,250</Typography>
        </Paper>
      </Box>

      {/* Data Visualization Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: '32px', borderRadius: '24px', border: '1px solid #eaeaea', height: '100%', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            <Typography sx={{ fontWeight: 800, fontSize: '18px', mb: 4 }}>Yield vs Profitability Trend</Typography>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa', borderRadius: '16px', border: '1px dashed #ccc' }}>
              <Typography sx={{ color: '#888', fontWeight: 600 }}>[ Line Chart Canvas Placeholder ]</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: '32px', borderRadius: '24px', border: '1px solid #eaeaea', height: '100%', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            <Typography sx={{ fontWeight: 800, fontSize: '18px', mb: 4 }}>Expense Breakdown</Typography>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa', borderRadius: '16px', border: '1px dashed #ccc', mb: 3 }}>
              <Typography sx={{ color: '#888', fontWeight: 600 }}>[ Pie Chart ]</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography sx={{ fontSize: '14px', color: '#666' }}>Fertilizer</Typography><Typography sx={{ fontWeight: 700 }}>45%</Typography></Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography sx={{ fontSize: '14px', color: '#666' }}>Labor</Typography><Typography sx={{ fontWeight: 700 }}>30%</Typography></Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography sx={{ fontSize: '14px', color: '#666' }}>Seeds</Typography><Typography sx={{ fontWeight: 700 }}>15%</Typography></Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
    </Box>
  );
};

export default FarmAnalytics;
