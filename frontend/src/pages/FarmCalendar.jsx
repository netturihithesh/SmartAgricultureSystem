import React, { useState } from 'react';
import { Box, Typography, Grid, Paper, Chip, IconButton } from '@mui/material';
import { WaterDrop, LocalFlorist, WarningAmber, ChevronLeft, ChevronRight, FiberManualRecord, Agriculture, AccountCircle } from '@mui/icons-material';

const FarmCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Get the number of days in the month and the starting day of the week (Monday = 0)
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    let day = new Date(year, month, 1).getDay() - 1;
    return day === -1 ? 6 : day; // Adjusted so Monday is 0 and Sunday is 6
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  
  const blanks = Array.from({ length: firstDay });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  // Mock Data relative to current month for demonstration
  // In a real application, these would map from backend timestamps.
  const signupDate = 5; 
  const activeCropStart = 14; 
  const previousCropHarvest = 8;
  const today = new Date().getDate();

  return (
    <Box className="dashboard-container" sx={{ maxWidth: '1100px', margin: '0 auto', padding: { xs: '16px', md: '32px 24px' }, pt: { xs: '90px', md: '110px' }, minHeight: '80vh' }}>
      
      {/* Header */}
      <Box sx={{ mb: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#111', fontSize: '28px', letterSpacing: '-0.5px' }}>
            Farm Activity Calendar 📅
          </Typography>
          <Typography sx={{ color: '#555', fontSize: '15px', mt: 1 }}>
            Track your farm's history, active crops, and upcoming tasks in real-time.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip icon={<AccountCircle />} label="Signup Day" size="small" sx={{ backgroundColor: '#f3e8ff', color: '#7e22ce', fontWeight: 600, '& .MuiChip-icon': { color: '#7e22ce' } }} />
          <Chip icon={<Agriculture />} label="Crop Started" size="small" sx={{ backgroundColor: '#e8f5e9', color: '#2e7d32', fontWeight: 600, '& .MuiChip-icon': { color: '#2e7d32' } }} />
          <Chip icon={<FiberManualRecord sx={{ fontSize: 12 }} />} label="Previous Crop" size="small" sx={{ backgroundColor: '#fff3e0', color: '#e65100', fontWeight: 600, '& .MuiChip-icon': { color: '#e65100' } }} />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Calendar View (Left) */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: { xs: '16px', sm: '24px' }, borderRadius: '24px', border: '1px solid #eaeaea', boxShadow: '0 8px 24px rgba(0,0,0,0.03)', minHeight: '600px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b' }}>{monthName} {currentYear}</Typography>
              <Box sx={{ display: 'flex', gap: 1, bgcolor: '#f8fafc', borderRadius: '12px', p: 0.5 }}>
                <IconButton onClick={prevMonth} size="small" sx={{ color: '#64748b', '&:hover': { bgcolor: '#e2e8f0', color: '#0f172a' } }}><ChevronLeft /></IconButton>
                <IconButton onClick={nextMonth} size="small" sx={{ color: '#64748b', '&:hover': { bgcolor: '#e2e8f0', color: '#0f172a' } }}><ChevronRight /></IconButton>
              </Box>
            </Box>
            
            {/* Calendar Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: { xs: '6px', sm: '12px' }, textAlign: 'center' }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <Typography key={day} sx={{ fontWeight: 800, color: '#94a3b8', fontSize: '13px', mb: 1, textTransform: 'uppercase' }}>{day}</Typography>
              ))}
              
              {/* Empty Blanks for First Week offset */}
              {blanks.map((_, i) => (
                <Box key={`blank-${i}`} sx={{ height: { xs: '60px', sm: '90px' }, borderRadius: '12px', bgcolor: '#fafafa', border: '1px dashed #e2e8f0' }} />
              ))}

              {/* Actual Days */}
              {days.map((day) => {
                const isSignup = currentMonth === new Date().getMonth() && day === signupDate;
                const isCropStart = currentMonth === new Date().getMonth() && day === activeCropStart;
                const isPrevCrop = currentMonth === new Date().getMonth() && day === previousCropHarvest;
                const isToday = currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear() && day === today;

                let bgContent = 'transparent';
                let borderColor = '#f1f5f9';
                if (isSignup) { bgContent = '#f3e8ff'; borderColor = '#d8b4fe'; }
                if (isCropStart) { bgContent = '#ecfdf5'; borderColor = '#6ee7b7'; }
                if (isPrevCrop) { bgContent = '#fff7ed'; borderColor = '#fdba74'; }
                if (isToday) borderColor = '#3b82f6';

                return (
                  <Box key={day} sx={{ 
                    height: { xs: '60px', sm: '90px' }, borderRadius: '12px', border: `2px solid ${borderColor}`, p: { xs: 0.5, sm: 1 }, 
                    backgroundColor: bgContent, display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    boxShadow: isToday ? '0 4px 12px rgba(59, 130, 246, 0.15)' : 'none',
                    position: 'relative', overflow: 'hidden'
                  }}>
                    <Typography sx={{ 
                      fontWeight: 800, 
                      color: isToday ? '#fff' : (isSignup || isCropStart || isPrevCrop ? '#111' : '#64748b'), 
                      bgcolor: isToday ? '#3b82f6' : 'transparent',
                      width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px'
                    }}>
                      {day}
                    </Typography>
                    
                    {/* Event Labels */}
                    <Box sx={{ mt: 'auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {isSignup && <Typography sx={{ fontSize: '9px', color: '#7e22ce', fontWeight: 800, bgcolor: '#e9d5ff', px: 0.5, py: 0.2, borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Signed Up</Typography>}
                      {isCropStart && <Typography sx={{ fontSize: '9px', color: '#047857', fontWeight: 800, bgcolor: '#d1fae5', px: 0.5, py: 0.2, borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Crop Started</Typography>}
                      {isPrevCrop && <Typography sx={{ fontSize: '9px', color: '#c2410c', fontWeight: 800, bgcolor: '#ffedd5', px: 0.5, py: 0.2, borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Harvested (Wheat)</Typography>}
                    </Box>
                  </Box>
                )
              })}
            </Box>
          </Paper>
        </Grid>

        {/* Sidebar Data Elements (Right) */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <Paper sx={{ p: '24px', borderRadius: '24px', border: '1px solid #eaeaea', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3 }}>Today's Live Tasks</Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box sx={{ p: 1, borderRadius: '12px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex' }}><WaterDrop /></Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>Irrigation (Field 2)</Typography>
                  <Typography sx={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Requires 2 hours watering.</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ p: 1, borderRadius: '12px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex' }}><LocalFlorist /></Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>Apply NPK Fertilizer</Typography>
                  <Typography sx={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>50kg expected coverage today.</Typography>
                </Box>
              </Box>
            </Paper>

            <Paper sx={{ p: '24px', borderRadius: '24px', border: '1px solid #fee2e2', backgroundColor: '#fef2f2', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningAmber fontSize="small" /> Overdue Tasks
              </Typography>
              <Box sx={{ bgcolor: '#fff', p: 2, borderRadius: '16px', border: '1px solid #fecaca' }}>
                <Typography sx={{ fontWeight: 800, fontSize: '14px', color: '#991b1b' }}>Pesticide Spray</Typography>
                <Typography sx={{ fontSize: '13px', color: '#dc2626', fontWeight: 600 }}>Overdue by 2 days from schedule</Typography>
              </Box>
            </Paper>

          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FarmCalendar;
