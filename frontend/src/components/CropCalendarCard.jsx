import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, IconButton, Stack } from '@mui/material';
import { ChevronLeft, ChevronRight, CheckCircle, EventAvailable } from '@mui/icons-material';

const CropCalendarCard = ({ selectedCrop, cropStartDate, daysPassed, substepStatus }) => {
  const [selectedDay, setSelectedDay] = useState(() => {
    if (selectedCrop && daysPassed) {
      const totalDays = selectedCrop.total_duration_days || 0;
      return Math.min(totalDays, Math.max(1, daysPassed));
    }
    return 1;
  });
  const scrollRef = useRef(null);

  // Set selected day to today's date on mount or when crop/daysPassed changes
  useEffect(() => {
    if (selectedCrop && daysPassed) {
      const totalDays = selectedCrop.total_duration_days || 0;
      setSelectedDay(Math.min(totalDays, Math.max(1, daysPassed)));
    } else {
      setSelectedDay(1);
    }
  }, [selectedCrop, daysPassed]);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollTo({ left: scrollRef.current.scrollWidth, behavior: 'smooth' });
      }, 100);
    }
  }, [daysPassed, selectedCrop]);

  if (!selectedCrop || !cropStartDate) return null;

  const totalDays = selectedCrop.total_duration_days || 140;
  const startMs = new Date(cropStartDate).getTime();
  
  // Render from Day 1 (Start Date) up to present date (daysPassed) only
  const endDayNum = Math.min(totalDays, Math.max(1, daysPassed || 1));
  const daysArray = Array.from({ length: endDayNum }, (_, i) => i + 1);

  const getStageForDay = (dayNum) => {
      if (!selectedCrop || !selectedCrop.stages) return null;
      for (let stage of selectedCrop.stages) {
          if (dayNum >= stage.start_day && dayNum <= stage.end_day) return stage;
      }
      return selectedCrop.stages[selectedCrop.stages.length - 1];
  };

  const getTasksForDay = (dayNum) => {
      if (!selectedCrop || !selectedCrop.stages) return [];
      const tasks = [];
      for (let stage of selectedCrop.stages) {
          if (!stage.substeps) continue;
          stage.substeps.forEach((sub, i) => {
              if (sub.day === dayNum) {
                  tasks.push({
                      sub: sub.task,
                      i,
                      targetDay: sub.day,
                      stage_id: stage.stage_id
                  });
              }
          });
      }
      return tasks;
  };

  const selectedStage = getStageForDay(selectedDay);
  const selectedTasks = getTasksForDay(selectedDay);

  const handleScroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
    }
  };

  return (
    <Paper className="neo-card" sx={{ width: '100%', maxWidth: '100%', p: 0, overflow: 'hidden', bgcolor: 'var(--card-bg)', borderColor: 'var(--card-border)', mb: '16px' }}>
      <Box sx={{ p: '12px 16px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ p: 0.75, bgcolor: 'rgba(57, 255, 106, 0.1)', borderRadius: '8px', display: 'flex', border: '1px solid rgba(57, 255, 106, 0.2)' }}>
             <EventAvailable sx={{ color: 'var(--neon-green)', fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 1 }}>
              Crop Daily Calendar
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--text-sub)', fontSize: '11px' }}>
              Scroll left to right to check daily tasks
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Calendar Scroll Area */}
      <Box sx={{ position: 'relative', borderBottom: '1px solid var(--card-border)', bgcolor: 'rgba(255,255,255,0.01)', width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
        <IconButton 
          onClick={() => handleScroll(-1)} 
          sx={{ position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)', zIndex: 2, bgcolor: 'var(--card-bg)', border: '1px solid var(--card-border)', '&:hover': { bgcolor: 'var(--card-border)' } }} 
          size="small"
        >
          <ChevronLeft fontSize="small" />
        </IconButton>
        
        <Box 
          ref={scrollRef}
          sx={{ 
            display: 'flex', 
            overflowX: 'auto', 
            p: '12px 36px', 
            gap: 1.5, 
            scrollbarWidth: 'none', 
            '&::-webkit-scrollbar': { display: 'none' },
            width: '100%'
          }}
        >
          {daysArray.map(dayNum => {
            const date = new Date(startMs + (dayNum - 1) * 86400000);
            const isToday = dayNum === daysPassed;
            const isSelected = dayNum === selectedDay;
            const isPast = dayNum < daysPassed;
            const dayTasks = getTasksForDay(dayNum);
            
            // Check if all tasks for this day are done (if there are tasks)
            const substepStatusObj = substepStatus || {};
            const allDone = dayTasks.length > 0 && dayTasks.every(t => substepStatusObj[`${t.stage_id}_${t.i}`]);
            const hasTask = dayTasks.length > 0;

            const boxBorder = isSelected ? 'var(--neon-green)' : 'var(--card-border)';
            let boxBg = 'transparent';
            if (isSelected) boxBg = 'rgba(57, 255, 106, 0.08)';
            else if (isToday) boxBg = 'rgba(20, 184, 166, 0.1)';
            else if (isPast) boxBg = 'rgba(255,255,255,0.03)';

            return (
              <Box 
                key={dayNum}
                className={isSelected ? 'active-day' : ''}
                onClick={() => setSelectedDay(dayNum)}
                sx={{ 
                  minWidth: '52px', 
                  height: '64px',
                  borderRadius: '10px', 
                  border: `1px solid ${boxBorder}`,
                  bgcolor: boxBg,
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  pt: '10px',
                  cursor: 'pointer',
                  position: 'relative',
                  flexShrink: 0,
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: 'var(--neon-green)', bgcolor: isSelected ? boxBg : 'rgba(57, 255, 106, 0.02)' }
                }}
              >
                {isToday && dayNum !== 1 && (
                  <Typography variant="overline" sx={{ position: 'absolute', top: 3, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', color: 'var(--teal-blue)', fontSize: '8px', fontWeight: 800, letterSpacing: 0.5, lineHeight: 1 }}>
                    TODAY
                  </Typography>
                )}
                {isToday && dayNum === 1 && (
                  <Typography variant="overline" sx={{ position: 'absolute', top: 3, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', color: 'var(--teal-blue)', fontSize: '8px', fontWeight: 800, letterSpacing: 0.5, lineHeight: 1 }}>
                    TODAY / START
                  </Typography>
                )}
                {dayNum === 1 && !isToday && (
                  <Typography variant="overline" sx={{ position: 'absolute', top: 3, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', color: 'var(--warning-yellow)', fontSize: '8px', fontWeight: 800, letterSpacing: 0.5, lineHeight: 1 }}>
                    START DATE
                  </Typography>
                )}
                
                <Typography variant="caption" sx={{ color: isSelected ? 'var(--neon-green)' : (isToday ? 'var(--teal-blue)' : 'var(--text-sub)'), fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </Typography>
                <Typography variant="h6" sx={{ color: isSelected || isToday ? 'var(--text-main)' : (isPast ? 'var(--text-sub)' : 'var(--text-main)'), fontWeight: 800, lineHeight: 1.2 }}>
                  {date.getDate()}
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--text-sub)', fontSize: '9px' }}>
                  DAY {dayNum}
                </Typography>
              </Box>
            );
          })}
        </Box>

        <IconButton 
          size="small" 
          onClick={() => { if (scrollRef.current) scrollRef.current.scrollBy({ left: 140, behavior: 'smooth' }); }}
          sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', zIndex: 2, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', '&:hover': { bgcolor: '#F1F5F9' } }}
        >
          <ChevronRight />
        </IconButton>
      </Box>

      {/* Day Details Area & View Full Journey Button */}
      <Box sx={{ p: '20px 24px' }}>
         <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, flexWrap: 'nowrap', gap: 1.5 }}>
           <Box sx={{ minWidth: 0 }}>
             <Typography variant="subtitle2" sx={{ color: '#059669', fontWeight: 800, fontSize: '14px', mb: 0.2, whiteSpace: 'nowrap' }}>
                DAY {selectedDay} / {totalDays}
             </Typography>
             <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 600, fontSize: '12px', whiteSpace: 'nowrap' }}>
                {new Date(startMs + (selectedDay - 1) * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
             </Typography>
           </Box>
           <Box sx={{ px: 1.5, py: 0.6, border: '1px solid #DCFCE7', borderRadius: '20px', bgcolor: '#F0FDF4', flexShrink: 0 }}>
             <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 700, fontSize: '12px', whiteSpace: 'nowrap' }}>
               {selectedStage?.title || 'Fertilizer Application'} Stage
             </Typography>
           </Box>
         </Stack>

         {/* VIEW FULL CROP JOURNEY BUTTON */}
         <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #F1F5F9' }}>
           <button 
             className="btn-predict-crop-gradient" 
             onClick={() => {
               const el = document.querySelector('.crop-journey-card');
               if (el) {
                 el.scrollIntoView({ behavior: 'smooth' });
               } else {
                 navigate('/dashboard/calendar');
               }
             }}
             style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', borderRadius: '14px', fontSize: '13px' }}
           >
             <span>View Full Crop Journey</span>
             <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
               <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
             </svg>
           </button>
         </Box>
      </Box>
    </Paper>
  );
};

export default CropCalendarCard;
