import React, { useState } from 'react';
import { Box, Typography, IconButton, Paper, Divider, Chip } from '@mui/material';
import { ChevronLeft, ChevronRight, WaterDrop, Agriculture, Flag, Spa, EventNote } from '@mui/icons-material';

const FarmCalendar = ({ profile }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const today = new Date();
  
  // Extract month/year details
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  
  const firstDay = new Date(year, month, 1).getDay(); // Day of week (0-6)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Parse account creation date securely
  const accountCreationDate = profile?.created_at ? new Date(profile.created_at) : new Date();

  // Mocked activities map linking date strings (YYYY-MM-DD) to activity data
  // In a real app, this would come from Supabase DB `activities` table
  const mockActivities = {
    [`${year}-${String(month + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`]: {
      type: 'Irrigation',
      description: 'Run pivot irrigation for 4 hours starting at 6 AM.',
      icon: <WaterDrop sx={{ color: '#0288D1', fontSize: '14px' }} />
    },
    [`${year}-${String(month + 1).padStart(2, '0')}-${String(today.getDate() + 2).padStart(2, '0')}`]: {
      type: 'Fertilizer',
      description: 'Apply top-dressing urea (40kg/acre) before evening.',
      icon: <Spa sx={{ color: '#F57F17', fontSize: '14px' }} />
    },
    [`${year}-${String(month + 1).padStart(2, '0')}-${String(today.getDate() + 5).padStart(2, '0')}`]: {
      type: 'Pesticide',
      description: 'Spray preventative fungicide based on high humidity forecast.',
      icon: <Agriculture sx={{ color: '#5D4037', fontSize: '14px' }} />
    }
  };

  const currentDayActivity = mockActivities[`${year}-${String(month + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`];
  const upcomingActivity = mockActivities[`${year}-${String(month + 1).padStart(2, '0')}-${String(today.getDate() + 2).padStart(2, '0')}`] || 
                           mockActivities[`${year}-${String(month + 1).padStart(2, '0')}-${String(today.getDate() + 5).padStart(2, '0')}`];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Determine if a specific day represents a milestone
  const checkDayStatus = (day) => {
    const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    const isCreationDay = day === accountCreationDate.getDate() && month === accountCreationDate.getMonth() && year === accountCreationDate.getFullYear();
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const activityInfo = mockActivities[dateKey];

    return { isToday, isCreationDay, activityInfo };
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <Paper sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: '24px', backgroundColor: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', height: '100%', border: '1px solid #F0F0F0', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header Container */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <EventNote sx={{ color: '#1976D2', fontSize: '26px' }} />
          <Typography sx={{ fontSize: '20px', fontWeight: 800, color: '#222' }}>{monthNames[month]} {year}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" onClick={handlePrevMonth} sx={{ border: '1px solid #E0E0E0', borderRadius: '10px' }}><ChevronLeft /></IconButton>
          <IconButton size="small" onClick={handleNextMonth} sx={{ border: '1px solid #E0E0E0', borderRadius: '10px' }}><ChevronRight /></IconButton>
        </Box>
      </Box>

      {/* Days of week */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 1, textAlign: 'center' }}>
        {daysOfWeek.map((day, idx) => (
          <Typography key={idx} sx={{ fontSize: '13px', fontWeight: 700, color: '#999' }}>{day}</Typography>
        ))}
      </Box>

      {/* Calendar Grid Date Cells */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, flex: 1, mb: 3 }}>
        {/* Empty slots before month start */}
        {Array.from({ length: firstDay }).map((_, idx) => <Box key={`empty-${idx}`} />)}
        
        {/* Actual Days */}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const day = idx + 1;
          const { isToday, isCreationDay, activityInfo } = checkDayStatus(day);

          return (
            <Box key={day} sx={{ 
              height: '46px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
              borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: isToday ? '#1976D2' : (isCreationDay ? '#E8F5E9' : (activityInfo ? '#FFF8E1' : 'transparent')),
              color: isToday ? '#fff' : (isCreationDay ? '#2E7D32' : (activityInfo ? '#F57F17' : '#333')),
              border: isToday ? 'none' : (isCreationDay ? '1px dashed #A5D6A7' : (activityInfo ? '1px solid #FFE0B2' : 'none')),
              '&:hover': { backgroundColor: isToday ? '#1565C0' : (isCreationDay ? '#C8E6C9' : (activityInfo ? '#FFECB3' : '#F5F5F5')) }
            }}>
              <Typography sx={{ fontSize: '15px', fontWeight: (isToday || isCreationDay || activityInfo) ? 800 : 600 }}>{day}</Typography>
              
              {/* Badges/Indicators for overlaps if Today happens to also be a task day */}
              <Box sx={{ display: 'flex', gap: '2px', position: 'absolute', bottom: '4px' }}>
                {isCreationDay && isToday && <Box sx={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#C8E6C9' }} title="Account Created" />}
                {activityInfo && isToday && <Box sx={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#FFCA28' }} title="Task Scheduled" />}
              </Box>
            </Box>
          );
        })}
      </Box>

      <Divider sx={{ mb: 3, opacity: 0.6 }} />

      {/* Activity Drawer */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        
        {/* Today's Activity */}
        <Box sx={{ display: 'flex', gap: 2, p: 2, borderRadius: '16px', backgroundColor: '#E3F2FD', border: '1px solid #BBDEFB' }}>
          <Box alignSelf="center">{currentDayActivity ? currentDayActivity.icon : <Spa sx={{ color: '#1976D2', fontSize: '20px' }} />}</Box>
          <Box>
            <Typography sx={{ fontWeight: 800, color: '#1565C0', fontSize: '14px', mb: 0.5 }}>TODAY: {currentDayActivity ? currentDayActivity.type : 'Monitoring'}</Typography>
            <Typography sx={{ color: '#1E88E5', fontSize: '13.5px', fontWeight: 500, lineHeight: 1.4 }}>
              {currentDayActivity ? currentDayActivity.description : 'No active tasks scheduled. Ensure soil moisture is adequate.'}
            </Typography>
          </Box>
        </Box>

        {/* Future Activity */}
        <Box sx={{ display: 'flex', gap: 2, p: 2, borderRadius: '16px', backgroundColor: '#FBFBFB', border: '1px solid #EEEEEE' }}>
          <Box alignSelf="center">{upcomingActivity ? upcomingActivity.icon : <Flag sx={{ color: '#757575', fontSize: '20px' }} />}</Box>
          <Box>
            <Typography sx={{ fontWeight: 800, color: '#555', fontSize: '14px', mb: 0.5 }}>UPCOMING: {upcomingActivity ? upcomingActivity.type : 'Harvesting'}</Typography>
            <Typography sx={{ color: '#777', fontSize: '13.5px', fontWeight: 500, lineHeight: 1.4 }}>
              {upcomingActivity ? upcomingActivity.description : 'Your crop is progressing naturally. Wait for the designated harvest period.'}
            </Typography>
          </Box>
        </Box>

      </Box>

    </Paper>
  );
};

export default FarmCalendar;
