import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, IconButton, Stack } from '@mui/material';
import { ChevronLeft, ChevronRight, CheckCircle, EventAvailable } from '@mui/icons-material';

const CropCalendarCard = ({ selectedCrop, cropStartDate, daysPassed, substepStatus }) => {
  const [selectedDay, setSelectedDay] = useState(daysPassed);
  const scrollRef = useRef(null);

  // Scroll to current day on mount
  useEffect(() => {
    setSelectedDay(daysPassed);
  }, [daysPassed]);

  useEffect(() => {
    if (scrollRef.current) {
        // Find the active element
        setTimeout(() => {
          if (!scrollRef.current) return;
          const activeElement = scrollRef.current.querySelector('.active-day');
          if (activeElement) {
              const containerOffset = scrollRef.current.offsetLeft;
              const elementOffset = activeElement.offsetLeft;
              const centerPos = elementOffset - containerOffset - (scrollRef.current.offsetWidth / 2) + (activeElement.offsetWidth / 2);
              scrollRef.current.scrollTo({ left: centerPos, behavior: 'smooth' });
          }
        }, 100);
    }
  }, [daysPassed, selectedDay, selectedCrop]);

  if (!selectedCrop || !cropStartDate) return null;

  const totalDays = selectedCrop.total_duration_days;
  const startMs = new Date(cropStartDate).getTime();
  
  // Create an array of days from Day 1 to totalDays
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  const getStageForDay = (dayNum) => {
      let elapsed = 0;
      for (let stage of selectedCrop.stages) {
          elapsed += stage.duration_days;
          if (dayNum <= Math.max(1, elapsed)) return stage;
      }
      return selectedCrop.stages[selectedCrop.stages.length - 1];
  };

  const getTasksForDay = (dayNum) => {
      const stage = getStageForDay(dayNum);
      if (!stage || !stage.substeps) return [];
      
      const stepInterval = Math.max(1, Math.floor(stage.duration_days / Math.max(1, stage.substeps.length)));
      const relativeDayInStage = dayNum - stage.start_day + 1;
      
      return stage.substeps.map((sub, i) => ({
          sub, 
          i, 
          targetDay: (i * stepInterval) + 1, 
          stage_id: stage.stage_id
      })).filter(item => item.targetDay === relativeDayInStage);
  };

  const selectedStage = getStageForDay(selectedDay);
  const selectedTasks = getTasksForDay(selectedDay);

  const handleScroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
    }
  };

  return (
    <Paper className="neo-card" sx={{ p: 0, overflow: 'hidden', bgcolor: 'var(--card-bg)', borderColor: 'var(--card-border)', mb: '24px' }}>
      <Box sx={{ p: '20px 24px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ p: 1, bgcolor: 'rgba(57, 255, 106, 0.1)', borderRadius: '10px', display: 'flex', border: '1px solid rgba(57, 255, 106, 0.2)' }}>
             <EventAvailable sx={{ color: 'var(--neon-green)', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 1 }}>
              Crop Daily Calendar
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--text-sub)' }}>
              Scroll left to right to check daily tasks
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Calendar Scroll Area */}
      <Box sx={{ position: 'relative', borderBottom: '1px solid var(--card-border)', bgcolor: 'rgba(255,255,255,0.01)' }}>
        <IconButton 
          onClick={() => handleScroll(-1)} 
          sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', zIndex: 2, bgcolor: 'var(--card-bg)', border: '1px solid var(--card-border)', '&:hover': { bgcolor: 'var(--card-border)' } }} 
          size="small"
        >
          <ChevronLeft />
        </IconButton>
        
        <Box 
          ref={scrollRef}
          sx={{ 
            display: 'flex', 
            overflowX: 'auto', 
            p: '24px 48px', 
            gap: 2, 
            scrollbarWidth: 'none', 
            '&::-webkit-scrollbar': { display: 'none' } 
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
                  minWidth: '65px', 
                  height: '80px',
                  borderRadius: '14px', 
                  border: `1px solid ${boxBorder}`,
                  bgcolor: boxBg,
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  flexShrink: 0,
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: 'var(--neon-green)', bgcolor: isSelected ? boxBg : 'rgba(57, 255, 106, 0.02)' }
                }}
              >
                {isToday && (
                  <Typography variant="overline" sx={{ position: 'absolute', top: -14, color: 'var(--teal-blue)', fontSize: '9px', fontWeight: 800, letterSpacing: 0.5 }}>
                    TODAY
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
                
                {/* Task Indicators */}
                <Box sx={{ position: 'absolute', bottom: '6px', display: 'flex', gap: '4px' }}>
                  {hasTask && !allDone && <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: isPast ? 'var(--danger-red)' : 'var(--warning-yellow)' }} />}
                  {allDone && <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'var(--neon-green)' }} />}
                </Box>
              </Box>
            );
          })}
        </Box>

        <IconButton 
          onClick={() => handleScroll(1)} 
          sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', zIndex: 2, bgcolor: 'var(--card-bg)', border: '1px solid var(--card-border)', '&:hover': { bgcolor: 'var(--card-border)' } }} 
          size="small"
        >
          <ChevronRight />
        </IconButton>
      </Box>

      {/* Day Details Area */}
      <Box sx={{ p: '24px', minHeight: '130px' }}>
         <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
           <Box>
             <Typography variant="subtitle2" sx={{ color: 'var(--neon-green)', fontWeight: 800, fontSize: '14px', mb: 0.2 }}>
                DAY {selectedDay} / {totalDays}
             </Typography>
             <Typography variant="caption" sx={{ color: 'var(--text-sub)', display: 'block', fontWeight: 500 }}>
                {new Date(startMs + (selectedDay - 1) * 86400000).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
             </Typography>
           </Box>
           <Box sx={{ px: 1.5, py: 0.5, border: '1px solid var(--card-border)', borderRadius: '20px', bgcolor: 'rgba(255,255,255,0.02)' }}>
             <Typography variant="caption" sx={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '11px' }}>
               {selectedStage?.title} Stage
             </Typography>
           </Box>
         </Stack>

         {selectedTasks.length > 0 ? (
           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
             {selectedTasks.map((t, idx) => {
               const substepStatusObj = substepStatus || {};
               const isDone = substepStatusObj[`${t.stage_id}_${t.i}`];
               
               return (
                 <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', p: 2, bgcolor: isDone ? 'rgba(57, 255, 106, 0.05)' : 'rgba(255,255,255,0.02)', borderRadius: '12px', border: `1px solid ${isDone ? 'rgba(57, 255, 106, 0.2)' : 'var(--card-border)'}`, transition: 'all 0.2s' }}>
                   {isDone ? (
                     <CheckCircle sx={{ color: 'var(--neon-green)', fontSize: 22, mt: '-2px' }} />
                   ) : (
                     <Box sx={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--card-border)', mt: '2px', flexShrink: 0 }} />
                   )}
                   <Box>
                     <Typography variant="body2" sx={{ color: isDone ? 'var(--text-sub)' : 'var(--text-main)', textDecoration: isDone ? 'line-through' : 'none', fontWeight: 600, fontSize: '14px', lineHeight: 1.4 }}>
                       {t.sub}
                     </Typography>
                     {isDone && (
                       <Typography variant="caption" sx={{ color: 'var(--neon-green)', mt: 0.5, display: 'block', fontWeight: 600 }}>
                         ✓ Completed on {new Date(startMs + (selectedDay - 1) * 86400000).toLocaleDateString()}
                       </Typography>
                     )}
                   </Box>
                 </Box>
               );
             })}
           </Box>
         ) : (
           <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80px', flexDirection: 'column', bgcolor: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px dashed var(--card-border)' }}>
              <Typography variant="body2" sx={{ color: 'var(--text-main)', fontWeight: 600, mb: 0.5 }}>No major tasks scheduled</Typography>
              <Typography variant="caption" sx={{ color: 'var(--text-sub)', textAlign: 'center' }}>Regular checkup based on crop condition recommended</Typography>
           </Box>
         )}
      </Box>
    </Paper>
  );
};

export default CropCalendarCard;
