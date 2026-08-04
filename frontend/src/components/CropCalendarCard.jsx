import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, IconButton, Stack } from '@mui/material';
import { ChevronLeft, ChevronRight, CheckCircle, EventAvailable } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const CropCalendarCard = ({ selectedCrop, cropStartDate, daysPassed, substepStatus }) => {
  const navigate = useNavigate();
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

      {/* Calendar Scroll Area (Clean 100% full-width strip with non-colliding pill badges) */}
      <Box sx={{ borderBottom: '1px solid #F1F5F9', bgcolor: '#F8FAFC', width: '100%', pt: 2, pb: 2 }}>
        <Box 
          ref={scrollRef}
          sx={{ 
            display: 'flex', 
            overflowX: 'auto', 
            px: 2, 
            gap: 1.2, 
            scrollbarWidth: 'none', 
            '&::-webkit-scrollbar': { display: 'none' },
            width: '100%'
          }}
        >
          {daysArray.map(dayNum => {
            const date = new Date(startMs + (dayNum - 1) * 86400000);
            const isToday = dayNum === Math.min(totalDays, daysPassed || 1);
            const isSelected = dayNum === selectedDay;
            const isStart = dayNum === 1;

            const boxBorder = isSelected ? '#059669' : isToday ? '#86EFAC' : '#E2E8F0';
            const boxBg = isSelected ? '#ECFDF5' : isToday ? '#F0FDF4' : '#FFFFFF';

            return (
              <Box 
                key={dayNum}
                onClick={() => setSelectedDay(dayNum)}
                sx={{ 
                  minWidth: '60px', 
                  height: '78px',
                  borderRadius: '14px', 
                  border: isSelected ? `2px solid ${boxBorder}` : `1px solid ${boxBorder}`,
                  bgcolor: boxBg,
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                  px: 0.5,
                  '&:hover': { borderColor: '#059669', boxShadow: '0 2px 8px rgba(5, 150, 105, 0.15)' }
                }}
              >
                {isToday ? (
                  <Typography variant="caption" sx={{ fontSize: '8px', fontWeight: 800, color: '#15803D', bgcolor: '#DCFCE7', px: 0.7, py: 0.2, borderRadius: '999px', mb: 0.3, border: '1px solid #86EFAC', whiteSpace: 'nowrap', lineHeight: 1 }}>
                    TODAY
                  </Typography>
                ) : isStart ? (
                  <Typography variant="caption" sx={{ fontSize: '8px', fontWeight: 800, color: '#B45309', bgcolor: '#FEF3C7', px: 0.7, py: 0.2, borderRadius: '999px', mb: 0.3, border: '1px solid #FDE68A', whiteSpace: 'nowrap', lineHeight: 1 }}>
                    START
                  </Typography>
                ) : null}

                <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 700, color: isSelected ? '#059669' : '#64748B', mb: 0.1, textTransform: 'uppercase' }}>
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 800, fontSize: '16px', color: isSelected ? '#047857' : '#0F172A', lineHeight: 1.1 }}>
                  {date.getDate()}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '9px', fontWeight: 700, color: isSelected ? '#059669' : '#94A3B8', mt: 0.2 }}>
                  DAY {dayNum}
                </Typography>
              </Box>
            );
          })}
        </Box>
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
                 navigate(`/journey?crop=${encodeURIComponent(selectedCrop.crop_name)}`);
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
