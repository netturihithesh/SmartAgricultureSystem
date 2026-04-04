import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Paper, Button, Grid, Avatar, CircularProgress, Chip, LinearProgress,
  Divider, Checkbox, IconButton, Alert, Stack, Accordion, AccordionSummary, AccordionDetails, Container,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';

import {
  LocationOn, WbSunny, CalendarMonth, TrendingUp,
  Agriculture, CheckCircle, Schedule, WaterDrop,
  InfoOutlined, MonetizationOn,
  AssignmentTurnedIn, LocalFlorist, Air, ExpandMore,
  NotificationsActive, AddBox, Thermostat, Opacity, WindPower, Grain,
  Delete, Restore, DeleteSweep, SwapHoriz
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import cropDataRaw from '../data/crop_process.json';
import AgriBot from '../components/AgriBot';
import { getDailyQuote } from '../services/aiService';

const ActionHome = ({ session }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // NEW MULTI-CROP STATE
  const [userCrops, setUserCrops] = useState([]);
  const [activeCropIndex, setActiveCropIndex] = useState(0);
  const [binModalOpen, setBinModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [dailyQuote, setDailyQuote] = useState('');

  // REAL-TIME CROP DATA STATE
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [cropStartDate, setCropStartDate] = useState(null);
  const [daysPassed, setDaysPassed] = useState(0);

  const [expandedStage, setExpandedStage] = useState(null);
  const [substepStatus, setSubstepStatus] = useState({});
  const [todayTaskCompleted, setTodayTaskCompleted] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      if (session?.user?.id) {
        // 1. Fetch User Profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!profileError && profileData) {
          setProfile(profileData);

          // 2. Fetch User's Active Crops
          let crops = JSON.parse(localStorage.getItem(`user_crops_${session.user.id}`) || '[]');
          
          // Legacy migration
          const legacyName = localStorage.getItem(`active_crop_${session.user.id}`);
          const legacyDate = localStorage.getItem(`crop_start_date_${session.user.id}`);
          if (crops.length === 0 && legacyName && legacyDate) {
             crops = [{ id: Date.now(), cropName: legacyName, startDate: legacyDate }];
             localStorage.setItem(`user_crops_${session.user.id}`, JSON.stringify(crops));
             localStorage.setItem(`active_crop_index_${session.user.id}`, '0');
             localStorage.removeItem(`active_crop_${session.user.id}`);
             localStorage.removeItem(`crop_start_date_${session.user.id}`);
          }

          if (crops.length > 0) {
            let index = parseInt(localStorage.getItem(`active_crop_index_${session.user.id}`) || '0');
            if (index >= crops.length) index = 0;
            
            setUserCrops(crops);
            setActiveCropIndex(index);
            loadCropView(crops[index]);
          }

          // Fetch Daily Quote
          try {
            const todayStr = new Date().toISOString().split('T')[0];
            let savedQuoteObj = JSON.parse(localStorage.getItem('daily_agri_quote_v1') || 'null');
            
            if (savedQuoteObj && savedQuoteObj.date === todayStr) {
              setDailyQuote(savedQuoteObj.quote);
            } else {
              const fetchedQuote = await getDailyQuote();
              setDailyQuote(fetchedQuote);
              localStorage.setItem('daily_agri_quote_v1', JSON.stringify({ date: todayStr, quote: fetchedQuote }));
            }
          } catch (err) {
            setDailyQuote('The ultimate goal of farming is not the growing of crops, but the cultivation and perfection of human beings.');
          }
        }
      }
      setLoading(false);
    };
    initPage();
  }, [session]);

  const loadCropView = (cropObj) => {
    const crop = cropDataRaw.find(c => c.crop_name === cropObj.cropName);
    if (crop) {
      const start = new Date(cropObj.startDate);
      const today = new Date();
      const diffTime = Math.abs(today - start);
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      setSelectedCrop(crop);
      setCropStartDate(start);
      setDaysPassed(diffDays);

      const currentStage = calculateCurrentStage(crop.stages, diffDays);
      setExpandedStage(currentStage?.stage_id);
    }
  };

  const calculateCurrentStage = (stages, days) => {
    let elapsed = 0;
    for (let stage of stages) {
      elapsed += stage.duration_days;
      if (days <= elapsed) return stage;
    }
    return stages[stages.length - 1];
  };

  const getStageStatus = (stageId) => {
    if (!selectedCrop) return 'pending';
    const currentStage = calculateCurrentStage(selectedCrop.stages, daysPassed);
    if (stageId < currentStage.stage_id) return 'completed';
    if (stageId === currentStage.stage_id) return 'current';
    return 'pending';
  };

  // HANDLERS
  const handleSwapCrop = () => {
    if (userCrops.length > 1) {
      const nextIndex = activeCropIndex === 0 ? 1 : 0;
      localStorage.setItem(`active_crop_index_${session.user.id}`, nextIndex.toString());
      setActiveCropIndex(nextIndex);
      loadCropView(userCrops[nextIndex]);
    }
  };

  const requestDelete = () => setDeleteConfirmOpen(true);

  const handleConfirmDelete = () => {
     const current = userCrops[activeCropIndex];
     const bin = JSON.parse(localStorage.getItem(`binned_crops_${session.user.id}`) || '[]');
     bin.push({ ...current, deletedAt: new Date().toISOString() });
     localStorage.setItem(`binned_crops_${session.user.id}`, JSON.stringify(bin));
     
     const updated = userCrops.filter((_, i) => i !== activeCropIndex);
     localStorage.setItem(`user_crops_${session.user.id}`, JSON.stringify(updated));
     
     if (updated.length > 0) {
       localStorage.setItem(`active_crop_index_${session.user.id}`, '0');
       setUserCrops(updated);
       setActiveCropIndex(0);
       loadCropView(updated[0]);
     } else {
       setUserCrops([]);
       setSelectedCrop(null);
     }
     setDeleteConfirmOpen(false);
  };

  const handleRestoreFromBin = (binnedId) => {
    if (userCrops.length >= 2) {
      alert('You cannot restore this crop. You already have the maximum of two active crops.');
      return;
    }
    const bin = JSON.parse(localStorage.getItem(`binned_crops_${session.user.id}`) || '[]');
    const cropToRestore = bin.find(c => c.id === binnedId);
    if (!cropToRestore) return;
    
    const deletedDate = new Date(cropToRestore.deletedAt);
    const daysInBin = (new Date() - deletedDate) / (1000 * 60 * 60 * 24);
    if (daysInBin > 3) {
      alert('This crop has been in the bin for more than 3 days and cannot be restored.');
      const cleanedBin = bin.filter(c => c.id !== binnedId);
      localStorage.setItem(`binned_crops_${session.user.id}`, JSON.stringify(cleanedBin));
      return;
    }

    const newCrops = [...userCrops, { id: cropToRestore.id, cropName: cropToRestore.cropName, startDate: cropToRestore.startDate }];
    setUserCrops(newCrops);
    localStorage.setItem(`user_crops_${session.user.id}`, JSON.stringify(newCrops));
    
    const newBin = bin.filter(c => c.id !== binnedId);
    localStorage.setItem(`binned_crops_${session.user.id}`, JSON.stringify(newBin));
    
    const newIndex = newCrops.length - 1;
    setActiveCropIndex(newIndex);
    localStorage.setItem(`active_crop_index_${session.user.id}`, newIndex.toString());
    loadCropView(newCrops[newIndex]);
    setBinModalOpen(false);
  };

  const currentStage = useMemo(() => {
    if (!selectedCrop) return null;
    return calculateCurrentStage(selectedCrop.stages, daysPassed);
  }, [selectedCrop, daysPassed]);

  const progressPercentage = useMemo(() => {
    if (!selectedCrop) return 0;
    return Math.min(100, Math.round((daysPassed / selectedCrop.total_duration_days) * 100));
  }, [selectedCrop, daysPassed]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress sx={{ color: '#16a34a' }} thickness={5} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', pb: 10, background: '#f8fafc', pt: { xs: 10, md: 12 } }}>
      <Container maxWidth="lg">
        
        {!selectedCrop ? (
          /* ==================================================
             PHASE 2: AFTER LOGIN DASHBOARD
             ================================================== */
          <Box sx={{ py: 4, px: { xs: 2, md: 4 } }}>
            {/* 1. Header Section */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', mb: 1, fontSize: { xs: '28px', md: '36px' }, letterSpacing: '-0.5px' }}>
                Hi, {profile?.full_name || 'Farmer'}! 👋
              </Typography>
              <Stack direction="row" spacing={3} sx={{ color: '#64748b', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn sx={{ fontSize: 20, color: '#16a34a' }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{profile?.location || 'Sangli, Maharashtra'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarMonth sx={{ fontSize: 20, color: '#16a34a' }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>Kharif Season</Typography>
                </Box>
              </Stack>
              
              {dailyQuote && (
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: '20px', background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '1px solid #fde68a', display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Typography sx={{ fontSize: 26, lineHeight: 1 }}>✨</Typography>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#d97706', letterSpacing: 1, textTransform: 'uppercase', mb: 0.5, display: 'block' }}>Daily Inspiration</Typography>
                    <Typography sx={{ color: '#92400e', fontWeight: 600, fontStyle: 'italic', fontSize: '15px', lineHeight: 1.5 }}>"{dailyQuote}"</Typography>
                  </Box>
                </Paper>
              )}
            </Box>

            {/* 2. Primary Actions Row (Side by Side) */}
            <Box sx={{ mb: 6 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b' }}>Primary Actions</Typography>
                <Button variant="outlined" onClick={() => setBinModalOpen(true)} startIcon={<Restore />} sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none' }}>Recycle Bin</Button>
              </Stack>
              <Stack direction="row" spacing={3} sx={{ alignItems: 'stretch' }}>
                <Paper sx={{ 
                  flex: 1,
                  p: 4, borderRadius: '24px', border: '1px solid #e2e8f0', bgcolor: '#fff',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                  '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 20px 40px rgba(0,0,0,0.06)' },
                  display: 'flex', flexDirection: 'column', minHeight: '300px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
                }}>
                  <Avatar sx={{ bgcolor: '#ecfdf5', width: 56, height: 56, mb: 3 }}>
                    <TrendingUp sx={{ color: '#10b981', fontSize: 28 }} />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 900, mb: 1.5, color: '#111827' }}>Crop Analysis</Typography>
                  <Typography sx={{ color: '#64748b', mb: 4, lineHeight: 1.6, flexGrow: 1, fontSize: '15px' }}>
                    Get AI-powered crop suggestions based on your soil type, irrigation, and weather patterns.
                  </Typography>
                  <Button
                    variant="contained" size="large"
                    onClick={() => navigate('/recommendation')}
                    sx={{ bgcolor: '#10b981', py: 1.8, borderRadius: '14px', fontWeight: 800, textTransform: 'none', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.15)', '&:hover': { bgcolor: '#059669' } }}
                  >
                    Analyze Best Crops
                  </Button>
                </Paper>

                <Paper sx={{ 
                  flex: 1,
                  p: 4, borderRadius: '24px', border: '1px solid #e2e8f0', bgcolor: '#fff',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                  '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 20px 40px rgba(0,0,0,0.06)' },
                  display: 'flex', flexDirection: 'column', minHeight: '300px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
                }}>
                  <Avatar sx={{ bgcolor: '#eff6ff', width: 56, height: 56, mb: 3 }}>
                    <AddBox sx={{ color: '#3b82f6', fontSize: 28 }} />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 900, mb: 1.5, color: '#111827' }}>Add Crop Manually</Typography>
                  <Typography sx={{ color: '#64748b', mb: 4, lineHeight: 1.6, flexGrow: 1, fontSize: '15px' }}>
                    Already decided what to cultivate? Directly add your crop and start tracking the farming process.
                  </Typography>
                  <Button
                    variant="outlined" size="large"
                    onClick={() => navigate('/add-crop')}
                    sx={{ color: '#3b82f6', borderColor: '#3b82f6', borderWidth: '2.5px', py: 1.8, borderRadius: '14px', fontWeight: 800, textTransform: 'none', '&:hover': { border: '2.5px solid #2563eb', bgcolor: 'rgba(59, 130, 246, 0.04)' } }}
                  >
                    Add Crop
                  </Button>
                </Paper>
              </Stack>
            </Box>

            {/* 3. Quick Access Section (3 Cards Below) */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 3, color: '#1e293b' }}>Quick Access</Typography>
              <Stack direction="row" spacing={3}>
                {[
                  { title: 'Calendar', icon: <CalendarMonth />, color: '#7c3aed', path: '/dashboard/calendar' },
                  { title: 'Weather', icon: <WbSunny />, color: '#f59e0b', path: '/dashboard/weather' },
                  { title: 'Analytics', icon: <TrendingUp />, color: '#10b981', path: '/dashboard/analytics' }
                ].map((tile, i) => (
                  <Paper 
                    key={i}
                    onClick={() => navigate(tile.path)}
                    sx={{ 
                      flex: 1,
                      p: 3, borderRadius: '20px', border: '1px solid #f1f5f9', bgcolor: '#fff',
                      display: 'flex', alignItems: 'center', gap: 2.5, cursor: 'pointer', 
                      height: '92px', 
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                      '&:hover': { bgcolor: '#f8fafc', transform: 'translateY(-5px)', boxShadow: '0 12px 30px rgba(0,0,0,0.06)', borderColor: tile.color + '40' } 
                    }}
                  >
                    <Box sx={{ p: 1.5, borderRadius: '16px', bgcolor: tile.color + '10', color: tile.color, display: 'flex' }}>{tile.icon}</Box>
                    <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: '17px' }}>{tile.title}</Typography>
                  </Paper>
                ))}
              </Stack>
            </Box>
          </Box>
        ) : (

          /* ==================================================
             PHASE 3: AFTER CROP SELECTION (CROP PROCESS DASHBOARD)
             ================================================== */
          <Box>
            {/* 1. Header Section */}
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', mb: 4, fontSize: { xs: '28px', md: '36px' }, letterSpacing: '-0.5px' }}>
              Hi, {profile?.full_name || 'Farmer'}! 👋
            </Typography>

            {/* DAILY QUOTE BANNER */}
            {dailyQuote && (
              <Paper elevation={0} sx={{ mb: 4, p: 2.5, borderRadius: '20px', background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', display: 'flex', alignItems: 'flex-start', gap: 2, border: '1px solid #fde68a' }}>
                <Typography sx={{ fontSize: 28, lineHeight: 1 }}>🌾</Typography>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#d97706', letterSpacing: 1, textTransform: 'uppercase', mb: 0.5, display: 'block' }}>Daily Word</Typography>
                  <Typography sx={{ color: '#92400e', fontWeight: 600, fontStyle: 'italic', fontSize: '16px', lineHeight: 1.5 }}>"{dailyQuote}"</Typography>
                </Box>
              </Paper>
            )}

            {/* TOP HERO CARD */}
            <Paper elevation={0} sx={{
              p: 5, mb: 6, borderRadius: '32px',
              background: 'linear-gradient(135deg, #14532d 0%, #166534 100%)',
              color: '#fff', boxShadow: '0 25px 50px -12px rgba(22, 101, 52, 0.25)',
              position: 'relative', overflow: 'hidden'
            }}>
              <Box sx={{ position: 'absolute', right: -30, top: -30, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', zIndex: 0 }} />
              
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={7}>
                  <Typography variant="overline" sx={{ fontWeight: 900, letterSpacing: 2, opacity: 0.8 }}>ACTIVE CROP</Typography>
                  <Typography variant="h2" sx={{ fontWeight: 900, mb: 2, fontSize: { xs: '32px', md: '48px' } }}>{selectedCrop.crop_name}</Typography>
                  
                  <Stack direction="row" spacing={4} sx={{ mb: 4 }}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.7, display: 'block' }}>DAY PROGRESS</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>Day {daysPassed} / {selectedCrop.total_duration_days}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.7, display: 'block' }}>CURRENT STAGE</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>{currentStage?.title}</Typography>
                    </Box>
                  </Stack>

                  <Box sx={{ maxWidth: '90%' }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Overall Progress</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 900 }}>{progressPercentage}%</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={progressPercentage} sx={{ height: 12, borderRadius: 6, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#22c55e', borderRadius: 6 } }} />
                  </Box>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Stack spacing={3} alignItems={{ md: 'flex-end' }}>
                    <Box sx={{ textAlign: { md: 'right' } }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.7, display: 'block' }}>EXPECTED HARVEST</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        {new Date(new Date(cropStartDate).getTime() + selectedCrop.total_duration_days * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1.5} justifyContent={{ md: 'flex-end' }} flexWrap="wrap">
                      {userCrops.length === 2 ? (
                        <Button variant="contained" onClick={handleSwapCrop} sx={{ bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: '#fff', fontWeight: 700, px: 2, py: 1, borderRadius: '10px', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }, border: '1px solid rgba(255,255,255,0.2)' }} startIcon={<SwapHoriz />}>Swap Crop</Button>
                      ) : (
                        <Button variant="contained" onClick={() => navigate('/add-crop')} sx={{ bgcolor: '#3b82f6', color: '#fff', fontWeight: 700, px: 2, py: 1, borderRadius: '10px', '&:hover': { bgcolor: '#2563eb' } }} startIcon={<AddBox />}>Add 2nd Crop</Button>
                      )}
                      <Button variant="contained" onClick={() => setBinModalOpen(true)} sx={{ bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: '#fff', fontWeight: 700, px: 2, py: 1, borderRadius: '10px', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }, border: '1px solid rgba(255,255,255,0.2)' }} startIcon={<Restore />}>Bin</Button>
                      <Button variant="contained" onClick={requestDelete} sx={{ bgcolor: '#ef4444', color: '#fff', fontWeight: 700, px: 2, py: 1, borderRadius: '10px', '&:hover': { bgcolor: '#dc2626' } }} startIcon={<Delete />}>Delete</Button>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            {/* QUICK ACCESS (PHASE 3) */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, color: '#1e293b' }}>Tools & Analysis</Typography>
              <Grid container spacing={3}>
                {[
                  { title: 'Farm Calendar', icon: <CalendarMonth />, color: '#7c3aed', path: '/dashboard/calendar', desc: 'Schedule & Tasks' },
                  { title: 'Weather Center', icon: <WbSunny />, color: '#f59e0b', path: '/dashboard/weather', desc: 'Forecast & Alerts' },
                  { title: 'Analytics', icon: <TrendingUp />, color: '#10b981', path: '/dashboard/analytics', desc: 'Insights & ROI' }
                ].map((tile, i) => (
                  <Grid item xs={12} sm={4} key={i}>
                    <Paper 
                      onClick={() => navigate(tile.path)}
                      sx={{ 
                        p: 2.5, borderRadius: '20px', border: '1px solid #f1f5f9', bgcolor: '#fff',
                        display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer', 
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                        '&:hover': { bgcolor: '#f8fafc', transform: 'translateY(-4px)', boxShadow: '0 12px 30px rgba(0,0,0,0.06)', borderColor: tile.color + '40' } 
                      }}
                    >
                      <Box sx={{ p: 1.5, borderRadius: '14px', bgcolor: tile.color + '10', color: tile.color, display: 'flex' }}>{tile.icon}</Box>
                      <Box>
                        <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: '16px' }}>{tile.title}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>{tile.desc}</Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Grid container spacing={4}>
              {/* LEFT COLUMN */}
              <Grid item xs={12} md={8}>
                
                {/* TODAY'S WORK CARD */}
                <Paper sx={{ p: 4, borderRadius: '24px', border: '1px solid #f1f5f9', mb: 5, bgcolor: '#fff', position: 'relative' }}>
                  <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
                    <Chip label="High Priority" size="small" bg="#fef2f2" color="error" sx={{ fontWeight: 800 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 900, mb: 4, color: '#1e293b' }}>📍 Today's Work</Typography>
                  <Box sx={{ p: 4, borderRadius: '24px', bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                    <Grid container spacing={4} alignItems="center">
                      <Grid item xs={12} md={8}>
                        <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>{currentStage?.substeps[0] || 'Observe Growth'}</Typography>
                        <Stack spacing={2} sx={{ color: '#64748b', mb: 0 }}>
                          <Box sx={{ display: 'flex', gap: 1 }}><Typography variant="body2" sx={{ fontWeight: 700 }}>Quantity:</Typography><Typography variant="body2">Based on land size ({profile?.land_size || 2.5} Acres)</Typography></Box>
                          <Box sx={{ display: 'flex', gap: 1 }}><Typography variant="body2" sx={{ fontWeight: 700 }}>Best Time:</Typography><Typography variant="body2">Early Morning (6:00 AM - 9:00 AM)</Typography></Box>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Button
                          fullWidth variant="contained"
                          onClick={() => setTodayTaskCompleted(!todayTaskCompleted)}
                          sx={{ 
                            py: 2, borderRadius: '16px', fontWeight: 900, textTransform: 'none',
                            bgcolor: todayTaskCompleted ? '#16a34a' : '#1e1b4b',
                            '&:hover': { bgcolor: todayTaskCompleted ? '#15803d' : '#000' }
                          }}
                        >
                          {todayTaskCompleted ? '✅ Task Completed' : 'Mark as Completed'}
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>

                {/* CROP PROCESS TIMELINE */}
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 900, mb: 4, color: '#1e293b' }}>📜 Crop Process Timeline</Typography>
                  {selectedCrop.stages.map((stage, idx) => {
                    const status = getStageStatus(stage.stage_id);
                    const isExpanded = expandedStage === stage.stage_id;
                    
                    return (
                      <Box key={stage.stage_id} sx={{ display: 'flex', gap: 4, position: 'relative' }}>
                        {/* Timeline Graphic */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Box sx={{ 
                            width: 32, height: 32, borderRadius: '50%', 
                            bgcolor: status === 'completed' ? '#16a34a' : (status === 'current' ? '#f59e0b' : '#e2e8f0'),
                            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 2, boxShadow: '0 0 0 4px #fff'
                          }}>
                            {status === 'completed' ? <CheckCircle sx={{ fontSize: 20 }} /> : <Typography sx={{ fontSize: 14, fontWeight: 900 }}>{stage.stage_id}</Typography>}
                          </Box>
                          {idx < selectedCrop.stages.length - 1 && (
                            <Box sx={{ 
                              width: 3, flexGrow: 1, my: 1,
                              background: status === 'completed' ? '#16a34a' : '#e2e8f0',
                              position: 'relative'
                            }}>
                              <Box sx={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 8, height: 8, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
                              <Box sx={{ position: 'absolute', top: '40%', left: '50%', transform: 'translateX(-50%)', width: 8, height: 8, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
                              <Box sx={{ position: 'absolute', top: '60%', left: '50%', transform: 'translateX(-50%)', width: 8, height: 8, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
                            </Box>
                          )}
                        </Box>

                        {/* Accordion Card */}
                        <Accordion
                          expanded={isExpanded}
                          onChange={() => setExpandedStage(isExpanded ? null : stage.stage_id)}
                          sx={{ 
                            flexGrow: 1, mb: 4, borderRadius: '20px !important', border: '1px solid #f1f5f9',
                            boxShadow: isExpanded ? '0 15px 30px rgba(0,0,0,0.04)' : 'none',
                            bgcolor: status === 'current' ? '#fff' : '#fafafa',
                            '&:before': { display: 'none' }
                          }}
                        >
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Typography variant="h6" sx={{ fontWeight: 800, color: status === 'pending' ? '#94a3b8' : '#1e293b' }}>
                                {stage.title}
                              </Typography>
                              {status === 'current' && <Chip label="In Progress" size="small" sx={{ bgcolor: '#fff7ed', color: '#c2410c', fontWeight: 800, borderRadius: '6px' }} />}
                            </Stack>
                          </AccordionSummary>
                          <AccordionDetails sx={{ pt: 0, pb: 3 }}>
                            <Divider sx={{ mb: 3, opacity: 0.5 }} />
                            <Stack spacing={1.5}>
                              {stage.substeps.map((sub, i) => (
                                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: '12px', bgcolor: '#fff', border: '1px solid #f1f5f9' }}>
                                  <Checkbox checked={status === 'completed' || (status === 'current' && i === 0 && todayTaskCompleted)} color="success" size="small" />
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{sub}</Typography>
                                </Box>
                              ))}
                            </Stack>
                          </AccordionDetails>
                        </Accordion>
                      </Box>
                    );
                  })}
                </Box>
              </Grid>

              {/* RIGHT COLUMN */}
              <Grid item xs={12} md={4}>
                <Stack spacing={4}>
                  
                  {/* WEATHER + ADVISORY PANEL */}
                  <Paper sx={{ p: 4, borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>Weather Advisory</Typography>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                      {[
                        { label: 'Temp', val: '28°C', icon: <Thermostat sx={{ color: '#ef4444' }} /> },
                        { label: 'Humid', val: '72%', icon: <Opacity sx={{ color: '#3b82f6' }} /> },
                        { label: 'Wind', val: '12km/h', icon: <WindPower sx={{ color: '#10b981' }} /> },
                        { label: 'Rain', val: '10%', icon: <Grain sx={{ color: '#6366f1' }} /> }
                      ].map((stat, i) => (
                        <Grid item xs={6} key={i}>
                          <Box sx={{ py: 2.5, px: 2, borderRadius: '20px', bgcolor: '#f8fafc', textAlign: 'center', border: '1px solid #f1f5f9', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', '&:hover': { bgcolor: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', borderColor: '#e2e8f0', transform: 'translateY(-2px)' } }}>
                            <Box sx={{ mb: 1, p: 1, borderRadius: '12px', bgcolor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex' }}>{stat.icon}</Box>
                            <Typography variant="caption" sx={{ display: 'block', color: '#64748b', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5 }}>{stat.label}</Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#1e293b' }}>{stat.val}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>

                    <Box sx={{ p: 3, borderRadius: '16px', bgcolor: '#fffbeb', border: '1px solid #fef3c7' }}>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                        <NotificationsActive sx={{ color: '#d97706', fontSize: 18 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#92400e' }}>AI Advisory</Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ color: '#b45309', fontWeight: 600, lineHeight: 1.6 }}>
                        Avoid fertilizer application in afternoon. High sun intensity may reduce effectiveness. Increase irrigation today.
                      </Typography>
                    </Box>
                  </Paper>

                  {/* PROFIT SNAPSHOT */}
                  <Paper sx={{ p: 4, borderRadius: '24px', background: '#1e1b4b', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                    <Box sx={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                    <Typography variant="h6" sx={{ fontWeight: 900, mb: 4 }}>Profit Snapshot</Typography>
                    <Stack spacing={4}>
                      <Box>
                        <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 800, letterSpacing: 1 }}>EXPECTED PROFIT</Typography>
                        <Stack direction="row" alignItems="baseline" spacing={1}>
                          <Typography variant="h3" sx={{ fontWeight: 900, color: '#22c55e' }}>₹1,24,000</Typography>
                        </Stack>
                      </Box>
                      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 800 }}>EST. YIELD</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>180 q</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 800 }}>MKT PRICE</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>₹2,300/q</Typography>
                        </Grid>
                      </Grid>
                      <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.05)', textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 800 }}>MONTHLY INCOME EST.</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900 }}>₹24,800</Typography>
                      </Box>
                    </Stack>
                  </Paper>

                  {/* UPCOMING TASKS */}
                  <Paper sx={{ p: 4, borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>Upcoming Tasks</Typography>
                    <Stack spacing={2}>
                      {[
                        { day: 'Tomorrow', task: 'Water field', icon: <WaterDrop /> },
                        { day: 'Day 26', task: 'Apply Potash', icon: <LocalFlorist /> },
                        { day: 'Day 30', task: 'Pest inspection', icon: <Air /> }
                      ].map((item, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: '12px', bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                          <Box sx={{ color: '#16a34a' }}>{item.icon}</Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800 }}>{item.day}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.task}</Typography>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>

                </Stack>
              </Grid>
            </Grid>
          </Box>
        )}
      </Container>
      
      {/* DIALOGS */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 900 }}>Delete Crop?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#64748b' }}>
            Are you sure you want to delete {selectedCrop?.crop_name}? It will be moved to the bin and can be restored within 3 days.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ pb: 2, pr: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ fontWeight: 700, color: '#64748b' }}>Cancel</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error" sx={{ fontWeight: 700, borderRadius: '10px' }}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={binModalOpen} onClose={() => setBinModalOpen(false)} PaperProps={{ sx: { borderRadius: '20px', p: 1, minWidth: { xs: '90vw', sm: '400px' }, maxWidth: '500px' } }}>
        <DialogTitle sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}><DeleteSweep /> Recycle Bin</DialogTitle>
        <DialogContent dividers>
          {(() => {
            const bin = JSON.parse(localStorage.getItem(`binned_crops_${session?.user?.id}`) || '[]');
            if (!bin || bin.length === 0) return <Typography sx={{ color: '#94a3b8', textAlign: 'center', py: 4 }}>Bin is empty.</Typography>;
            return (
              <Stack spacing={2}>
                {bin.map(b => (
                  <Paper key={b.id} sx={{ p: 2, borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc' }}>
                    <Box>
                      <Typography sx={{ fontWeight: 800 }}>{b.cropName}</Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>Deleted: {new Date(b.deletedAt).toLocaleDateString()}</Typography>
                    </Box>
                    <Button variant="outlined" size="small" onClick={() => handleRestoreFromBin(b.id)} sx={{ fontWeight: 700, borderRadius: '8px', textTransform: 'none' }}>Restore</Button>
                  </Paper>
                ))}
              </Stack>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBinModalOpen(false)} sx={{ fontWeight: 700 }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Bot only appears when logged in (already in ActionHome context) */}
      <AgriBot />
    </Box>
  );
};

export default ActionHome;

