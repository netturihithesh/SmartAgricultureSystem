import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Typography, Paper, Grid, Button, Chip, LinearProgress, Checkbox, Container, Divider } from '@mui/material';
import { 
  CheckCircle, RadioButtonUnchecked, Timeline, Agriculture, WaterDrop, 
  WbSunny, Event, ArrowForward, Check, PlayArrow, AccessTime
} from '@mui/icons-material';
import { supabase } from '../supabase';
import cropProcessData from '../data/crop_process.json';

const CropJourneyPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const targetCropQuery = queryParams.get('crop');

  const [session, setSession] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState(cropProcessData[0]);
  const [daysPassed, setDaysPassed] = useState(49);
  const [activeStageId, setActiveStageId] = useState(null);
  const [taskStatus, setTaskStatus] = useState({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) {
        try {
          const crops = JSON.parse(localStorage.getItem(`user_crops_${session.user.id}`) || '[]');
          if (Array.isArray(crops) && crops.length > 0) {
            let activeIndex = parseInt(localStorage.getItem(`active_crop_index_${session.user.id}`) || '0');
            if (isNaN(activeIndex) || activeIndex >= crops.length) activeIndex = 0;
            
            if (targetCropQuery) {
              const queryName = targetCropQuery.toLowerCase();
              const foundIdx = crops.findIndex(c => {
                const n = (c.cropName || c.crop_name || '').toLowerCase();
                return n === queryName || n.includes(queryName) || queryName.includes(n);
              });
              if (foundIdx >= 0) activeIndex = foundIdx;
            }

            const rawName = crops[activeIndex]?.cropName || crops[activeIndex]?.crop_name || '';
            const targetName = rawName.toLowerCase();
            const found = cropProcessData.find(c => c.crop_name && c.crop_name.toLowerCase().includes(targetName));
            if (found) setSelectedCrop(found);

            // Load sow date to calculate real days passed
            const sowDateStr = crops[activeIndex]?.sowDate || crops[activeIndex]?.sow_date;
            if (sowDateStr) {
              const start = new Date(sowDateStr);
              const now = new Date();
              const diffTime = Math.abs(now - start);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              if (!isNaN(diffDays) && diffDays > 0) setDaysPassed(diffDays);
            }
          }

          // Load task checklist status
          const savedTasks = JSON.parse(localStorage.getItem(`task_checklist_${session.user.id}`) || '{}');
          setTaskStatus(savedTasks);
        } catch (e) {
          console.error("Error initializing Crop Journey:", e);
        }
      }
    });
  }, []);

  const totalDuration = selectedCrop?.total_duration_days || 140;
  const progressPercent = Math.min(Math.round((daysPassed / totalDuration) * 100), 100);

  // Compute active stage based on days passed
  const calculatedActiveStage = useMemo(() => {
    if (!selectedCrop?.stages) return cropProcessData[0].stages[3];
    let accumulatedDays = 0;
    for (let stage of selectedCrop.stages) {
      accumulatedDays += stage.duration_days;
      if (daysPassed <= accumulatedDays) {
        return stage;
      }
    }
    return selectedCrop.stages[selectedCrop.stages.length - 1];
  }, [selectedCrop, daysPassed]);



  const toggleTask = (taskKey) => {
    const updated = { ...taskStatus, [taskKey]: !taskStatus[taskKey] };
    setTaskStatus(updated);
    if (session?.user?.id) {
      localStorage.setItem(`task_checklist_${session.user.id}`, JSON.stringify(updated));
    }
  };

  const selectedStageObj = useMemo(() => {
    return selectedCrop?.stages?.find(s => s.stage_id === (activeStageId || calculatedActiveStage?.stage_id)) || calculatedActiveStage;
  }, [selectedCrop, activeStageId, calculatedActiveStage]);

  return (
    <Box sx={{ p: { xs: 2, md: 3, lg: 4 }, pb: 10, bgcolor: '#F8FAFC', minHeight: '100vh', width: '100%' }}>
      
      {/* ── HEADER BANNER ───────────────────────────────────────────────── */}
      <Paper 
        sx={{ 
          p: { xs: 3, md: 4 }, 
          borderRadius: '24px', 
          mb: 4, 
          background: 'linear-gradient(135deg, #065F46 0%, #047857 50%, #059669 100%)',
          color: '#fff',
          boxShadow: '0 12px 32px rgba(4, 120, 87, 0.22)'
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={7}>
            <Chip 
              icon={<Timeline sx={{ color: '#FDE047 !important' }} />} 
              label="Phenological Stage Tracking & Daily Workflow" 
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 800, mb: 1.5 }} 
            />
            <Typography variant="h3" sx={{ fontWeight: 900, fontSize: { xs: '26px', md: '34px' }, mb: 1 }}>
              Crop Journey & Stage Pipeline
            </Typography>
            <Typography variant="body1" sx={{ color: '#A7F3D0', fontSize: '15px' }}>
              Track growth milestones, manage daily field action items, and optimize harvest yield.
            </Typography>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper 
              sx={{ 
                p: 3, 
                bgcolor: 'rgba(255,255,255,0.12)', 
                backdropFilter: 'blur(16px)', 
                border: '1px solid rgba(255,255,255,0.2)', 
                borderRadius: '20px', 
                color: '#fff' 
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#A7F3D0', fontWeight: 800, display: 'block' }}>ACTIVE CROP</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>{selectedCrop?.crop_name || 'Paddy (Basmati)'}</Typography>
                </Box>
                <Chip 
                  label={`Day ${daysPassed} of ${totalDuration}`} 
                  sx={{ bgcolor: '#FDE047', color: '#0F172A', fontWeight: 900, borderRadius: '10px' }} 
                />
              </Box>
              
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#E2E8F0', fontWeight: 700 }}>Total Growth Progress</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 900 }}>{progressPercent}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={progressPercent} 
                  sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { bgcolor: '#FDE047' } }} 
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* ── 1. PIPELINE MILESTONE RIBBON ───────────────────────────────── */}
      <Paper sx={{ p: 3, borderRadius: '24px', mb: 4, bgcolor: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '18px', mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <span>📍</span> Stage Milestone Ribbon
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1, scrollbarWidth: 'none' }}>
          {selectedCrop?.stages?.map((stg, idx) => {
            const isCompleted = stg.stage_id < calculatedActiveStage.stage_id;
            const isActive = stg.stage_id === calculatedActiveStage.stage_id;
            const isSelected = stg.stage_id === activeStageId;

            return (
              <Box
                key={idx}
                onClick={() => setActiveStageId(stg.stage_id)}
                sx={{
                  minWidth: '160px',
                  p: 2,
                  borderRadius: '16px',
                  border: isSelected ? '2px solid #059669' : '1px solid #E2E8F0',
                  bgcolor: isSelected ? '#ECFDF5' : isActive ? '#FEFCE8' : '#F8FAFC',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                  '&:hover': { transform: 'translateY(-2px)' }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800 }}>STAGE {stg.stage_id}</Typography>
                  {isCompleted ? (
                    <CheckCircle sx={{ fontSize: 16, color: '#10B981' }} />
                  ) : isActive ? (
                    <Chip label="ACTIVE" size="small" sx={{ bgcolor: '#FEF3C7', color: '#D97706', fontSize: '9px', fontWeight: 900, height: 18 }} />
                  ) : (
                    <AccessTime sx={{ fontSize: 16, color: '#CBD5E1' }} />
                  )}
                </Box>

                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '13px', mb: 0.5, lineHeight: 1.3 }}>
                  {stg.title}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '11px' }}>
                  {stg.duration_days} Days
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Paper>

      {/* ── 2. ACTIVE STAGE DEEP-DIVE & TODAY'S TASKS ────────────────────── */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4, alignItems: 'stretch' }}>
        {/* Today's Field Action Items */}
        <Box sx={{ flex: 7 }}>
          <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: '#fff', border: '1px solid #E2E8F0', height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '18px' }}>
                  Today's Action Items - Day {daysPassed}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                  Active Stage: {calculatedActiveStage?.title}
                </Typography>
              </Box>
              <Chip label="High Priority" color="success" size="small" sx={{ fontWeight: 800 }} />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {selectedStageObj?.substeps?.map((sub, i) => {
                const taskText = typeof sub === 'string' ? sub : sub.task || sub.substep || 'Field Inspection';
                const taskKey = `${selectedCrop.crop_name}_${selectedStageObj.stage_id}_${i}`;
                const isChecked = !!taskStatus[taskKey];

                return (
                  <Box
                    key={i}
                    onClick={() => toggleTask(taskKey)}
                    sx={{
                      p: 2,
                      borderRadius: '16px',
                      border: '1px solid #E2E8F0',
                      bgcolor: isChecked ? '#F0FDF4' : '#F8FAFC',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Checkbox
                      checked={isChecked}
                      onChange={() => toggleTask(taskKey)}
                      sx={{ color: '#059669', '&.Mui-checked': { color: '#059669' } }}
                    />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 700, 
                        color: isChecked ? '#166534' : '#0F172A',
                        textDecoration: isChecked ? 'line-through' : 'none'
                      }}
                    >
                      {taskText}
                    </Typography>
                  </Box>
                );
              })}

              {(!selectedStageObj?.substeps || selectedStageObj.substeps.length === 0) && (
                <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: '16px' }}>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
                    🌿 Regular Crop Checkup: Inspect field for soil moisture, weed growth, and leaf health.
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Box>

        {/* Stage Overview & Guidelines */}
        <Box sx={{ flex: 5 }}>
          <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: '#fff', border: '1px solid #E2E8F0', height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '18px', mb: 2 }}>
              Stage Guidelines & Best Practices
            </Typography>

            <Box sx={{ p: 2.5, bgcolor: '#ECFDF5', borderRadius: '18px', border: '1px solid #A7F3D0', mb: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#047857', fontWeight: 800, display: 'block', mb: 0.5 }}>SELECTED STAGE</Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#065F46', mb: 1 }}>{selectedStageObj?.title}</Typography>
              <Typography variant="body2" sx={{ color: '#047857', fontSize: '13px', lineHeight: 1.5 }}>
                Ensure balanced NPK application in split doses. Maintain optimal soil moisture level without flooding to encourage tillering and root spread.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px dashed #E2E8F0' }}>
                <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>Target Duration</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>{selectedStageObj?.duration_days} Days</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px dashed #E2E8F0' }}>
                <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>Status</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#059669' }}>
                  {selectedStageObj?.stage_id === calculatedActiveStage.stage_id ? 'Active Stage' : 'Scheduled'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

    </Box>
  );
};

export default CropJourneyPage;
