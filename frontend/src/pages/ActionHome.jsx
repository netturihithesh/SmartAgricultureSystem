import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import cropProcessData from '../data/crop_process.json';
import cropDataList from '../data/crop_data.json';
import AgriBot from '../components/AgriBot';
import PestDetectionCard from '../components/PestDetectionCard';
import { getDailyQuote, generateStageSchedule } from '../services/aiService';
import './ActionHome.css';

const ActionHome = ({ session }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // NEW MULTI-CROP STATE
  const [userCrops, setUserCrops] = useState([]);
  const [activeCropIndex, setActiveCropIndex] = useState(0);
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
  const [binModalOpen, setBinModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ open: false, message: '', type: 'info' });

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
        if (stage.end_day >= diffDays) {
          const stepInterval = Math.max(1, Math.floor(stage.duration_days / Math.max(1, stage.substeps.length)));
          for (let i = 0; i < stage.substeps.length; i++) {
             let targetAbsoluteDay = stage.start_day + (i * stepInterval);
             if (targetAbsoluteDay > diffDays) {
                 let daysFromNow = targetAbsoluteDay - diffDays;
                 let label = `Day ${targetAbsoluteDay}`;
                 if (daysFromNow === 1) label = 'Tomorrow';
                 else if (daysFromNow <= 7) label = `In ${daysFromNow} days`;
                 
                 tasks.push({ day: label, task: stage.substeps[i] });
             }
          }
        }
      }
      if (tasks.length === 0 && updatedCrop.total_duration_days > diffDays) {
        tasks.push({ day: 'Regular', task: 'Monitor soil health and water needs' });
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
      setAlertConfig({ open: true, message: 'You cannot restore this crop. You already have the maximum of two active crops.', type: 'warning' });
      return;
    }
    const bin = JSON.parse(localStorage.getItem(`binned_crops_${session.user.id}`) || '[]');
    const cropToRestore = bin.find(c => c.id === binnedId);
    if (!cropToRestore) return;
    
    const deletedDate = new Date(cropToRestore.deletedAt);
    const daysInBin = (new Date() - deletedDate) / (1000 * 60 * 60 * 24);
    if (daysInBin > 3) {
      setAlertConfig({ open: true, message: 'This crop has been in the bin for more than 3 days and cannot be restored.', type: 'error' });
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
    return <div style={{display:'flex', height:'100vh', justifyContent:'center', alignItems:'center', background:'#0A0D0B', color:'#39FF6A'}}>Loading Dashboard...</div>;
  }

  return (
    <div className="antigravity-dashboard">
      <div className="neo-card daily-word-card" style={{ marginBottom: '24px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--neon-green-dim)' }}>
        <div style={{ padding: '12px', background: 'var(--neon-green-dim)', borderRadius: '12px', color: 'var(--neon-green)', display: 'flex' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--neon-green)', letterSpacing: '1px', marginBottom: '4px' }}>DAILY WORD</div>
          <div style={{ fontSize: '15px', color: 'var(--text-main)', lineHeight: 1.5, fontWeight: 500 }}>
            {dailyQuote || 'The ultimate goal of farming is not the growing of crops, but the cultivation and perfection of human beings.'}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        
        {/* LEFT COLUMN */}
        <div className="left-column">
          
          {/* HERO CARD */}
          <div className="neo-card hero-card">
            <div className="hero-glow"></div>
            <div className="hero-header">
              <h1>Hi, {profile?.full_name || 'Hitheshsena'}</h1>
              <svg className="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 22l10-4 10 4L12 2z"/></svg>
            </div>
            <div className="hero-sub">ACTIVE FARMER</div>
            <h2 className="hero-crop-title">{selectedCrop ? selectedCrop.crop_name : 'No Active Crop'}</h2>
            
            {selectedCrop && (
              <div className="hero-pill">{currentStage?.title || 'Initialization'}</div>
            )}
            
            {selectedCrop && (
              <div className="hero-stats-grid">
                <div>
                  <div className="stat-label">EXPECTED HARVEST</div>
                  <div className="stat-value">{new Date(new Date(cropStartDate).getTime() + selectedCrop.total_duration_days * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                <div>
                  <div className="stat-label">CURRENT STAGE</div>
                  <div className="stat-value">{currentStage?.stage_id || 1} of {selectedCrop.stages.length} Stages</div>
                </div>
                <div>
                  <div className="stat-label">TOTAL DAYS</div>
                  <div className="stat-value">Day {daysPassed} / {selectedCrop.total_duration_days}</div>
                </div>
              </div>
            )}
            
            <div className="hero-actions">
              {selectedCrop ? (
                <>
                  <button className="btn-outline" onClick={() => navigate('/dashboard/calendar')}>View Full Journey</button>
                  {userCrops.length === 2 ? (
                     <button className="btn-filled" onClick={handleSwapCrop}>Swap Crop</button>
                  ) : (
                     <button className="btn-filled" onClick={() => navigate('/add-crop')}>+ Add 2nd Crop</button>
                  )}
                  <button className="btn-outline" onClick={requestDelete} style={{borderColor: 'var(--danger-red)', color: 'var(--danger-red)', padding: '10px'}} title="Move to Trash">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </>
              ) : (
                <button className="btn-filled" onClick={() => navigate('/add-crop')}>+ Add Crop</button>
              )}
            </div>

            {selectedCrop && (
              <div className="progress-container">
                <svg className="progress-ring" width="140" height="140" viewBox="0 0 140 140">
                  <circle className="progress-bg" cx="70" cy="70" r="60"></circle>
                  <circle className="progress-fill" cx="70" cy="70" r="60" style={{strokeDasharray: 377, strokeDashoffset: 377 * (1 - progressPercentage / 100)}}></circle>
                </svg>
                <div className="progress-text">
                  <div className="progress-value" style={{color: 'var(--neon-green)'}}>{progressPercentage}%</div>
                  <div className="progress-sub">Day {daysPassed}/{selectedCrop.total_duration_days}</div>
                </div>
              </div>
            )}
            
            {/* IN-CARD RECYCLE BIN */}
            <button 
               onClick={() => setBinModalOpen(true)}
               style={{ position: 'absolute', bottom: '24px', right: '24px', display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-sub)', padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s ease', fontSize: '13px', fontWeight: 600, zIndex: 10 }}
               onMouseOver={(e) => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
               onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-sub)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'transparent'; }}
               title="Open Recycle Bin to restore deleted crops"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
              Recycle Bin
            </button>
          </div>

          {/* TODAY'S WORK CARD */}
          {selectedCrop && currentStage && (
            <div className="neo-card" style={{padding: 0}}>
              <div style={{padding: '24px'}}>
                <div className="section-title-wrap">
                  <div>
                    <h3 className="section-title">Today's Work</h3>
                    <div className="section-sub">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  </div>
                  <div className="day-pill">Day {daysPassed}</div>
                </div>
              </div>
              
              <div className="task-list">
                {(() => {
                  const stepInterval = Math.max(1, Math.floor(currentStage.duration_days / Math.max(1, currentStage.substeps.length)));
                  const relativeDayInStage = daysPassed - currentStage.start_day + 1;
                  
                  const sortedSubsteps = currentStage.substeps.map((sub, i) => {
                    let ai = null;
                    if (dynamicSchedule && Array.isArray(dynamicSchedule)) ai = dynamicSchedule.find(s => s.task === sub);
                    return { sub, i, ai, targetDay: ai ? ai.relative_day : (i * stepInterval) + 1 };
                  }).sort((a, b) => a.targetDay - b.targetDay);
                  
                  // Filter to only show tasks scheduled for today, or past-due tasks not yet checked off
                  const todaysTasks = sortedSubsteps.filter(item => {
                    const isChecked = substepStatus[`${currentStage.stage_id}_${item.i}`];
                    return item.targetDay === relativeDayInStage || (item.targetDay < relativeDayInStage && !isChecked);
                  });

                  if (todaysTasks.length === 0) {
                     return (
                       <div style={{padding: '32px 24px', textAlign: 'center', color: 'var(--text-sub)'}}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginBottom:'12px', color:'var(--neon-green)'}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                          <div style={{fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px'}}>No Special Tasks Scheduled For Today</div>
                          <div style={{fontSize: '13px'}}>Keep up with your regular crop maintenance and standard watering schedule!</div>
                       </div>
                     );
                  }
                  
                  return todaysTasks.map((item, idx) => {
                    const isChecked = substepStatus[`${currentStage.stage_id}_${item.i}`];
                    const isActive = !isChecked && idx === 0; // Top uncompleted task is active focus
                    
                    return (
                      <div key={idx} className={`task-item ${isActive ? 'active' : ''}`} style={{opacity: isChecked ? 0.4 : 1}}>
                        <div className="task-left">
                          <div className={`task-checkbox ${isChecked ? 'checked' : ''}`} onClick={() => toggleSubstep(currentStage.stage_id, item.i)}>
                             {isChecked && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0A0D0B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                          </div>
                          <div className="task-content">
                            <h4 style={{textDecoration: isChecked ? 'line-through' : 'none'}}>
                              {item.sub} 
                              {isActive && <span className="high-badge">URGENT</span>}
                            </h4>
                            {isActive && item.ai && (
                              <>
                                <div className="task-desc">{item.ai.reason}</div>
                                <div className="sys-rec">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/></svg>
                                  System Recommendation
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="task-right">
                          <div className="task-day">Day {item.targetDay} of {currentStage.duration_days}</div>
                          {isActive && <div className="task-timing">Optimal timing</div>}
                          {item.targetDay < relativeDayInStage && !isChecked && <div className="task-timing" style={{color: 'var(--danger-red)'}}>Past Due</div>}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* PEST DETECTION CARD */}
          {selectedCrop && <PestDetectionCard />}

          {/* CROP JOURNEY */}
          {selectedCrop && (
            <div className="neo-card">
               <h3 className="section-title" style={{marginBottom: '32px'}}>Crop Journey</h3>
               
               <div className="pipeline-wrap">
                 <div className="pipeline-line"></div>
                 {selectedCrop.stages.map((stage, idx) => {
                    const status = stage.stage_id < currentStage?.stage_id ? 'done' : (stage.stage_id === currentStage?.stage_id ? 'active' : 'pending');
                    return (
                      <div key={idx} className="pipeline-node-wrap" onClick={() => setExpandedStage(stage.stage_id)} style={{cursor: 'pointer'}}>
                        <div className={`p-node ${status}`}>
                          {status === 'done' ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          ) : stage.stage_id}
                        </div>
                        <div className="p-label" style={{maxWidth: '60px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: status==='active'?'var(--neon-green)':''}}>{stage.title}</div>
                      </div>
                    )
                 })}
               </div>

               {(() => {
                 const activePanelStage = selectedCrop.stages.find(s => s.stage_id === (expandedStage || currentStage?.stage_id)) || currentStage;
                 if (!activePanelStage) return null;
                 const sStatus = activePanelStage.stage_id < currentStage?.stage_id ? 'completed' : (activePanelStage.stage_id === currentStage?.stage_id ? 'active' : 'upcoming');
                 const sDays = (sStatus === 'active') ? Math.min(daysPassed - activePanelStage.start_day + 1, activePanelStage.duration_days) : (sStatus === 'completed' ? activePanelStage.duration_days : 0);
                 let sPercent = Math.round((sDays / activePanelStage.duration_days) * 100);
                 if (activePanelStage.duration_days === 0) sPercent = 100;

                 return (
                   <div className="stage-active-box">
                     <div className="stage-active-header">
                       <h3>{activePanelStage.title} {sStatus === 'active' ? '— In Progress' : ''}</h3>
                       <span>Day {activePanelStage.start_day} → Day {activePanelStage.end_day}</span>
                     </div>
                     <div className="stage-bar-wrap">
                       <div className="stage-bar-fill" style={{width: `${sPercent}%`, background: sStatus === 'completed' ? 'var(--text-sub)' : 'var(--neon-green)'}}></div>
                     </div>
                     <div style={{padding: '16px'}}>
                       <div style={{fontSize: '11px', color: 'var(--text-sub)', marginBottom: '16px'}}>
                         {sPercent}% of stage complete
                       </div>
                       
                       <div className="sb-task-list">
                          {activePanelStage.substeps.map((sub, i) => {
                            let ai = null;
                            if (dynamicSchedule && Array.isArray(dynamicSchedule)) ai = dynamicSchedule.find(s => s.task === sub);
                            
                            const stepInterval = Math.max(1, Math.floor(activePanelStage.duration_days / Math.max(1, activePanelStage.substeps.length)));
                            const targetDay = ai ? ai.relative_day : (i * stepInterval) + 1;
                            
                            const isChecked = sStatus === 'completed' || substepStatus[`${activePanelStage.stage_id}_${i}`];
                            return (
                              <div key={i} className="task-item" style={{borderBottom: 'none', padding: '4px 0', opacity: isChecked ? 0.3 : 1}}>
                                <div className="task-left">
                                  <div className={`task-checkbox ${isChecked ? 'checked' : ''}`} style={{width: '16px', height: '16px', cursor: 'default'}}>
                                    {isChecked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0A0D0B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{marginTop:'-2px'}}><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                  </div>
                                  <div className="task-content">
                                    <h4 style={{fontSize: '13px', margin: 0, textDecoration: isChecked?'line-through':'none'}}>{sub}</h4>
                                  </div>
                                </div>
                                <div className="task-right"><div className="task-day">Day {targetDay}/{activePanelStage.duration_days}</div></div>
                              </div>
                            );
                          })}
                       </div>
                     </div>
                   </div>
                 );
               })()}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN */}
        <div className="right-column">
          
          {/* WEATHER CENTER */}
          <div className="neo-card">
            <div className="weather-header">
              <div>
                <h3>Weather Center</h3>
                <p>{profile?.location || 'Hyderabad, TG'}</p>
              </div>
              <div className="live-badge">
                <div className="live-dot"></div> Live
              </div>
            </div>
            
            <div className="weather-grid-4">
              <div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{color: 'var(--text-sub)'}}><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>
                <div className="w-stat-val">28°C</div>
                <div className="w-stat-lbl">TEMP</div>
              </div>
              <div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{color: 'var(--text-sub)'}}><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                <div className="w-stat-val">72%</div>
                <div className="w-stat-lbl">HUMID</div>
              </div>
              <div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{color: 'var(--text-sub)'}}><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>
                <div className="w-stat-val">12</div>
                <div className="w-stat-lbl">WIND</div>
              </div>
              <div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{color: 'var(--text-sub)'}}><path d="M23 12a11.05 11.05 0 0 0-22 0zm-5 7a3 3 0 0 1-6 0v-7"/></svg>
                <div className="w-stat-val">10%</div>
                <div className="w-stat-lbl">RAIN</div>
              </div>
            </div>

            <div className="forecast-grid">
              <div className="f-day">
                Mon<br/>
                <svg width="16" height="16" style={{margin: '8px 0', color: 'var(--text-sub)'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
                <br/><span className="f-val">29°C</span>
              </div>
              <div className="f-day">
                Tue<br/>
                <svg width="16" height="16" style={{margin: '8px 0', color: 'var(--warning-yellow)'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                <br/><span className="f-val">31°C</span>
              </div>
              <div className="f-day">
                Wed<br/>
                <svg width="16" height="16" style={{margin: '8px 0', color: 'var(--text-sub)'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
                <br/><span className="f-val">26°C</span>
              </div>
            </div>

          </div>

          {/* PROFIT SNAPSHOT */}
          {selectedCrop && (
            <div className="neo-card profit-snapshot">
              <h3>Profit Snapshot</h3>
              <div className="profit-sub">{selectedCrop.crop_name}</div>
              
              <div className="profit-label">EXPECTED PROFIT</div>
              <div className="profit-value">₹{cropEconomics?.profit_per_acre ? (cropEconomics.profit_per_acre * (profile?.land_size ? parseFloat(profile.land_size) : 2.5)).toLocaleString('en-IN') : '2,68,000'}</div>

              <div className="profit-metrics">
                <div className="pm-box">
                  <div className="pm-label">EST. YIELD</div>
                  <div className="pm-val">{cropEconomics?.yield_qtl_per_acre ? (cropEconomics.yield_qtl_per_acre * (profile?.land_size ? parseFloat(profile.land_size) : 2.5)).toFixed(0) : '200'} q</div>
                </div>
                <div className="pm-box">
                  <div className="pm-label">MKT PRICE</div>
                  <div className="pm-val">₹{cropEconomics?.market_price ? cropEconomics.market_price.toLocaleString('en-IN') : '2,300'}/q</div>
                </div>
                <div className="pm-box">
                  <div className="pm-label">MONTHLY</div>
                  <div className="pm-val">₹{cropEconomics?.profit_per_acre ? Math.round((cropEconomics.profit_per_acre * (profile?.land_size ? parseFloat(profile.land_size) : 2.5)) / (selectedCrop.total_duration_days/30)).toLocaleString('en-IN') : '44,667'}</div>
                </div>
              </div>
            </div>
          )}

          {/* UPCOMING TASKS */}
          <div className="neo-card">
            <h3 className="section-title" style={{marginBottom: '20px'}}>Upcoming Tasks</h3>
            <div className="sb-task-list">
               {upcomingTasks.length > 0 ? upcomingTasks.map((t, idx) => (
                 <div key={idx} className="sb-task">
                   <div className="sb-task-left">
                     <span className={`sb-pill ${idx===0?'amber':(idx===1?'red':'green')}`}>{t.day}</span>
                     <span className="sb-title" style={{fontSize: '11px'}}>{t.task}</span>
                   </div>
                 </div>
               )) : (
                 <>
                   <div className="sb-task">
                     <div className="sb-task-left">
                       <span className="sb-pill amber">Day 58</span>
                       <span className="sb-title">Start Water Management</span>
                     </div>
                     <div className="sb-time">+15 days</div>
                   </div>
                   <div className="sb-task">
                     <div className="sb-task-left">
                       <span className="sb-pill red">Day 98</span>
                       <span className="sb-title">Start Pest & Disease Control</span>
                     </div>
                     <div className="sb-time">+55 days</div>
                   </div>
                   <div className="sb-task">
                     <div className="sb-task-left">
                       <span className="sb-pill green">Day 118</span>
                       <span className="sb-title">Start Harvesting</span>
                     </div>
                     <div className="sb-time">+75 days</div>
                   </div>
                 </>
               )}
            </div>
          </div>

        </div>
      </div>


      {/* BIN MODAL */}
      {binModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(10, 13, 11, 0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="neo-card" style={{ width: '90%', maxWidth: '450px', margin: 0, padding: '24px' }}>
             <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: 'var(--text-main)' }}>Recycle Bin</h3>
             <div className="custom-scroll" style={{maxHeight:'300px', overflowY:'auto', paddingRight:'16px'}}>
               {(() => {
                  let binnedCrops = JSON.parse(localStorage.getItem(`binned_crops_${session?.user?.id}`) || '[]');
                  
                  // Auto-delete crops in the bin older than 3 days
                  const validCrops = binnedCrops.filter(c => {
                    const daysInBin = (new Date() - new Date(c.deletedAt)) / (1000 * 60 * 60 * 24);
                    return daysInBin <= 3;
                  });

                  if (validCrops.length !== binnedCrops.length) {
                    localStorage.setItem(`binned_crops_${session?.user?.id}`, JSON.stringify(validCrops));
                    binnedCrops = validCrops;
                  }

                  if (binnedCrops.length === 0) return <p style={{color: 'var(--text-sub)', fontSize: '14px', margin: '20px 0'}}>No items in bin.</p>;
                  return binnedCrops.map((crop, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--card-border)' }}>
                       <div>
                         <div style={{fontWeight: 700, fontSize: '15px'}}>{crop.cropName}</div>
                         <div style={{fontSize: '12px', color: 'var(--text-sub)', marginTop: '4px'}}>Deleted: {new Date(crop.deletedAt).toLocaleDateString()}</div>
                       </div>
                       <button onClick={() => handleRestoreFromBin(crop.id)} style={{ background: 'var(--neon-green)', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>Restore</button>
                    </div>
                  ));
               })()}
             </div>
             <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button onClick={() => setBinModalOpen(false)} style={{ background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--card-border)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Close</button>
             </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteConfirmOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(10, 13, 11, 0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="neo-card" style={{ width: '90%', maxWidth: '400px', margin: 0, padding: '24px' }}>
             <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: 'var(--danger-red)' }}>Move to Trash?</h3>
             <p style={{ color: 'var(--text-sub)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
               This will move <strong>{selectedCrop?.crop_name}</strong> to the recycle bin. Crops are permanently deleted after 3 days. Are you sure you want to proceed?
             </p>
             <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setDeleteConfirmOpen(false)} style={{ background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--card-border)', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button onClick={handleConfirmDelete} style={{ background: 'var(--danger-red)', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Yes, Trash it</button>
             </div>
          </div>
        </div>
      )}

      {/* CUSTOM ALERT MODAL */}
      {alertConfig.open && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(10, 13, 11, 0.8)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="neo-card" style={{ width: '90%', maxWidth: '400px', margin: 0, padding: '24px', border: `1px solid ${alertConfig.type === 'error' ? 'var(--danger-red)' : 'var(--warning-yellow)'}` }}>
             <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: alertConfig.type === 'error' ? 'var(--danger-red)' : 'var(--warning-yellow)' }}>
               {alertConfig.type === 'error' ? 'Cannot Restore' : 'Restore Notice'}
             </h3>
             <p style={{ color: 'var(--text-main)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
               {alertConfig.message}
             </p>
             <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setAlertConfig({ ...alertConfig, open: false })} style={{ background: alertConfig.type === 'error' ? 'var(--danger-red)' : 'var(--warning-yellow)', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>Understood</button>
             </div>
          </div>
        </div>
      )}

      {/* FLOATING AGRIBOT */}
      <AgriBot />
    </div>
  );
};

export default ActionHome;
