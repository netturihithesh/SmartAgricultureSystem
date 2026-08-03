import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, Typography, Grid, Paper, Chip, IconButton, Button, Container, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Checkbox,
  MenuItem, Select, FormControl, InputLabel, Divider
} from '@mui/material';
import { 
  ChevronLeft, ChevronRight, CalendarToday, Person, CheckCircle, 
  AccessTime, Event, Warning, WaterDrop, Agriculture, ArrowForward, 
  WbSunny, Add, DeleteOutline, Check, Spa
} from '@mui/icons-material';
import { supabase } from '../supabase';
import cropProcessData from '../data/crop_process.json';

const FarmCalendar = () => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  
  // Real date state
  const todayDate = new Date();
  const [viewDate, setViewDate] = useState(new Date()); // Year and month being viewed
  const [selectedFullDate, setSelectedFullDate] = useState(new Date()); // Exact selected day

  // Active crop and custom tasks
  const [activeCrop, setActiveCrop] = useState(null);
  const [sowDate, setSowDate] = useState(new Date(2026, 5, 15)); // Default June 15 2026
  const [taskStatusMap, setTaskStatusMap] = useState({});
  const [customTasks, setCustomTasks] = useState([]);

  // Modal for adding new task
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Irrigation');
  const [newTaskTime, setNewTaskTime] = useState('08:00 AM – 10:00 AM');
  const [newTaskField, setNewTaskField] = useState('Field 1');

  const [showAllOverdue, setShowAllOverdue] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data }) => {
          if (data) setProfile(data);
        });

        // Load active crop & sow date
        try {
          const crops = JSON.parse(localStorage.getItem(`user_crops_${session.user.id}`) || '[]');
          if (Array.isArray(crops) && crops.length > 0) {
            let activeIndex = parseInt(localStorage.getItem(`active_crop_index_${session.user.id}`) || '0');
            if (isNaN(activeIndex) || activeIndex >= crops.length) activeIndex = 0;
            const cropObj = crops[activeIndex];
            const rawName = cropObj?.cropName || cropObj?.crop_name || '';
            const found = cropProcessData.find(c => c.crop_name && c.crop_name.toLowerCase().includes(rawName.toLowerCase()));
            if (found) setActiveCrop(found);

            if (cropObj?.sowDate || cropObj?.sow_date) {
              setSowDate(new Date(cropObj.sowDate || cropObj.sow_date));
            }
          }

          // Load task statuses and custom tasks
          const savedStatus = JSON.parse(localStorage.getItem(`calendar_status_${session.user.id}`) || '{}');
          setTaskStatusMap(savedStatus);

          const savedCustom = JSON.parse(localStorage.getItem(`calendar_custom_${session.user.id}`) || '[]');
          setCustomTasks(savedCustom);
        } catch (e) {
          console.error("Calendar init error", e);
        }
      }
    });
  }, []);

  if (!activeCrop) {
    // Fallback if not loaded yet
  }

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Days in month calculation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  // Adjust so Monday is 0 and Sunday is 6
  const startOffset = (firstDayOfWeek + 6) % 7;

  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  // Generate real calendar dates for the month
  const calendarCells = useMemo(() => {
    const cells = [];
    // Trailing days from previous month
    for (let i = startOffset - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const dateObj = new Date(currentYear, currentMonth - 1, dayNum);
      cells.push({ dayNum, isCurrentMonth: false, dateObj });
    }
    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(currentYear, currentMonth, d);
      cells.push({ dayNum: d, isCurrentMonth: true, dateObj });
    }
    // Leading days for next month to complete 35/42 grid
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let n = 1; n <= remaining; n++) {
      const dateObj = new Date(currentYear, currentMonth + 1, n);
      cells.push({ dayNum: n, isCurrentMonth: false, dateObj });
    }
    return cells;
  }, [currentYear, currentMonth, daysInMonth, startOffset, prevMonthDays]);

  // Generate all dynamic crop lifecycle tasks mapped to specific dates
  const generatedTasks = useMemo(() => {
    const tasks = [];
    const baseCrop = activeCrop || cropProcessData[0];
    let runningDays = 0;

    baseCrop.stages?.forEach((stage) => {
      stage.substeps?.forEach((sub, subIdx) => {
        const taskName = typeof sub === 'string' ? sub : sub.task || sub.substep || 'Field Task';
        const dayOffset = runningDays + Math.floor((subIdx / stage.substeps.length) * stage.duration_days);
        
        const taskDate = new Date(sowDate);
        taskDate.setDate(taskDate.getDate() + dayOffset);

        const dateStr = taskDate.toISOString().split('T')[0];
        const taskId = `task_${baseCrop.crop_name}_s${stage.stage_id}_${subIdx}_${dateStr}`;

        let category = 'Crop Task';
        if (stage.title.includes('Land') || stage.title.includes('Sow')) category = 'Preparation';
        else if (stage.title.includes('Fertilizer')) category = 'Fertilizer';
        else if (stage.title.includes('Water')) category = 'Irrigation';
        else if (stage.title.includes('Pest')) category = 'Pesticide';
        else if (stage.title.includes('Harvest')) category = 'Harvest';

        tasks.push({
          id: taskId,
          title: taskName,
          category,
          stageTitle: stage.title,
          dateStr,
          dateObj: taskDate,
          time: '08:00 AM – 10:00 AM',
          field: 'Field 1'
        });
      });
      runningDays += stage.duration_days;
    });

    // Merge custom tasks
    customTasks.forEach(ct => {
      tasks.push(ct);
    });

    return tasks;
  }, [activeCrop, sowDate, customTasks]);

  // Map tasks to dates and determine real status
  const tasksByDate = useMemo(() => {
    const map = {};
    const todayStr = todayDate.toISOString().split('T')[0];

    generatedTasks.forEach((t) => {
      const dStr = t.dateStr;
      if (!map[dStr]) map[dStr] = [];

      // Determine task status
      let status = taskStatusMap[t.id];
      if (!status) {
        if (dStr < todayStr) status = 'overdue';
        else if (dStr === todayStr) status = 'in_progress';
        else status = 'scheduled';
      }

      map[dStr].push({ ...t, status });
    });

    return map;
  }, [generatedTasks, taskStatusMap, todayDate]);

  // Overall Task Statistics
  const stats = useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    let scheduled = 0;
    let overdue = 0;

    Object.values(tasksByDate).forEach(arr => {
      arr.forEach(t => {
        if (t.status === 'completed') completed++;
        else if (t.status === 'in_progress') inProgress++;
        else if (t.status === 'overdue') overdue++;
        else scheduled++;
      });
    });

    return { completed, inProgress, scheduled, overdue };
  }, [tasksByDate]);

  // Tasks for currently selected date
  const selectedDateStr = selectedFullDate.toISOString().split('T')[0];
  const selectedDateTasks = tasksByDate[selectedDateStr] || [];

  // Overdue Tasks list
  const overdueTasksList = useMemo(() => {
    const list = [];
    Object.values(tasksByDate).forEach(arr => {
      arr.forEach(t => {
        if (t.status === 'overdue') list.push(t);
      });
    });
    return list;
  }, [tasksByDate]);

  const handleToggleTaskStatus = (taskId, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'scheduled' : 'completed';
    const updatedMap = { ...taskStatusMap, [taskId]: newStatus };
    setTaskStatusMap(updatedMap);
    if (session?.user?.id) {
      localStorage.setItem(`calendar_status_${session.user.id}`, JSON.stringify(updatedMap));
    }
  };

  const handleCreateCustomTask = () => {
    if (!newTaskTitle.trim()) return;
    const dateStr = selectedFullDate.toISOString().split('T')[0];
    const newObj = {
      id: `custom_${Date.now()}`,
      title: newTaskTitle,
      category: newTaskCategory,
      stageTitle: 'Custom Task',
      dateStr,
      dateObj: selectedFullDate,
      time: newTaskTime,
      field: newTaskField,
      status: 'scheduled'
    };

    const updatedCustom = [...customTasks, newObj];
    setCustomTasks(updatedCustom);
    if (session?.user?.id) {
      localStorage.setItem(`calendar_custom_${session.user.id}`, JSON.stringify(updatedCustom));
    }
    setNewTaskTitle('');
    setIsAddModalOpen(false);
  };

  const handlePrevMonthBtn = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonthBtn = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setViewDate(now);
    setSelectedFullDate(now);
  };

  const isSameDay = (d1, d2) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3, lg: 4 }, pb: { xs: 8, md: 10 }, bgcolor: '#F8FAFC', minHeight: '100vh', width: '100%' }}>
      
      {/* ── TOP HERO LANDSCAPE BANNER ───────────────────────────────────── */}
      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: '24px',
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: `linear-gradient(to right, rgba(236, 253, 245, 0.95), rgba(209, 250, 229, 0.85)), url('/assets/bg_abstract_green.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '1px solid #A7F3D0',
          boxShadow: '0 8px 24px rgba(5, 150, 105, 0.08)'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#0F172A', fontSize: { xs: '26px', md: '34px' }, mb: 0.8 }}>
              Farm Activity Calendar
            </Typography>
            <Typography variant="body1" sx={{ color: '#475569', fontSize: '15px', fontWeight: 500 }}>
              Stay updated with your farm activities and never miss an important task.
            </Typography>
          </Box>

          {/* Right Farmer Identity Cards */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Paper sx={{ p: '10px 16px', borderRadius: '16px', bgcolor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ p: 1, bgcolor: '#ECFDF5', borderRadius: '10px', color: '#059669', display: 'flex' }}>
                <Person sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '13px' }}>
                  {profile?.full_name || 'Netturi Hitheshsena Reddy'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                  Active Farmer
                </Typography>
              </Box>
            </Paper>

            <Paper sx={{ p: '10px 16px', borderRadius: '16px', bgcolor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ p: 1, bgcolor: '#ECFDF5', borderRadius: '10px', color: '#059669', display: 'flex' }}>
                <CalendarToday sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block' }}>Today's Date</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '13px' }}>
                  {todayDate.getDate()} {monthNames[todayDate.getMonth()].slice(0, 3)} {todayDate.getFullYear()} <span style={{ color: '#64748B', fontWeight: 500 }}>{todayDate.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Paper>

      {/* ── MAIN CONTENT ROW (REAL CALENDAR & DYNAMIC TASKS) ─────────────── */}
      <Grid container spacing={3} sx={{ mb: 4, alignItems: 'stretch' }}>
        
        {/* Left Side: Real Interactive Monthly Calendar Card */}
        <Grid size={{ xs: 12, sm: 7, md: 7, lg: 7 }} sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3, borderRadius: '24px', bgcolor: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            
            {/* Control Bar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton onClick={handlePrevMonthBtn} size="small" sx={{ border: '1px solid #E2E8F0', borderRadius: '10px' }}>
                  <ChevronLeft />
                </IconButton>
                <IconButton onClick={handleNextMonthBtn} size="small" sx={{ border: '1px solid #E2E8F0', borderRadius: '10px' }}>
                  <ChevronRight />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', ml: 1 }}>
                  {monthNames[currentMonth]} {currentYear}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setIsAddModalOpen(true)}
                  sx={{ bgcolor: '#059669', color: '#fff', fontWeight: 800, borderRadius: '12px', textTransform: 'none' }}
                >
                  Add Task
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CalendarToday sx={{ fontSize: 16 }} />}
                  onClick={handleJumpToToday}
                  sx={{ borderColor: '#A7F3D0', color: '#059669', bgcolor: '#ECFDF5', fontWeight: 800, borderRadius: '12px', textTransform: 'none' }}
                >
                  Today
                </Button>
              </Box>
            </Box>

            {/* Days Header */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', mb: 1.5 }}>
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d, i) => (
                <Typography key={i} variant="caption" sx={{ fontWeight: 800, color: '#64748B', fontSize: '11px' }}>
                  {d}
                </Typography>
              ))}
            </Box>

            {/* Real Dynamic Calendar Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, textAlign: 'center' }}>
              {calendarCells.map((cell, idx) => {
                const cellDateStr = cell.dateObj.toISOString().split('T')[0];
                const isSelected = isSameDay(cell.dateObj, selectedFullDate);
                const dayTasks = tasksByDate[cellDateStr] || [];

                return (
                  <Box
                    key={idx}
                    onClick={() => setSelectedFullDate(cell.dateObj)}
                    sx={{
                      p: 1,
                      height: 54,
                      borderTop: idx >= 7 ? '1px solid #F1F5F9' : 'none',
                      borderRadius: isSelected ? '14px' : '0px',
                      bgcolor: isSelected ? '#0D7F4B' : 'transparent',
                      color: isSelected ? '#FFFFFF' : cell.isCurrentMonth ? '#0F172A' : '#CBD5E1',
                      fontWeight: isSelected ? 900 : 700,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justify: 'center',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: isSelected ? '#0D7F4B' : '#F1F5F9',
                        borderRadius: '12px'
                      }
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: isSelected ? 900 : cell.isCurrentMonth ? 700 : 500, fontSize: '15px' }}>
                      {cell.dayNum}
                    </Typography>

                    {/* Dynamic Task Dot Indicators */}
                    <Box sx={{ display: 'flex', gap: 0.4, mt: 0.3 }}>
                      {dayTasks.slice(0, 3).map((t, tIdx) => {
                        let dotColor = '#F59E0B'; // Scheduled
                        if (t.status === 'completed') dotColor = '#10B981';
                        else if (t.status === 'in_progress') dotColor = '#8B5CF6';
                        else if (t.status === 'overdue') dotColor = '#EF4444';

                        return (
                          <Box
                            key={tIdx}
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor: isSelected ? '#FFFFFF' : dotColor
                            }}
                          />
                        );
                      })}
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* Bottom Legend */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 3, pt: 2, borderTop: '1px solid #F1F5F9' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981' }} />
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700 }}>Completed</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#8B5CF6' }} />
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700 }}>In Progress</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#F59E0B' }} />
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700 }}>Scheduled</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#EF4444' }} />
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700 }}>Overdue</Typography>
              </Box>
            </Box>

          </Paper>
        </Grid>

        {/* Right Side: Selected Date & Task Details */}
        <Grid size={{ xs: 12, sm: 5, md: 5, lg: 5 }} sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, flex: 1 }}>
            
            {/* Selected Date Header Card */}
            <Paper sx={{ p: 2.5, borderRadius: '20px', bgcolor: '#0D7F4B', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 0.8, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.4)', display: 'flex' }}>
                  <CalendarToday sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#A7F3D0', fontWeight: 600, display: 'block' }}>Selected Date</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '18px' }}>
                    {selectedFullDate.getDate()} {monthNames[selectedFullDate.getMonth()]}, {selectedFullDate.toLocaleDateString('en-US', { weekday: 'long' })}
                  </Typography>
                </Box>
              </Box>

              <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.2)', mx: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <WbSunny sx={{ color: '#FDE047', fontSize: 32 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>25°C</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 500 }}>Partly Cloudy</Typography>
                </Box>
              </Box>
            </Paper>
            {/* Activities on this Day */}
            <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3, borderRadius: '24px', bgcolor: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                  Activities on this Day
                </Typography>
                <Chip label={`${selectedDateTasks.length} Tasks`} size="small" sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700 }} />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                {selectedDateTasks.map((t) => {
                  const isDone = t.status === 'completed';
                  return (
                    <Box
                      key={t.id}
                      onClick={() => handleToggleTaskStatus(t.id, t.status)}
                      sx={{
                        p: 2,
                        borderRadius: '16px',
                        border: '1px solid #F1F5F9',
                        bgcolor: isDone ? '#F0FDF4' : '#F8FAFC',
                        display: 'flex',
                        justify: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Checkbox
                          checked={isDone}
                          onChange={() => handleToggleTaskStatus(t.id, t.status)}
                          sx={{ color: '#059669', '&.Mui-checked': { color: '#059669' } }}
                        />
                        <Box>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              fontWeight: 900, 
                              color: isDone ? '#166534' : '#0F172A',
                              fontSize: '14px',
                              textDecoration: isDone ? 'line-through' : 'none'
                            }}
                          >
                            {t.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                            {t.time} • {t.field || 'Field 1'}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip 
                        label={isDone ? 'Completed ✓' : t.status === 'in_progress' ? 'In Progress 🕒' : 'Scheduled'} 
                        size="small" 
                        sx={{ 
                          bgcolor: isDone ? '#DCFCE7' : t.status === 'in_progress' ? '#F3E8FF' : '#FEFCE8', 
                          color: isDone ? '#166534' : t.status === 'in_progress' ? '#7E22CE' : '#D97706', 
                          fontWeight: 800, 
                          fontSize: '11px' 
                        }} 
                      />
                    </Box>
                  );
                })}

                {selectedDateTasks.length === 0 && (
                  <Box sx={{ p: 3, display: 'flex', gap: 2, alignItems: 'center', bgcolor: '#F4FBF7', borderRadius: '16px', border: '1px solid #E8F5EE' }}>
                    <Box sx={{ p: 1.5, bgcolor: '#fff', borderRadius: '50%', display: 'flex', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                       <Spa sx={{ color: '#10B981', fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600 }}>
                        No specific task scheduled for this date.
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mt: 0.5 }}>
                        Click "+ Add Task" to schedule a custom farm activity.
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Paper>

            {/* Overdue Tasks Card */}
            <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: '#FFF5F5', border: '1px solid #FEE2E2' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#DC2626' }}>
                  Overdue Tasks
                </Typography>
                <Chip label={`${overdueTasksList.length} Overdue`} size="small" sx={{ bgcolor: '#FEE2E2', color: '#DC2626', fontWeight: 700 }} />
              </Box>

              {overdueTasksList.slice(0, showAllOverdue ? overdueTasksList.length : 2).map((ot) => (
                <Box 
                  key={ot.id} 
                  onClick={() => handleToggleTaskStatus(ot.id, ot.status)}
                  sx={{ p: 2, borderRadius: '16px', bgcolor: '#fff', border: '1px solid #FEE2E2', mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', '&:hover': { bgcolor: '#FEF2F2' } }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ p: 1, bgcolor: '#FEF2F2', borderRadius: '12px', color: '#DC2626', display: 'flex' }}>
                      <Warning sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '14px' }}>
                        {ot.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#DC2626', fontWeight: 600, display: 'block' }}>
                        Was due on {ot.dateStr}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip label="Mark Done" size="small" sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 700, fontSize: '11px', cursor: 'pointer' }} />
                </Box>
              ))}

              {overdueTasksList.length === 0 ? (
                <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700, display: 'block', textAlign: 'center' }}>
                  ✓ All past tasks are up to date! No overdue items.
                </Typography>
              ) : !showAllOverdue && overdueTasksList.length > 2 ? (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Typography onClick={() => setShowAllOverdue(true)} variant="caption" sx={{ color: '#DC2626', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    View all overdue tasks <ArrowForward sx={{ fontSize: 14 }} />
                  </Typography>
                </Box>
              ) : showAllOverdue && overdueTasksList.length > 2 ? (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Typography onClick={() => setShowAllOverdue(false)} variant="caption" sx={{ color: '#DC2626', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    Show less
                  </Typography>
                </Box>
              ) : null}
            </Paper>

          </Box>
        </Grid>

      </Grid>

      {/* ── 3. BOTTOM SUMMARY ROW (REAL DYNAMIC STATS CARDS) ─────────────── */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper sx={{ p: 2, borderRadius: '20px', bgcolor: '#fff', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { borderColor: '#10B981', boxShadow: '0 4px 12px rgba(16,185,129,0.1)' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: '#ECFDF5', borderRadius: '16px', color: '#10B981', display: 'flex' }}>
                <CheckCircle sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block' }}>Completed</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>{stats.completed} <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 600 }}>Tasks</span></Typography>
              </Box>
            </Box>
            <ChevronRight sx={{ color: '#CBD5E1', fontSize: 20 }} />
          </Paper>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper sx={{ p: 2, borderRadius: '20px', bgcolor: '#fff', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { borderColor: '#8B5CF6', boxShadow: '0 4px 12px rgba(139,92,246,0.1)' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: '#F3E8FF', borderRadius: '16px', color: '#8B5CF6', display: 'flex' }}>
                <AccessTime sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block' }}>In Progress</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>{stats.inProgress} <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 600 }}>Tasks</span></Typography>
              </Box>
            </Box>
            <ChevronRight sx={{ color: '#CBD5E1', fontSize: 20 }} />
          </Paper>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper sx={{ p: 2, borderRadius: '20px', bgcolor: '#fff', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { borderColor: '#F59E0B', boxShadow: '0 4px 12px rgba(245,158,11,0.1)' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: '#FFFBEB', borderRadius: '16px', color: '#F59E0B', display: 'flex' }}>
                <Event sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block' }}>Scheduled</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>{stats.scheduled} <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 600 }}>Tasks</span></Typography>
              </Box>
            </Box>
            <ChevronRight sx={{ color: '#CBD5E1', fontSize: 20 }} />
          </Paper>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper sx={{ p: 2, borderRadius: '20px', bgcolor: '#fff', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { borderColor: '#EF4444', boxShadow: '0 4px 12px rgba(239,68,68,0.1)' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: '#FEF2F2', borderRadius: '16px', color: '#EF4444', display: 'flex' }}>
                <Warning sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block' }}>Overdue</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>{stats.overdue} <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 600 }}>Tasks</span></Typography>
              </Box>
            </Box>
            <ChevronRight sx={{ color: '#CBD5E1', fontSize: 20 }} />
          </Paper>
        </Grid>
      </Grid>

      {/* ── MODAL TO ADD CUSTOM TASK ────────────────────────────────────── */}
      <Dialog open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 900, color: '#0F172A' }}>Add Custom Farm Task</DialogTitle>
        <DialogContent>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block', mb: 2 }}>
            Selected Date: {selectedFullDate.toISOString().split('T')[0]}
          </Typography>
          <TextField
            fullWidth
            label="Task Description"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={newTaskCategory}
              onChange={(e) => setNewTaskCategory(e.target.value)}
              label="Category"
            >
              <MenuItem value="Irrigation">Irrigation</MenuItem>
              <MenuItem value="Fertilizer">Fertilizer Application</MenuItem>
              <MenuItem value="Pesticide">Pesticide Spray</MenuItem>
              <MenuItem value="Harvest">Harvesting</MenuItem>
              <MenuItem value="General">General Maintenance</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Field / Location"
            value={newTaskField}
            onChange={(e) => setNewTaskField(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsAddModalOpen(false)} sx={{ color: '#64748B', fontWeight: 700 }}>
            Cancel
          </Button>
          <Button onClick={handleCreateCustomTask} variant="contained" sx={{ bgcolor: '#059669', fontWeight: 800 }}>
            Add Task
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default FarmCalendar;
