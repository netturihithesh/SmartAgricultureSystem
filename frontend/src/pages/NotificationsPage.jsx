import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Container, Chip, Button, IconButton } from '@mui/material';
import { Notifications, Air, WaterDrop, MonetizationOn, CheckCircle, DeleteOutline } from '@mui/icons-material';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'High Wind Speed Alert', time: '10 mins ago', desc: 'Wind speed reaches 18-22 km/h in Kamareddy. Postpone chemical spray operations.', type: 'weather', icon: <Air sx={{ color: '#D97706' }} />, bg: '#FEFCE8' },
    { id: 2, title: 'Market Price Rise - Paddy Basmati', time: '2 hours ago', desc: 'Nizamabad APMC mandi rate increased by ₹120 to ₹2,520/quintal.', type: 'market', icon: <MonetizationOn sx={{ color: '#059669' }} />, bg: '#ECFDF5' },
    { id: 3, title: 'Top Dressing Urea Due Today', time: '5 hours ago', desc: 'Day 49 task: Apply 25kg Urea top dressing for Paddy tillering stage.', type: 'task', icon: <CheckCircle sx={{ color: '#2563EB' }} />, bg: '#EFF6FF' },
  ]);

  const clearNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <Container maxWidth="xl" sx={{ pt: 4, pb: 10, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', fontSize: { xs: '26px', md: '32px' } }}>
            Farm Notifications & Alerts
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', fontSize: '14px', mt: 0.5 }}>
            Real-time telemetry alerts, weather warnings, and mandi market updates.
          </Typography>
        </Box>
        {notifications.length > 0 && (
          <Button
            variant="outlined"
            onClick={() => setNotifications([])}
            sx={{ borderColor: '#CBD5E1', color: '#64748B', fontWeight: 800, borderRadius: '12px', textTransform: 'none' }}
          >
            Clear All
          </Button>
        )}
      </Box>

      {/* Notifications List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {notifications.map((n) => (
          <Paper
            key={n.id}
            sx={{
              p: 3,
              borderRadius: '20px',
              bgcolor: n.bg,
              border: '1px solid #E2E8F0',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ p: 1.5, bgcolor: '#fff', borderRadius: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', display: 'flex' }}>
                {n.icon}
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A' }}>
                    {n.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                    • {n.time}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                  {n.desc}
                </Typography>
              </Box>
            </Box>

            <IconButton onClick={() => clearNotification(n.id)} sx={{ color: '#94A3B8' }}>
              <DeleteOutline />
            </IconButton>
          </Paper>
        ))}

        {notifications.length === 0 && (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '24px', bgcolor: '#fff' }}>
            <Typography variant="h6" sx={{ color: '#64748B', fontWeight: 700 }}>
              No unread notifications! All farm advisories cleared.
            </Typography>
          </Paper>
        )}
      </Box>

    </Container>
  );
};

export default NotificationsPage;
