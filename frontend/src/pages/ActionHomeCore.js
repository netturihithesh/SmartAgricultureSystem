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
  Delete, Restore, DeleteSweep, SwapHoriz, Sync, CircleOutlined
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import cropProcessData from '../data/crop_process.json';
import cropDataList from '../data/crop_data.json';
import AgriBot from '../components/AgriBot';
import { getDailyQuote, generateStageSchedule } from '../services/aiService';
import { calculateProfitSnapshot } from '../services/profitUtils';

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
  const [cropEconomics, setCropEconomics] = useState(null);
  const [upcomingTasks, setUpcomingTasks] = useState([]);

  const [expandedStage, setExpandedStage] = useState(null);
  const [substepStatus, setSubstepStatus] = useState({});
  const [dynamicSchedule, setDynamicSchedule] = useState(null);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      setSubstepStatus(JSON.parse(localStorage.getItem(`substeps_${session.user.id}`) || '{}'));
    }
  }, [session]);

  const toggleSubstep = (stageId, index) => {
    setSubstepStatus(prev => {
      const key = `${stageId}_${index}`;
      const newStat = { ...prev, [key]: !prev[key] };
      if (session?.user?.id) {
        localStorage.setItem(`substeps_${session.user.id}`, JSON.stringify(newStat));
      }
      return newStat;
    });
  };

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
    const crop = cropProcessData.find(c => c.crop_name === cropObj.cropName);
    if (crop) {
      const start = new Date(cropObj.startDate);
      const today = new Date();
      const diffTime = today.getTime() - start.getTime();
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      let currentDay = 1;
      const stagesWithDays = crop.stages.map(stage => {
        const start_day = currentDay;
        const end_day = currentDay + stage.duration_days - 1;
        currentDay = end_day + 1;
        return { ...stage, start_day, end_day };
      });
      const updatedCrop = { ...crop, stages: stagesWithDays };

      setSelectedCrop(updatedCrop);
      setCropStartDate(start);
      setDaysPassed(diffDays);

      const currentStage = calculateCurrentStage(stagesWithDays, diffDays);
      setExpandedStage(currentStage?.stage_id);

      const cd = cropDataList.find(c => c.api_name === cropObj.cropName || c.name === cropObj.cropName);
      if (cd && cd.economics) {
        setCropEconomics(cd.economics);
      } else {
        setCropEconomics(null);
      }

      let tasks = [];
      for (const stage of stagesWithDays) {
        if (stage.start_day > diffDays) {
          const daysFromNow = stage.start_day - diffDays;
          let label = `Day ${stage.start_day}`;
          if (daysFromNow === 1) label = 'Tomorrow';
          else if (daysFromNow <= 7) label = `In ${daysFromNow} days`;
          
          tasks.push({
            day: label,
            task: `Start ${stage.title}`,
            icon: <CalendarMonth />
          });
        }
      }
      // Add a default watering task if not enough tasks
      if (tasks.length === 0 && updatedCrop.total_duration_days > diffDays) {
        tasks.push({ day: 'Every 3 days', task: 'Check soil moisture', icon: <WaterDrop /> });
      }
      setUpcomingTasks(tasks.slice(0, 3));
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

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!selectedCrop) return;
      // Load schedule for whichever stage is currently expanded in the panel
      const targetStage = selectedCrop.stages.find(s => s.stage_id === (expandedStage || currentStage?.stage_id)) || currentStage;
      if (!targetStage) return;
      const stageKey = `stage_schedule_v3_${selectedCrop.crop_name}_${targetStage.stage_id}`;
      const cached = localStorage.getItem(stageKey);
      if (cached) {
        setDynamicSchedule(JSON.parse(cached));
      } else {
        setIsGeneratingSchedule(true);
        const schedule = await generateStageSchedule(selectedCrop.crop_name, targetStage.title, targetStage.duration_days, targetStage.substeps);
        if (schedule && Array.isArray(schedule)) {
          localStorage.setItem(stageKey, JSON.stringify(schedule));
          setDynamicSchedule(schedule);
        } else {
          setDynamicSchedule(null);
        }
        setIsGeneratingSchedule(false);
      }
    };
    fetchSchedule();
  }, [selectedCrop, expandedStage, currentStage]);

  const progressPercentage = useMemo(() => {
    if (!selectedCrop) return 0;
    return Math.min(100, Math.round((daysPassed / selectedCrop.total_duration_days) * 100));
  }, [selectedCrop, daysPassed]);

  if (loading) {
  