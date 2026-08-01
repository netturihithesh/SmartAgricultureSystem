import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import cropProcessData from '../data/crop_process.json';
import cropDataList from '../data/crop_data.json';
import AgriBot from '../components/AgriBot';
import CropCalendarCard from '../components/CropCalendarCard';
import { getDailyQuote, generateStageSchedule } from '../services/aiService';
import { fetchWeatherAndAlerts } from '../services/weatherService';
import { calculateProfitSnapshot } from '../services/profitUtils';
import './ActionHome.css';

const adjustStageRanges = (crop) => {
  if (!crop || !crop.stages) return crop;

  // Convert substeps to objects and extract explicit task day numbers
  const tempStages = crop.stages.map((stage) => {
    const substeps = (stage.substeps || []).map((sub) =>
      sub && typeof sub === 'object' ? sub : { task: sub, day: null }
    );
    const taskDays = substeps
      .map((s) => s.day)
      .filter((d) => typeof d === 'number' && !isNaN(d));

    return {
      ...stage,
      substeps,
      start_day: taskDays.length > 0 ? Math.min(...taskDays) : null,
      end_day: taskDays.length > 0 ? Math.max(...taskDays) : null,
      _hasTaskDays: taskDays.length > 0,
    };
  });

  // For stages with no explicit task days, place them sequentially after the previous stage
  let cursor = 1;
  for (let i = 0; i < tempStages.length; i++) {
    const s = tempStages[i];
    if (s._hasTaskDays) {
      // Use actual task days — just advance cursor
      cursor = s.end_day + 1;
    } else {
      // No task days — allocate by duration after previous stage
      s.start_day = cursor;
      s.end_day = cursor + (s.duration_days || 1) - 1;
      cursor = s.end_day + 1;
    }
  }

  // Clamp all stages to the crop's total duration
  const total = crop.total_duration_days;
  if (total) {
    for (const s of tempStages) {
      if (s.start_day > total) s.start_day = total;
      if (s.end_day > total) s.end_day = total;
    }
  }

  return { ...crop, stages: tempStages };
};



// Compass helper to get wind direction
const getWindDirection = (deg) => {
  if (deg === undefined || deg === null) return { arrow: '↗', name: 'North-East' };
  const d = Math.round(deg / 45) % 8;
  const directions = [
    { arrow: '↑', name: 'North' },
    { arrow: '↗', name: 'North-East' },
    { arrow: '→', name: 'East' },
    { arrow: '↘', name: 'South-East' },
    { arrow: '↓', name: 'South' },
    { arrow: '↙', name: 'South-West' },
    { arrow: '←', name: 'West' },
    { arrow: '↖', name: 'North-West' }
  ];
  return directions[d];
};

// Season helper based on calendar month
const getCurrentSeason = () => {
  const month = new Date().getMonth(); // 0-indexed
  if (month >= 5 && month <= 8) return 'monsoon';
  if (month >= 9 && month <= 10) return 'harvest';
  if (month >= 11 || month <= 1) return 'winter';
  return 'summer';
};

// Hour formatter for forecast times
const formatForecastHour = (dt) => {
  if (!dt) return '--';
  const d = new Date(dt * 1000);
  let hrs = d.getHours();
  const ampm = hrs >= 12 ? 'PM' : 'AM';
  hrs = hrs % 12;
  hrs = hrs ? hrs : 12;
  return `${hrs} ${ampm}`;
};

// Vector SVG selector for weather forecast conditions (replaces font emojis for neat visual uniformity)
const getForecastIcon = (main, speed, dt) => {
  const speedKmh = speed ? Math.round(speed * 3.6) : 0;
  if (main === 'Thunderstorm') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 8.58"></path>
        <path d="m13 11-4 6h6l-4 6"></path>
      </svg>
    );
  }
  if (main === 'Rain' || main === 'Drizzle') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
        <path d="M16 14v6M8 14v6M12 16v6"></path>
      </svg>
    );
  }
  if (speedKmh > 20) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path>
      </svg>
    );
  }
  if (main === 'Clear') {
    let isNightTime = false;
    if (dt) {
      const hr = new Date(dt * 1000).getHours();
      if (hr < 6 || hr >= 19) isNightTime = true;
    }
    if (isNightTime) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
        </svg>
      );
    }
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4"></circle>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
      </svg>
    );
  }
  // Default is Clouds
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.42-3.87-3.13-7-7-7C5.17 4 2 7.17 2 11c0 3.79 3.06 6.5 6.5 6.5"></path>
      <path d="M8.5 17.5h9"></path>
    </svg>
  );
};

// Procedural Web Audio API weather sound synthesiser
let audioCtx = null;
let noiseNode = null;
let filterNode = null;
let gainNode = null;
let soundInterval = null;

const playThunder = () => {
  if (!audioCtx || audioCtx.state === 'suspended') return;
  try {
    const osc = audioCtx.createOscillator();
    const thunderGain = audioCtx.createGain();
    const thunderFilter = audioCtx.createBiquadFilter();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(40, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(15, audioCtx.currentTime + 3.5);
    
    thunderFilter.type = 'lowpass';
    thunderFilter.frequency.setValueAtTime(75, audioCtx.currentTime);
    thunderFilter.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 3.5);
    
    thunderGain.gain.setValueAtTime(0, audioCtx.currentTime);
    thunderGain.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + 0.15);
    thunderGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3.5);
    
    osc.connect(thunderFilter);
    thunderFilter.connect(thunderGain);
    thunderGain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 3.6);
  } catch (err) {
    console.warn("Failed to play thunder rumble:", err);
  }
};

const startWeatherSound = (state) => {
  try {
    if (audioCtx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
    
    const bufferSize = 2 * audioCtx.sampleRate;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;
    
    filterNode = audioCtx.createBiquadFilter();
    gainNode = audioCtx.createGain();
    
    if (state === 'rain' || state === 'thunderstorm') {
      filterNode.type = 'bandpass';
      filterNode.frequency.value = 1000;
      gainNode.gain.value = 0.12;
      
      if (state === 'thunderstorm') {
        soundInterval = setInterval(() => {
          if (Math.random() > 0.4) {
            playThunder();
          }
        }, 7000);
      }
    } else if (state === 'windy') {
      filterNode.type = 'lowpass';
      filterNode.frequency.value = 400;
      gainNode.gain.value = 0.2;
      
      soundInterval = setInterval(() => {
        if (audioCtx && filterNode) {
          const t = audioCtx.currentTime;
          filterNode.frequency.linearRampToValueAtTime(Math.random() * 250 + 150, t + 2);
          gainNode.gain.linearRampToValueAtTime(Math.random() * 0.12 + 0.08, t + 2);
        }
      }, 2000);
    } else {
      gainNode.gain.value = 0.0;
    }
    
    noiseNode.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    noiseNode.start();
  } catch (e) {
    console.warn("Audio Context init failed:", e);
  }
};

const stopWeatherSound = () => {
  try {
    if (soundInterval) { clearInterval(soundInterval); soundInterval = null; }
    if (noiseNode) { noiseNode.stop(); noiseNode = null; }
    if (audioCtx) { audioCtx.close(); audioCtx = null; }
  } catch {}
};

const ActionHome = ({ session }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);

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

  const profitData = useMemo(() => {
    if (!selectedCrop) return null;
    return calculateProfitSnapshot(
      cropEconomics,
      profile?.land_size || 2.5,
      selectedCrop.total_duration_days
    );
  }, [selectedCrop, cropEconomics, profile]);

  const [expandedStage, setExpandedStage] = useState(null);
  const [substepStatus, setSubstepStatus] = useState({});
  const [dynamicSchedule, setDynamicSchedule] = useState(null);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
  const [binModalOpen, setBinModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ open: false, message: '', type: 'info' });

  // PEST & DISEASE DETECTION STATE
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [isDetectionModalOpen, setIsDetectionModalOpen] = useState(false);

  // WEATHER STATE
  const [farmWeather, setFarmWeather] = useState(null);
  const displayWeather = farmWeather;
  const [selectedHourIdx, setSelectedHourIdx] = useState(0);

  const weatherState = useMemo(() => {
    if (!displayWeather?.weather) return 'sunny';
    const main = displayWeather.weather.weather[0]?.main || 'Clear';
    const temp = displayWeather.weather.main.temp || 30;
    const speed = displayWeather.weather.wind.speed || 3;
    const speedKmh = Math.round(speed * 3.6);

    if (main === 'Thunderstorm') return 'thunderstorm';
    if (main === 'Rain' || main === 'Drizzle') return 'rain';
    if (speedKmh > 20) return 'windy';
    if (temp > 32 || main === 'Clear') return 'sunny';
    return 'clouds';
  }, [displayWeather]);

  const weatherTheme = useMemo(() => {
    if (!displayWeather?.weather) return 'sunny-normal';
    const main = displayWeather.weather.weather[0]?.main || 'Clear';
    const temp = displayWeather.weather.main.temp || 30;
    const speed = displayWeather.weather.wind.speed || 3;
    const speedKmh = Math.round(speed * 3.6);
    const desc = displayWeather.weather.weather[0]?.description?.toLowerCase() || '';

    if (main === 'Thunderstorm') return 'rain-heavy';
    if (main === 'Rain' || main === 'Drizzle') {
      if (desc.includes('heavy') || desc.includes('extreme') || desc.includes('ragged')) return 'rain-heavy';
      if (desc.includes('moderate') || desc.includes('shower')) return 'rain-moderate';
      return 'rain-light';
    }
    if (speedKmh > 20) return 'windy';
    if (temp > 35) return 'sunny-hot';
    if (temp >= 28 && temp <= 35) return 'sunny-normal';
    if (temp < 28 && main === 'Clear') return 'cool';
    return 'clouds';
  }, [displayWeather]);

  const isNight = useMemo(() => {
    const hr = new Date().getHours();
    return hr < 6 || hr >= 19;
  }, []);

  const pestFabState = useMemo(() => {
    if (isDetecting) {
      return {
        status: 'detecting',
        icon: (
          <svg className="pest-fab-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="2" x2="12" y2="6"></line>
            <line x1="12" y1="18" x2="12" y2="22"></line>
            <line x1="4.93" y1="4.93" x2="7.05" y2="7.05"></line>
            <line x1="16.97" y1="16.97" x2="19.07" y2="19.07"></line>
            <line x1="2" y1="12" x2="6" y2="12"></line>
            <line x1="18" y1="12" x2="22" y2="12"></line>
            <line x1="4.93" y1="19.07" x2="7.05" y2="16.97"></line>
            <line x1="16.97" y1="7.05" x2="19.07" y2="4.93"></line>
          </svg>
        ),
        textDefault: 'Analyzing Crop Health...',
        textHover: '',
        style: {
          width: '250px',
          borderColor: '#22c55e',
          boxShadow: '0 8px 24px rgba(34,197,94,0.25)'
        }
      };
    }

    return {
      status: 'normal',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      ),
      textDefault: 'Disease Detection',
      textHover: 'Scan crops for pests & diseases',
      style: {}
    };
  }, [isDetecting]);

  const weatherYieldImpact = useMemo(() => {
    switch (weatherTheme) {
      case 'sunny-hot': return 0.022;
      case 'sunny-normal': return 0.018;
      case 'cool': return 0.010;
      case 'rain-light': return 0.005;
      case 'rain-moderate': return 0.010;
      case 'rain-heavy': return -0.004;
      case 'windy': return 0.003;
      default: return 0.006; // clouds/default
    }
  }, [weatherTheme]);

  const adjustedProfitData = useMemo(() => {
    if (!profitData) return null;
    const factor = 1 + weatherYieldImpact;
    return {
      ...profitData,
      totalProfit: Math.round(profitData.totalProfit * factor),
      monthlyIncome: Math.round(profitData.monthlyIncome * factor),
    };
  }, [profitData, weatherYieldImpact]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

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

          // Fetch Weather
          try {
            // Always fetch farm location weather
            const farmRes = await fetchWeatherAndAlerts(profileData.location, import.meta.env.VITE_OPENWEATHER_API_KEY);
            if (farmRes) setFarmWeather(farmRes);
          } catch (err) {
            console.error("Weather fetch failed", err);
          }
        }
      }
      setLoading(false);
    };
    initPage();
  }, [session]);

  // Procedural weather sound play control
  useEffect(() => {
    if (audioEnabled) {
      stopWeatherSound();
      startWeatherSound(weatherState);
    } else {
      stopWeatherSound();
    }
    return () => stopWeatherSound();
  }, [audioEnabled, weatherState]);

  // HTML5 Canvas Weather particle engine
  useEffect(() => {
    const canvas = document.getElementById('sa-weather-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = canvas.width = canvas.getBoundingClientRect().width || canvas.offsetWidth || 350;
    let height = canvas.height = canvas.getBoundingClientRect().height || canvas.offsetHeight || 240;

    const handleResize = () => {
      width = canvas.width = canvas.getBoundingClientRect().width || canvas.offsetWidth || 350;
      height = canvas.height = canvas.getBoundingClientRect().height || canvas.offsetHeight || 240;
    };
    window.addEventListener('resize', handleResize);

    const particles = [];
    const isNight = (() => {
      const hr = new Date().getHours();
      return hr < 6 || hr >= 19;
    })();
    const isDark = (document.documentElement.getAttribute('data-theme') === 'dark') || isNight;
    const season = getCurrentSeason();

    // Determine rain classification details from weatherTheme
    const rainType = (() => {
      if (weatherTheme === 'rain-heavy') return 'heavy';
      if (weatherTheme === 'rain-moderate') return 'moderate';
      if (weatherTheme === 'rain-light') return 'light';
      return null;
    })();

    // Set particle density based on weatherTheme and season
    const maxParticles = (() => {
      if (rainType) {
        return rainType === 'light' ? 45 : rainType === 'moderate' ? 150 : 350;
      }
      if (weatherTheme === 'windy') return 75;
      if (weatherTheme === 'sunny-hot') return 50;
      if (weatherTheme === 'sunny-normal') return 25;
      if (weatherTheme === 'cool') return 15;
      if (season === 'winter') return 40;
      return 20;
    })();

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.alpha = rainType === 'heavy' ? (Math.random() * 0.6 + 0.4) : (Math.random() * 0.5 + 0.25);
        this.size = Math.random() * 2 + 1;
        this.x = Math.random() * width;

        if (rainType) {
          // Rain droplets (top-down, fast)
          this.y = Math.random() * -height;
          this.vy = rainType === 'light' ? (Math.random() * 2 + 4) : rainType === 'moderate' ? (Math.random() * 4 + 7) : (Math.random() * 12 + 15);
          this.vx = Math.random() * 1.2 - 0.6;
          this.size = rainType === 'heavy' ? (Math.random() * 2.8 + 1.8) : rainType === 'moderate' ? (Math.random() * 1.5 + 1.0) : (Math.random() * 0.8 + 0.5);
          this.color = isDark ? `rgba(156, 186, 211, ${this.alpha * 0.85})` : `rgba(74, 114, 150, ${this.alpha * 0.75})`;
        } else if (weatherTheme === 'windy') {
          // Thin horizontal wind sweeps
          this.x = Math.random() * -width;
          this.y = Math.random() * height;
          this.vy = Math.random() * 0.4 - 0.2;
          this.vx = Math.random() * 7 + 6;
          this.size = Math.random() * 50 + 40;
          this.color = isDark ? `rgba(255, 255, 255, 0.08)` : `rgba(255, 255, 255, 0.14)`;
        } else if (weatherTheme === 'sunny-hot') {
          // Scorching orange-gold pollen drifting faster
          this.y = Math.random() * height;
          this.vy = -(Math.random() * 0.8 + 0.3);
          this.vx = Math.random() * 1.2 - 0.6;
          this.size = Math.random() * 2.8 + 1.5;
          this.color = `rgba(245, 158, 11, ${this.alpha * 0.9})`;
        } else if (weatherTheme === 'sunny-normal') {
          // Golden pollen particles floating upwards/around
          this.y = Math.random() * height;
          this.vy = -(Math.random() * 0.5 + 0.15);
          this.vx = Math.random() * 0.7 - 0.35;
          this.size = Math.random() * 2.2 + 1.2;
          this.color = `rgba(234, 179, 8, ${this.alpha * 0.85})`;
        } else if (weatherTheme === 'cool') {
          // Cool light blue-white lazy mist particles
          this.y = Math.random() * height;
          this.vy = Math.random() * 0.3 - 0.15;
          this.vx = Math.random() * 0.4 - 0.2;
          this.size = Math.random() * 3 + 2;
          this.color = isDark ? `rgba(224, 242, 254, ${this.alpha * 0.3})` : `rgba(186, 211, 230, ${this.alpha * 0.25})`;
        } else if (season === 'winter') {
          this.y = Math.random() * -height;
          this.vy = Math.random() * 0.8 + 0.4;
          this.vx = Math.random() * 0.4 - 0.2;
          this.size = Math.random() * 2.5 + 1.5;
          this.color = isDark ? `rgba(240, 248, 255, ${this.alpha * 0.8})` : `rgba(186, 211, 230, ${this.alpha * 0.7})`;
        } else if (season === 'harvest') {
          this.y = Math.random() * -height;
          this.vy = Math.random() * 1.2 + 0.5;
          this.vx = Math.random() * 0.6 - 0.3;
          this.size = Math.random() * 3 + 2;
          this.color = `rgba(245, 158, 11, ${this.alpha * 0.8})`;
        } else {
          this.y = Math.random() * height;
          this.vy = Math.random() * 0.4 + 0.1;
          this.vx = Math.random() * 0.4 - 0.2;
          this.color = isDark ? `rgba(255, 255, 255, 0.08)` : `rgba(45, 90, 39, 0.06)`;
        }
      }

      update() {
        this.y += this.vy;
        this.x += this.vx;

        if (rainType) {
          if (this.y > height || this.x < 0 || this.x > width) {
            this.reset();
            this.y = 0;
          }
        } else if (weatherTheme === 'windy') {
          if (this.x > width || this.y < 0 || this.y > height) {
            this.reset();
            this.x = 0;
          }
        } else if (weatherTheme === 'sunny-hot' || weatherTheme === 'sunny-normal') {
          if (this.y < 0 || this.x < 0 || this.x > width) {
            this.reset();
            this.y = height;
          }
        } else {
          if (this.y > height || this.y < 0 || this.x < 0 || this.x > width) {
            this.reset();
          }
        }
      }

      draw() {
        ctx.beginPath();
        if (rainType) {
          // Draw rain streak line
          ctx.strokeStyle = this.color;
          ctx.lineWidth = this.size;
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x + this.vx * 1.3, this.y + this.vy * 1.3);
          ctx.stroke();

          // Splash ripple at screen bottom
          if (this.y > height - 12) {
            ctx.beginPath();
            const rx = this.size * (rainType === 'heavy' ? 3.0 : rainType === 'moderate' ? 2.0 : 1.2);
            const ry = this.size * (rainType === 'heavy' ? 0.8 : rainType === 'moderate' ? 0.5 : 0.3);
            ctx.ellipse(this.x, height - 4, rx, ry, 0, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
          }
        } else if (weatherTheme === 'windy') {
          // Draw wind sweep line
          ctx.strokeStyle = this.color;
          ctx.lineWidth = 1.2;
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x + this.size, this.y + this.vy * 2);
          ctx.stroke();
        } else {
          // Draw soft circular particles
          ctx.fillStyle = this.color;
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Swaying grass blades at screen bottom
    const drawGrass = (time) => {
      const bladeCount = 75;
      const step = width / bladeCount;
      
      // Warm dry grass in sunny hot weather, lush green otherwise
      ctx.strokeStyle = weatherTheme === 'sunny-hot'
        ? (isDark ? 'rgba(163, 150, 74, 0.15)' : 'rgba(180, 160, 60, 0.16)')
        : (isDark ? 'rgba(57, 255, 106, 0.16)' : 'rgba(46, 125, 50, 0.18)');
      ctx.lineWidth = 1.8;
      
      for (let i = 0; i <= bladeCount; i++) {
        const x = i * step;
        const grassHeight = 24 + Math.sin(i * 0.6) * 8;
        const swayRange = weatherTheme === 'windy' ? 14 : weatherTheme === 'rain-heavy' ? 7 : 3.5;
        const speed = weatherTheme === 'windy' ? 0.007 : weatherTheme === 'rain-heavy' ? 0.004 : 0.0022;
        const sway = Math.sin(time * speed + i) * swayRange;
        ctx.beginPath();
        ctx.moveTo(x, height);
        ctx.quadraticCurveTo(x + sway * 0.5, height - grassHeight * 0.5, x + sway, height - grassHeight);
        ctx.stroke();
      }
    };

    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Heavy rain screen fog
      if (rainType === 'heavy') {
        ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.14)' : 'rgba(255, 255, 255, 0.12)';
        ctx.fillRect(0, 0, width, height);
      }

      // Thunderstorm or heavy rain lightning flash
      if ((weatherState === 'thunderstorm' || weatherTheme === 'rain-heavy') && Math.random() > 0.985) {
        ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.28)' : 'rgba(255, 255, 255, 0.65)';
        ctx.fillRect(0, 0, width, height);
        const card = document.getElementById('sa-weather-card');
        if (card) {
          card.classList.add('lightning-active');
          setTimeout(() => card.classList.remove('lightning-active'), 400);
        }
      }

      // Draw all weather/season particles
      for (const p of particles) {
        p.update();
        p.draw();
      }

      // Draw dynamic swaying grass layer
      drawGrass(Date.now());

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [weatherTheme]);



  const loadCropView = (cropObj) => {
    // Normalize name: remove spaces before "(" so "Paddy (Common)" matches "Paddy(Common)"
    const normalizeName = (n) => (n || '').replace(/\s*\(/g, '(').toLowerCase().trim();
    const targetName = normalizeName(cropObj.cropName);
    let crop = cropProcessData.find(c => normalizeName(c.crop_name) === targetName);
    if (crop) {
      crop = adjustStageRanges(crop);
      const start = new Date(cropObj.startDate);
      const today = new Date();
      const diffTime = today.getTime() - start.getTime();
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      setSelectedCrop(crop);
      setCropStartDate(start);
      setDaysPassed(diffDays);

      const currentStage = calculateCurrentStage(crop.stages, diffDays);
      setExpandedStage(currentStage?.stage_id);

      const cd = cropDataList.find(c => c.api_name === cropObj.cropName || c.name === cropObj.cropName);
      if (cd && cd.economics) {
        setCropEconomics(cd.economics);
      } else {
        setCropEconomics(null);
      }

      let tasks = [];
      for (const stage of crop.stages) {
        if (stage.end_day >= diffDays) {
          for (let sub of stage.substeps) {
             const targetAbsoluteDay = sub.day;
             if (targetAbsoluteDay > diffDays) {
                 let daysFromNow = targetAbsoluteDay - diffDays;
                 let label = `Day ${targetAbsoluteDay}`;
                 if (daysFromNow === 1) label = 'Tomorrow';
                 else if (daysFromNow <= 7) label = `In ${daysFromNow} days`;
                 
                 tasks.push({ day: label, task: sub.task });
             }
          }
        }
      }
      if (tasks.length === 0 && crop.total_duration_days > diffDays) {
        tasks.push({ day: 'Regular', task: 'Monitor soil health and water needs' });
      }
      setUpcomingTasks(tasks.slice(0, 3));
    }
  };

  const handleDetection = async (file) => {
    if (!file) return;
    setIsDetecting(true);
    setDetectionResult(null);
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/detect/detect`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Detection failed');
      
      const data = await response.json();
      setDetectionResult(data);
    } catch (error) {
      console.error('Detection Error:', error);
      setAlertConfig({ open: true, message: 'AI Detection failed. Please ensure the backend is running.', type: 'error' });
    } finally {
      setIsDetecting(false);
    }
  };

  const calculateCurrentStage = (stages, days) => {
    for (let stage of stages) {
      if (days >= stage.start_day && days <= stage.end_day) return stage;
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
      const stageKey = `stage_schedule_v5_${selectedCrop.crop_name}_${targetStage.stage_id}`;
      const cached = localStorage.getItem(stageKey);
      if (cached) {
        setDynamicSchedule(JSON.parse(cached));
      } else {
        setIsGeneratingSchedule(true);
        const schedule = await generateStageSchedule(selectedCrop.crop_name, targetStage.title, targetStage.duration_days, targetStage.substeps, targetStage.start_day);
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
    return (
      <div style={{
        display: 'flex', 
        height: '100vh', 
        justifyContent: 'center', 
        alignItems: 'center', 
        background: '#F6F1EB', 
        color: '#2D5A27',
        fontFamily: '"Outfit", "Inter", sans-serif',
        fontSize: '20px',
        fontWeight: 600,
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(45, 90, 39, 0.1)',
          borderTopColor: '#2D5A27',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        Loading Dashboard...
      </div>
    );
  }

  const currentSeason = getCurrentSeason();

  return (
    <>
      <div className={`antigravity-dashboard weather-bg-${weatherState} weather-theme-${weatherTheme} season-${currentSeason} ${isNight ? 'night-time' : ''}`}>
      
      <div className="daily-word-card">
        <div className="daily-word-icon-wrap">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <div className="daily-word-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="daily-word-label">Daily Word</h3>

          </div>
          <p className="daily-word-quote">
            {dailyQuote ? `"${dailyQuote}"` : '"The ultimate goal of farming is not the growing of crops, but the cultivation and perfection of human beings."'}
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        
        {/* LEFT COLUMN */}
        <div className="left-column">
          
          {/* HERO CARD */}
          <div className="neo-card hero-card">
            <div className="hero-glow"></div>
            <div className="hero-header" style={{ display: 'block' }}>
              {weatherState === 'rain' ? (
                <div>
                  <h1 className="hero-welcome">{getGreeting()}, {profile?.full_name || 'Hithesh'}</h1>
                  <div className="hero-impact-pill">Rainfall Detected: 12mm Today</div>
                  <p className="hero-impact-desc">Your farm is receiving adequate moisture. Expected Water Saving: <strong>₹240</strong></p>
                </div>
              ) : weatherState === 'thunderstorm' ? (
                <div>
                  <h1 className="hero-welcome">{getGreeting()}, {profile?.full_name || 'Hithesh'}</h1>
                  <div className="hero-impact-pill warning">⚡ Thunderstorm Warning</div>
                  <p className="hero-impact-desc">Expected Rain: <strong>45mm</strong>. Risk of <strong>Waterlogging</strong>. Ensure drainage valves are clear.</p>
                </div>
              ) : weatherState === 'windy' ? (
                <div>
                  <h1 className="hero-welcome">{getGreeting()}, {profile?.full_name || 'Hithesh'}</h1>
                  <div className="hero-impact-pill warning">High Wind Warning</div>
                  <p className="hero-impact-desc">Wind Speed: <strong>22 km/h</strong>. Risk of crop stress. <strong>Avoid chemical spraying</strong> due to drift.</p>
                </div>
              ) : weatherState === 'sunny' ? (
                isNight ? (
                  <div>
                    <h1 className="hero-welcome">{getGreeting()}, {profile?.full_name || 'Hithesh'}</h1>
                    <div className="hero-impact-pill">Clear Night Sky</div>
                    <p className="hero-impact-desc">Temperatures are cool. Soil evaporation rates are low. Standard nighttime rest active.</p>
                  </div>
                ) : (
                  <div>
                    <h1 className="hero-welcome">{getGreeting()}, {profile?.full_name || 'Hithesh'}</h1>
                    <div className="hero-impact-pill warning">High Temperature Alert</div>
                    <p className="hero-impact-desc">Heat Stress Risk: <strong>Medium</strong>. AI Recommendation: <strong>Increase irrigation by 10%</strong> today.</p>
                  </div>
                )
              ) : (
                <div>
                  <h1 className="hero-welcome">{getGreeting()}, {profile?.full_name || 'Hithesh'}</h1>
                  <div className="hero-impact-pill">Overcast Conditions</div>
                  <p className="hero-impact-desc">Photosynthesis rate is slightly reduced. Monitor for mildew signs. Keep normal maintenance.</p>
                </div>
              )}
            </div>
            <div className="hero-sub" style={{ marginTop: '12px' }}>ACTIVE FARMER</div>
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
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn-filled" onClick={() => navigate('/add-crop')}>+ Add Crop</button>
                  <button className="btn-outline" onClick={() => navigate('/recommendation')} style={{ border: '1px solid var(--neon-green)', color: 'var(--neon-green)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    Predict Best Crop
                  </button>
                </div>
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

          {!selectedCrop && (
            <div className="neo-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                background: 'var(--neon-green-dim)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 24px',
                color: 'var(--neon-green)'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>Start Your Farming Journey</h3>
              <p style={{ color: 'var(--text-sub)', maxWidth: '400px', margin: '0 auto 32px', lineHeight: 1.6 }}>
                You don't have any active crops registered. Use our AI Recommendation engine to find the best crop for your soil and climate, or manually add one to start tracking.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <button className="btn-filled" style={{ padding: '12px 32px' }} onClick={() => navigate('/recommendation')}>Predict Best Crop</button>
                <button className="btn-outline" style={{ padding: '12px 32px' }} onClick={() => navigate('/add-crop')}>Add Manually</button>
              </div>
            </div>
          )}

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

                {/* SMART WEATHER ADVISOR */}
                {farmWeather && farmWeather.alert && (
                  <div style={{ 
                    marginTop: '12px', 
                    padding: '12px 16px', 
                    borderRadius: '12px', 
                    background: farmWeather.alert.severity === 'success' ? 'rgba(57, 255, 106, 0.08)' : 'rgba(255, 152, 0, 0.1)',
                    border: `1px solid ${farmWeather.alert.severity === 'success' ? 'rgba(57, 255, 106, 0.2)' : 'rgba(255, 152, 0, 0.3)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{ 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '50%', 
                      background: farmWeather.alert.severity === 'success' ? 'rgba(57, 255, 106, 0.15)' : 'rgba(255, 152, 0, 0.2)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: farmWeather.alert.severity === 'success' ? 'var(--neon-green)' : '#FF9800'
                    }}>
                      {farmWeather.alert.severity === 'success' ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: farmWeather.alert.severity === 'success' ? 'var(--neon-green)' : '#F57C00', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Weather Advisor (Farm: {profile?.location?.split(',')[0] || 'Farm'})
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 500, marginTop: '2px' }}>
                        {(() => {
                          let message = farmWeather.alert.message;
                          const stageTitle = currentStage?.title?.toLowerCase() || "";
                          const isInitialPhase = stageTitle.includes('land preparation') || stageTitle.includes('ploughing') || daysPassed <= 3;
                          
                          if (isInitialPhase && message.toLowerCase().includes('heat stress on crops')) {
                            const temp = farmWeather.weather ? Math.round(farmWeather.weather.main.temp) : 35;
                            return `It is currently ${temp}°C at your farm. Wear protective gear and stay hydrated while ploughing. Avoid working during peak heat hours.`;
                          }
                          return message;
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="task-list">
                {(() => {
                  const sortedSubsteps = currentStage.substeps.map((sub, i) => {
                    const taskText = sub.task;
                    let ai = null;
                    if (dynamicSchedule && Array.isArray(dynamicSchedule)) {
                      ai = dynamicSchedule.find(s => s.task === taskText);
                    }
                    const targetDay = ai 
                      ? (currentStage.start_day + ai.relative_day - 1) 
                      : sub.day;
                    
                    return { sub: taskText, i, ai, targetDay };
                  }).sort((a, b) => a.targetDay - b.targetDay);
                  
                  // Filter to only show tasks scheduled for today, or past-due tasks not yet checked off
                  let todaysTasks = sortedSubsteps.filter(item => {
                    const isChecked = substepStatus[`${currentStage.stage_id}_${item.i}`];
                    return item.targetDay === daysPassed || (item.targetDay < daysPassed && !isChecked);
                  });

                  // Weather dynamic tasks injection
                  let weatherPrepTask = null;
                  const todayStr = new Date().toISOString().split('T')[0];
                  if (weatherState === 'rain' || weatherState === 'thunderstorm') {
                    const todayKey = `weather_task_drainage_${todayStr}`;
                    const isChecked = substepStatus[todayKey] || false;
                    weatherPrepTask = {
                      sub: "🌧 Inspect drainage channels and clear rainwater harvest systems",
                      i: todayKey,
                      isWeatherTask: true,
                      isChecked: isChecked,
                      weatherBadge: "WEATHER PREP",
                      weatherDesc: "Monsoon rainfall active. Prevent pooling on field borders and ensure storage tank fills cleanly.",
                      targetDay: daysPassed,
                      toggleFunc: () => {
                        localStorage.setItem(todayKey, (!isChecked).toString());
                        setSubstepStatus(prev => ({ ...prev, [todayKey]: !isChecked }));
                      }
                    };
                  } else if (weatherState === 'windy') {
                    const todayKey = `weather_task_wind_${todayStr}`;
                    const isChecked = substepStatus[todayKey] || false;
                    weatherPrepTask = {
                      sub: "🌬 Secure trellises, strappings, and crop support posts",
                      i: todayKey,
                      isWeatherTask: true,
                      isChecked: isChecked,
                      weatherBadge: "WIND ALERT",
                      weatherDesc: "Wind speed is high (22 km/h). Prevent damage to seedlings and tall crop stalks.",
                      targetDay: daysPassed,
                      toggleFunc: () => {
                        localStorage.setItem(todayKey, (!isChecked).toString());
                        setSubstepStatus(prev => ({ ...prev, [todayKey]: !isChecked }));
                      }
                    };
                  }

                  if (weatherPrepTask) {
                    todaysTasks = [weatherPrepTask, ...todaysTasks];
                  }

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
                    const isChecked = item.isWeatherTask ? item.isChecked : substepStatus[`${currentStage.stage_id}_${item.i}`];
                    const isActive = !isChecked && idx === 0; // Top uncompleted task is active focus
                    const taskDate = new Date(cropStartDate.getTime() + (item.targetDay - 1) * 86400000);
                    const formattedDate = taskDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                    
                    // Weather-driven prioritization / warning badges
                    const isSprayTask = !item.isWeatherTask && /spray|fertiliz|pesticid|applic/i.test(item.sub);
                    const isIrrigationTask = !item.isWeatherTask && /water|irrigat/i.test(item.sub);
                    let taskWeatherAlert = null;
                    let taskWeatherBadge = null;
                    let badgeType = "neutral";
                    
                    if (isSprayTask && (weatherState === 'rain' || weatherState === 'thunderstorm')) {
                      taskWeatherBadge = "DELAYED";
                      taskWeatherAlert = "Postpone chemical spraying to avoid rain runoff and loss.";
                    } else if (isSprayTask && weatherState === 'windy') {
                      taskWeatherBadge = "DELAYED";
                      taskWeatherAlert = "Postpone pesticide application to avoid wind drift.";
                    } else if (isIrrigationTask && weatherState === 'sunny') {
                      taskWeatherBadge = "BOOST WATER";
                      taskWeatherAlert = "Increase irrigation rate by 10% due to heat stress.";
                      badgeType = "boost";
                    }

                    return (
                      <div key={idx} className={`task-item ${isActive ? 'active' : ''}`} style={{opacity: isChecked ? 0.4 : 1}}>
                        <div className="task-left">
                          <div className={`task-checkbox ${isChecked ? 'checked' : ''}`} onClick={() => item.isWeatherTask ? item.toggleFunc() : toggleSubstep(currentStage.stage_id, item.i)}>
                             {isChecked && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0A0D0B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                          </div>
                          <div className="task-content">
                            <h4 style={{textDecoration: isChecked ? 'line-through' : 'none'}}>
                              {item.sub} 
                              {item.isWeatherTask ? (
                                <span className="high-badge" style={{ background: 'var(--neon-green-dim)', color: 'var(--neon-green)', borderColor: 'var(--neon-green)' }}>{item.weatherBadge}</span>
                              ) : (
                                <>
                                  {isActive && <span className="high-badge">URGENT</span>}
                                  {taskWeatherBadge && (
                                    <span className="high-badge" style={{ 
                                      background: badgeType === 'boost' ? 'rgba(57, 255, 106, 0.1)' : 'rgba(156, 163, 175, 0.15)', 
                                      color: badgeType === 'boost' ? 'var(--neon-green)' : 'var(--text-sub)',
                                      borderColor: badgeType === 'boost' ? 'rgba(57, 255, 106, 0.3)' : 'rgba(156, 163, 175, 0.3)'
                                    }}>
                                      {taskWeatherBadge}
                                    </span>
                                  )}
                                </>
                              )}
                            </h4>
                            {item.isWeatherTask ? (
                              <div className="task-desc">{item.weatherDesc}</div>
                            ) : (
                              <>
                                {isActive && item.ai && <div className="task-desc">{item.ai.reason}</div>}
                                {taskWeatherAlert && !isChecked && (
                                  <div className="sys-rec" style={{ color: badgeType === 'boost' ? 'var(--neon-green)' : 'var(--text-sub)', borderColor: badgeType === 'boost' ? 'rgba(57, 255, 106, 0.3)' : 'rgba(156, 163, 175, 0.3)' }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                    {taskWeatherAlert}
                                  </div>
                                )}
                                {isActive && item.ai && !taskWeatherAlert && (
                                  <div className="sys-rec">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/></svg>
                                    System Recommendation
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        <div className="task-right">
                          <div className="task-day">
                            Day {item.targetDay}
                            <span style={{ fontSize: '10px', color: 'var(--text-sub)', marginLeft: '4px', display: 'block', textAlign: 'right' }}>
                              {formattedDate}
                            </span>
                          </div>
                          {isActive && !taskWeatherAlert && <div className="task-timing">Optimal timing</div>}
                          {item.targetDay < daysPassed && !isChecked && <div className="task-timing" style={{color: 'var(--danger-red)'}}>Past Due</div>}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* CROP CALENDAR */}
          {selectedCrop && (
            <CropCalendarCard 
              selectedCrop={selectedCrop} 
              cropStartDate={cropStartDate} 
              daysPassed={daysPassed} 
              substepStatus={substepStatus} 
            />
          )}

          {/* CROP JOURNEY */}
          {selectedCrop && (
            <div className="neo-card">
               <h3 className="section-title" style={{marginBottom: '32px'}}>Crop Journey</h3>
               
               <div className="pipeline-wrap">
                 <div className="pipeline-line"></div>
                 {selectedCrop.stages.map((stage, idx) => {
                    const status = stage.stage_id < currentStage?.stage_id ? 'done' : (stage.stage_id === currentStage?.stage_id ? 'active' : 'pending');
                    const isSelected = stage.stage_id === (expandedStage || currentStage?.stage_id);
                    return (
                      <div key={idx} className={`pipeline-node-wrap ${isSelected ? 'selected' : ''}`} onClick={() => setExpandedStage(stage.stage_id)} style={{cursor: 'pointer'}}>
                        <div className={`p-node ${status} ${isSelected ? 'selected' : ''}`}>
                          {status === 'done' ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          ) : stage.stage_id}
                        </div>
                        <div className="p-label" style={{maxWidth: '60px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{stage.title}</div>
                      </div>
                    )
                 })}
               </div>

               {(() => {
                  const activePanelStage = selectedCrop.stages.find(s => s.stage_id === (expandedStage || currentStage?.stage_id)) || currentStage;
                  if (!activePanelStage) return null;
                  const sStatus = activePanelStage.stage_id < currentStage?.stage_id ? 'completed' : (activePanelStage.stage_id === currentStage?.stage_id ? 'active' : 'upcoming');
                  const stageDuration = activePanelStage.end_day - activePanelStage.start_day + 1;
                  const sDays = (sStatus === 'active') 
                    ? Math.max(0, Math.min(daysPassed - activePanelStage.start_day + 1, stageDuration)) 
                    : (sStatus === 'completed' ? stageDuration : 0);
                  let sPercent = Math.round((sDays / stageDuration) * 100);
                  if (stageDuration <= 0) sPercent = 100;

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
                              const taskText = sub.task;
                              const originalTargetDay = sub.day;
                              
                              let ai = null;
                              if (dynamicSchedule && Array.isArray(dynamicSchedule)) {
                                ai = dynamicSchedule.find(s => s.task === taskText);
                              }
                              
                              const targetDay = ai 
                                ? (activePanelStage.start_day + ai.relative_day - 1) 
                                : originalTargetDay;
                              
                              const isChecked = sStatus === 'completed' || substepStatus[`${activePanelStage.stage_id}_${i}`];
                              const taskDate = new Date(cropStartDate.getTime() + (targetDay - 1) * 86400000);
                              const formattedDate = taskDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

                              return (
                                <div key={i} className="task-item" style={{borderBottom: 'none', padding: '4px 0', opacity: isChecked ? 0.3 : 1}}>
                                  <div className="task-left">
                                    <div className={`task-checkbox ${isChecked ? 'checked' : ''}`} style={{width: '16px', height: '16px', cursor: 'default'}}>
                                      {isChecked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0A0D0B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{marginTop:'-2px'}}><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                    </div>
                                    <div className="task-content">
                                      <h4 style={{fontSize: '13px', margin: 0, textDecoration: isChecked?'line-through':'none'}}>{taskText}</h4>
                                    </div>
                                  </div>
                                  <div className="task-right">
                                    <div className="task-day">
                                      Day {targetDay}
                                      <span style={{ fontSize: '10px', color: 'var(--text-sub)', marginLeft: '4px', display: 'block', textAlign: 'right' }}>
                                        {formattedDate}
                                      </span>
                                    </div>
                                  </div>
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
          {(() => {
            const weatherScene = (() => {
              if (isNight) return 'night';
              if (weatherState === 'thunderstorm' || weatherTheme === 'rain-heavy') return 'thunderstorm';
              if (weatherTheme === 'rain-light' || weatherTheme === 'rain-moderate') return 'rain';
              if (weatherTheme === 'sunny-hot' || weatherTheme === 'sunny-normal') return 'sunny';
              if (weatherTheme === 'cool') return 'partly-cloudy';
              if (weatherTheme === 'clouds') return 'cloudy';
              if (weatherTheme === 'windy') return 'partly-cloudy';
              return 'sunny'; // fallback
            })();

            const dynamicInsight = (() => {
              if (weatherScene === 'rain' || weatherScene === 'thunderstorm') {
                return {
                  title: "✨ SmartAgri AI: Rain Expected",
                  message: "Heavy rain / storm detected. Avoid pesticide spraying or fertilizer spreading to prevent chemical run-off. Soil moisture is naturally improving. No irrigation is needed today."
                };
              }
              if (weatherScene === 'sunny') {
                return {
                  title: "✨ SmartAgri AI: High Evaporation",
                  message: "High temperature and strong sunlight will increase transpiration. Secure soil moisture. Increase irrigation by 10% in the evening. Ideal time for crop scouting and pest check."
                };
              }
              if (weatherTheme === 'windy') {
                return {
                  title: "✨ SmartAgri AI: Drift Advisory",
                  message: "Wind speeds are high. Avoid any chemical spraying to prevent drift damage to adjacent rows. Secure tall crops and inspect greenhouse covers if applicable."
                };
              }
              if (weatherScene === 'clouds' || weatherScene === 'partly-cloudy') {
                return {
                  title: "✨ SmartAgri AI: Stable Conditions",
                  message: "Overcast skies will slightly reduce direct light. Photosynthesis is moderate. Keep standard weeding schedules, maintain normal irrigation, and watch out for early leaf spot."
                };
              }
              return {
                title: "✨ SmartAgri AI: Optimal Outlook",
                message: "Farming conditions are highly favorable today. Soil conditions and ambient temp are stable. Clear to apply fertilizer, weed fields, and run routine soil testing."
              };
            })();

            const fallbackForecasts = [
              { dt: Math.floor(Date.now() / 1000) + 10800, main: { temp: 33 }, weather: [{ main: 'Clear' }] },
              { dt: Math.floor(Date.now() / 1000) + 21600, main: { temp: 30 }, weather: [{ main: 'Clouds' }] },
              { dt: Math.floor(Date.now() / 1000) + 32400, main: { temp: 27 }, weather: [{ main: 'Rain' }] },
              { dt: Math.floor(Date.now() / 1000) + 43200, main: { temp: 24 }, weather: [{ main: 'Thunderstorm' }] }
            ];
            const list = (displayWeather?.forecastList || []).slice(0, 4);
            const activeForecasts = list.length === 4 ? list : fallbackForecasts;

            // Compute values based on selected forecast item (0 is NOW, 1-4 are hourly)
            const currentTemp = displayWeather?.weather ? Math.round(displayWeather.weather.main.temp) : 24;
            const currentHumidity = displayWeather?.weather ? displayWeather.weather.main.humidity : 65;
            const currentWindSpeed = displayWeather?.weather ? Math.round(displayWeather.weather.wind.speed * 3.6) : 12;
            const currentWindDeg = displayWeather?.weather ? displayWeather.weather.wind.deg : 45;
            const currentRainChance = displayWeather?.weather ? Math.round(displayWeather.weather.pop * 100) : 15;

            const selectedTemp = selectedHourIdx === 0 
              ? currentTemp 
              : Math.round(activeForecasts[selectedHourIdx - 1]?.main?.temp || currentTemp);
              
            const selectedCond = selectedHourIdx === 0
              ? (displayWeather?.weather ? displayWeather.weather.weather[0]?.main : 'Sunny')
              : (activeForecasts[selectedHourIdx - 1]?.weather?.[0]?.main || 'Sunny');

            const selectedDesc = selectedHourIdx === 0
              ? (displayWeather?.weather ? displayWeather.weather.weather[0]?.description : 'clear sky')
              : (activeForecasts[selectedHourIdx - 1]?.weather?.[0]?.description || 'clear sky');

            return (
              <div id="sa-weather-card" className={`neo-card weather-center-card scene-${weatherScene}`}>
                
                {/* 1. HTML5 Canvas Weather particle engine */}
                <canvas id="sa-weather-canvas" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />

                {/* 2. Parallax and Sun/Moon Glow layers */}
                {!isNight && weatherScene === 'sunny' && <div className="live-sky-sun-glow" />}
                {isNight && <div className="live-sky-moon-glow" />}
                <div className="sky-parallax-clouds">
                  <div className="parallax-cloud-layer cloud-fast" />
                  <div className="parallax-cloud-layer cloud-slow" />
                </div>
                {isNight && (
                  <div className="shooting-star-overlay">
                    <div className="shooting-star" style={{ animationDelay: '2s' }} />
                    <div className="shooting-star" style={{ animationDelay: '7s', top: '40%', left: '70%' }} />
                  </div>
                )}

                {/* 3. Weather Layout Wrapper (No overall blur, keeps background sharp) */}
                <div className="weather-layout-wrapper">
                  
                  {/* Header Row */}
                  <div className="weather-header-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px', animation: 'weatherFloat 3s infinite ease-in-out alternate' }}>📍</span>
                      <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '-0.3px', color: '#ffffff' }}>
                        {displayWeather?.locationName || profile?.location || 'Hyderabad, TG'}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 600, background: 'rgba(255,255,255,0.18)', padding: '3px 10px', borderRadius: '20px', color: '#ffffff' }}>
                      LIVE
                    </span>
                  </div>

                  {/* Glass Card 1: Temperature & Primary Info */}
                  <div className="weather-glass-card">
                    <div className="weather-main-row">
                      <div className="weather-text-details">
                        <div className="temp-text-large">
                          {selectedTemp}<span>°</span>
                        </div>
                        <div className="weather-title-desc" style={{ color: '#ffffff' }}>
                          {selectedCond}
                        </div>
                        <div className="weather-sub-details" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                          <span style={{ textTransform: 'capitalize' }}>{selectedDesc}</span>
                          <span>•</span>
                          <span>Feels like {selectedTemp + (weatherScene === 'sunny' ? 2 : -2)}°</span>
                          <span>•</span>
                          <span className="weather-aqi-badge">AQI 32 • Good</span>
                        </div>
                      </div>

                      {/* Floating dynamic icon */}
                      <div className="weather-floating-icon">
                        {(() => {
                          if (weatherScene === 'sunny') {
                            return (
                              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#FFE8A3" strokeWidth="2" style={{ animation: 'spin 10s linear infinite' }}>
                                <circle cx="12" cy="12" r="5" fill="#FFE8A3" />
                                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M5.64 18.36l-1.42 1.42M19.78 4.22l-1.42 1.42" strokeLinecap="round" />
                              </svg>
                            );
                          }
                          if (weatherScene === 'partly-cloudy') {
                            return (
                              <div style={{ position: 'relative', width: 64, height: 64 }}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFE8A3" strokeWidth="2" style={{ position: 'absolute', top: 4, right: 4, animation: 'spin 12s linear infinite' }}>
                                  <circle cx="12" cy="12" r="5" fill="#FFE8A3" />
                                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M5.64 18.36l-1.42 1.42M19.78 4.22l-1.42 1.42" />
                                </svg>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" style={{ position: 'absolute', bottom: 4, left: 4, animation: 'weatherFloat 4s infinite ease-in-out alternate' }}>
                                  <path d="M18 10h-1.26A8 8 0 1 0 9 15h9a5 5 0 0 0 0-10z" fill="#ffffff" opacity="0.9" />
                                </svg>
                              </div>
                            );
                          }
                          if (weatherScene === 'cloudy') {
                            return (
                              <div style={{ position: 'relative', width: 64, height: 64 }}>
                                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth="2" style={{ position: 'absolute', top: 4, left: 4, animation: 'weatherFloat 5s infinite ease-in-out alternate-reverse' }}>
                                  <path d="M18 10h-1.26A8 8 0 1 0 9 15h9a5 5 0 0 0 0-10z" fill="#e2e8f0" opacity="0.8" />
                                </svg>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" style={{ position: 'absolute', bottom: 4, right: 4, animation: 'weatherFloat 4.2s infinite ease-in-out alternate' }}>
                                  <path d="M18 10h-1.26A8 8 0 1 0 9 15h9a5 5 0 0 0 0-10z" fill="#ffffff" />
                                </svg>
                              </div>
                            );
                          }
                          if (weatherScene === 'rain') {
                            return (
                              <div style={{ position: 'relative', width: 64, height: 64 }}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" style={{ position: 'absolute', top: 2, left: 8, animation: 'weatherFloat 4s infinite ease-in-out alternate' }}>
                                  <path d="M18 10h-1.26A8 8 0 1 0 9 15h9a5 5 0 0 0 0-10z" fill="#cbd5e1" />
                                </svg>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7EAEDB" strokeWidth="2" style={{ position: 'absolute', bottom: 2, left: 16 }}>
                                  <path d="M10 14v4M14 14v4M6 14v4" strokeDasharray="2 3" style={{ animation: 'rainFallAnim 1s linear infinite' }} />
                                </svg>
                              </div>
                            );
                          }
                          if (weatherScene === 'thunderstorm') {
                            return (
                              <div style={{ position: 'relative', width: 64, height: 64 }}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position: 'absolute', top: 2, left: 8, animation: 'weatherFloat 3.5s infinite ease-in-out alternate' }}>
                                  <path d="M18 10h-1.26A8 8 0 1 0 9 15h9a5 5 0 0 0 0-10z" fill="#94a3b8" />
                                </svg>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" style={{ position: 'absolute', bottom: 0, left: 16, animation: 'boltFlash 1.5s infinite step-end' }}>
                                  <path d="m13 2-8 10h7l-2 10 10-12h-7z" fill="#f59e0b" />
                                </svg>
                              </div>
                            );
                          }
                          if (weatherScene === 'fog') {
                            return (
                              <div style={{ position: 'relative', width: 64, height: 64 }}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" style={{ position: 'absolute', top: 4, left: 8, animation: 'weatherFloat 5s infinite ease-in-out alternate' }}>
                                  <path d="M18 10h-1.26A8 8 0 1 0 9 15h9a5 5 0 0 0 0-10z" fill="#cbd5e1" opacity="0.6" />
                                </svg>
                                <div style={{ position: 'absolute', bottom: 12, left: 8, width: 48, height: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                  <div style={{ width: '100%', height: 2, background: 'rgba(255,255,255,0.7)', borderRadius: 1, animation: 'fogDriftLine 3s infinite linear alternate' }} />
                                  <div style={{ width: '80%', height: 2, background: 'rgba(255,255,255,0.5)', borderRadius: 1, animation: 'fogDriftLine 4s infinite linear alternate-reverse' }} />
                                </div>
                              </div>
                            );
                          }
                          if (weatherScene === 'snow') {
                            return (
                              <div style={{ position: 'relative', width: 64, height: 64 }}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth="2" style={{ position: 'absolute', top: 2, left: 8, animation: 'weatherFloat 4s infinite ease-in-out alternate' }}>
                                  <path d="M18 10h-1.26A8 8 0 1 0 9 15h9a5 5 0 0 0 0-10z" fill="#e2e8f0" />
                                </svg>
                                <span style={{ position: 'absolute', bottom: 4, left: 16, fontSize: 18, animation: 'spin 4s linear infinite' }}>❄️</span>
                                <span style={{ position: 'absolute', bottom: 8, left: 32, fontSize: 12, animation: 'spin 6s linear infinite' }}>❄️</span>
                              </div>
                            );
                          }
                          // default: Night Moon
                          return (
                            <div style={{ position: 'relative', width: 64, height: 64 }}>
                              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#FFE8A3" strokeWidth="2" style={{ position: 'absolute', top: 6, left: 10, animation: 'weatherFloat 4s infinite ease-in-out alternate' }}>
                                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="#FFE8A3" />
                              </svg>
                              <span style={{ position: 'absolute', top: 6, left: 4, fontSize: 10, animation: 'starBlink 2.2s infinite alternate' }}>⭐</span>
                              <span style={{ position: 'absolute', bottom: 12, right: 4, fontSize: 8, animation: 'starBlink 1.8s infinite alternate' }}>⭐</span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Glass Card 2: Hourly Forecast Timeline */}
                  <div className="weather-glass-card">
                    <div className="hourly-timeline-slider">
                      <div 
                        className={`hourly-timeline-item ${selectedHourIdx === 0 ? 'selected' : ''}`}
                        onClick={() => setSelectedHourIdx(0)}
                      >
                        <span className="timeline-time-label">NOW</span>
                        <span className="timeline-icon-wrap">
                          {getForecastIcon(
                            weatherState === 'sunny' ? 'Clear' : weatherState === 'rain' ? 'Rain' : weatherState === 'thunderstorm' ? 'Thunderstorm' : weatherState === 'windy' ? 'Windy' : 'Clouds',
                            weatherState === 'windy' ? 25 : 5,
                            Math.floor(Date.now() / 1000)
                          )}
                        </span>
                        <span className="timeline-temp-label">{currentTemp}°</span>
                      </div>
                      {activeForecasts.map((f, idx) => {
                        const timeStr = formatForecastHour(f.dt);
                        const mainCond = f.weather?.[0]?.main || 'Clear';
                        const icon = getForecastIcon(mainCond, f.wind?.speed, f.dt);
                        const tempVal = Math.round(f.main?.temp || 30);
                        
                        return (
                          <div 
                            className={`hourly-timeline-item ${selectedHourIdx === idx + 1 ? 'selected' : ''}`}
                            key={idx}
                            onClick={() => setSelectedHourIdx(idx + 1)}
                          >
                            <span className="timeline-time-label">{timeStr}</span>
                            <span className="timeline-icon-wrap">{icon}</span>
                            <span className="timeline-temp-label">{tempVal}°</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Glass Card 3: Metrics Pills Card */}
                  <div className="weather-glass-card" style={{ padding: '12px' }}>
                    <div className="weather-metrics-pills">
                      <div className="metric-glass-pill">
                        <span style={{ fontSize: '16px' }}>🌡️</span>
                        <span className="metric-pill-val">{currentTemp}°C</span>
                        <span className="metric-pill-lbl">Temp</span>
                      </div>
                      <div className="metric-glass-pill">
                        <span style={{ fontSize: '16px' }}>💧</span>
                        <span className="metric-pill-val">{currentHumidity}%</span>
                        <span className="metric-pill-lbl">Humid</span>
                      </div>
                      <div className="metric-glass-pill">
                        <span style={{ fontSize: '16px' }}>🌬️</span>
                        <span className="metric-pill-val">
                          {currentWindSpeed} <span style={{ fontSize: '8px' }}>km/h</span>
                        </span>
                        <span className="metric-pill-lbl">{displayWeather?.weather ? getWindDirection(currentWindDeg).arrow : ''} Wind</span>
                      </div>
                      <div className="metric-glass-pill">
                        <span style={{ fontSize: '16px' }}>☔</span>
                        <span className="metric-pill-val">{currentRainChance}%</span>
                        <span className="metric-pill-lbl">Rain</span>
                      </div>
                      <div className="metric-glass-pill">
                        <span style={{ fontSize: '16px' }}>☀️</span>
                        <span className="metric-pill-val">
                          {weatherScene === 'sunny' ? '6' : weatherScene === 'partly-cloudy' ? '4' : '1'}
                        </span>
                        <span className="metric-pill-lbl">UV Index</span>
                      </div>
                    </div>
                  </div>



                  {/* Glass Card 5: Farming Impacts Card */}
                  <div className="weather-glass-card" style={{ padding: '14px' }}>
                    <div className="farming-impact-grid">
                      <div className="impact-glass-card">
                        <span className="impact-icon-wrap">🌱</span>
                        <div className="impact-info-col">
                          <span className="impact-info-lbl">Soil Moisture</span>
                          <span className="impact-info-val" style={{ color: (weatherScene === 'rain' || weatherScene === 'thunderstorm') ? '#74D99F' : '#FFE8A3' }}>
                            {(weatherScene === 'rain' || weatherScene === 'thunderstorm') ? 'Excellent' : 'Good'}
                          </span>
                        </div>
                      </div>
                      <div className="impact-glass-card">
                        <span className="impact-icon-wrap">💧</span>
                        <div className="impact-info-col">
                          <span className="impact-info-lbl">Irrigation Need</span>
                          <span className="impact-info-val">
                            {(weatherScene === 'rain' || weatherScene === 'thunderstorm') ? 'None' : 'Moderate'}
                          </span>
                        </div>
                      </div>
                      <div className="impact-glass-card">
                        <span className="impact-icon-wrap">🌾</span>
                        <div className="impact-info-col">
                          <span className="impact-info-lbl">Crop Growth</span>
                          <span className="impact-info-val">
                            {weatherScene === 'sunny' ? '+3.2%' : (weatherScene === 'rain' || weatherScene === 'thunderstorm') ? '+1.5%' : '+1.0%'}
                          </span>
                        </div>
                      </div>
                      <div className="impact-glass-card">
                        <span className="impact-icon-wrap">🐛</span>
                        <div className="impact-info-col">
                          <span className="impact-info-lbl">Pest Risk</span>
                          <span className="impact-info-val" style={{ color: (weatherScene === 'rain' || weatherScene === 'thunderstorm') ? '#EF4444' : '#74D99F' }}>
                            {(weatherScene === 'rain' || weatherScene === 'thunderstorm') ? 'High' : 'Low'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}

          {/* PROFIT SNAPSHOT */}
          {selectedCrop && (
            <div className="neo-card profit-snapshot">
              <h3>Profit Snapshot</h3>
              <div className="profit-sub" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{selectedCrop.crop_name}</span>
                <span style={{ 
                  fontSize: '11px', 
                  color: weatherYieldImpact >= 0 ? 'var(--neon-green)' : 'var(--danger-red)', 
                  fontWeight: 800,
                  background: weatherYieldImpact >= 0 ? 'var(--neon-green-dim)' : 'rgba(239, 68, 68, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: `1px solid ${weatherYieldImpact >= 0 ? 'rgba(57, 255, 106, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
                }}>
                  {weatherYieldImpact >= 0 ? `+${(weatherYieldImpact * 100).toFixed(1)}%` : `${(weatherYieldImpact * 100).toFixed(1)}%`} Yield Impact
                </span>
              </div>
              
              <div className="profit-label">EXPECTED PROFIT (WEATHER ADJUSTED)</div>
              <div className="profit-value">₹{adjustedProfitData ? adjustedProfitData.totalProfit.toLocaleString('en-IN') : '2,68,000'}</div>

              <div className="profit-metrics">
                <div className="pm-box">
                  <div className="pm-label">EST. YIELD</div>
                  <div className="pm-val">{adjustedProfitData ? adjustedProfitData.totalYield : '200'} q</div>
                </div>
                <div className="pm-box">
                  <div className="pm-label">MKT PRICE</div>
                  <div className="pm-val">₹{adjustedProfitData ? adjustedProfitData.marketPricePerQ.toLocaleString('en-IN') : '2,300'}/q</div>
                </div>
                <div className="pm-box">
                  <div className="pm-label">MONTHLY</div>
                  <div className="pm-val">₹{adjustedProfitData ? adjustedProfitData.monthlyIncome.toLocaleString('en-IN') : '44,667'}</div>
                </div>
              </div>
            </div>
          )}

          {/* BOTTOM SPLIT WRAPPER */}
          <div className="split-wrapper">
          
            {/* UPCOMING TASKS */}
            <div className="neo-card">
              <h3 className="section-title" style={{marginBottom: '20px'}}>Upcoming Tasks</h3>
              <div className="sb-task-list">
                 {selectedCrop ? (
                   upcomingTasks.length > 0 ? upcomingTasks.map((t, idx) => (
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
                   )
                 ) : (
                   <p style={{ color: 'var(--text-sub)', fontSize: '13px', margin: '16px 0', textAlign: 'center' }}>
                     No active crops. Add a crop to view upcoming task recommendations.
                   </p>
                 )}
              </div>
            </div>

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

      {/* PEST & DISEASE FAB */}
      <button 
        className={`pest-fab pest-fab-${pestFabState.status}`} 
        onClick={() => setIsDetectionModalOpen(true)} 
        style={pestFabState.style}
        title="Pest & Disease Detection"
      >
        <div className="pest-fab-icon-wrap">
          {pestFabState.icon}
        </div>
        <div className="pest-fab-text-container">
          <span className="pest-fab-text-default">{pestFabState.textDefault}</span>
          {pestFabState.textHover && (
            <span className="pest-fab-text-hover">{pestFabState.textHover}</span>
          )}
        </div>
      </button>

      {/* HIDDEN FILE INPUTS */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        id="camera-upload" 
        style={{ display: 'none' }} 
        onChange={(e) => { 
          if (e.target.files?.[0]) handleDetection(e.target.files[0]); 
        }} 
      />
      <input 
        type="file" 
        accept="image/*" 
        id="gallery-upload" 
        style={{ display: 'none' }} 
        onChange={(e) => { 
          if (e.target.files?.[0]) handleDetection(e.target.files[0]); 
        }} 
      />

      {/* DETECTION MODAL */}
      {isDetectionModalOpen && (
        <div className="detection-modal-overlay">
          <div className="neo-card detection-modal-card">
            <button className="detection-modal-close" onClick={() => {
              setIsDetectionModalOpen(false);
              setDetectionResult(null);
            }} title="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: 'var(--text-main)' }}>Disease & Pest Detection</h3>
            <p style={{ color: 'var(--text-sub)', fontSize: '13px', margin: '0 0 20px 0' }}>Upload an image of your crop to diagnose diseases or pests.</p>

            {isDetecting ? (
              <div className="detection-loader-container">
                <div className="detection-spinner"></div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>AI Diagnosis in progress...</div>
                <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '6px' }}>Analyzing the crop foliage for health patterns.</div>
              </div>
            ) : detectionResult ? (
              <div className="detection-result-container">
                <div className="detection-result-header">
                  <span className="detection-result-title">{detectionResult.disease_name}</span>
                  <span className="detection-result-confidence">
                    {detectionResult.confidence_level} Confidence
                  </span>
                </div>
                
                <div className="detection-result-section">
                  <div className="detection-result-section-label">Symptoms</div>
                  <div className="detection-result-section-text">{detectionResult.symptoms}</div>
                </div>

                <div className="detection-result-section">
                  <div className="detection-result-section-label">Biological Cause</div>
                  <div className="detection-result-section-text">{detectionResult.cause}</div>
                </div>

                <div className="detection-result-section">
                  <div className="detection-result-section-label">Treatment Recommendation</div>
                  <div className="detection-result-section-text" style={{ whiteSpace: 'pre-line' }}>{detectionResult.treatment}</div>
                </div>

                <div className="detection-result-actions">
                  <button className="btn-filled" style={{ flex: 1, padding: '12px' }} onClick={() => setDetectionResult(null)}>
                    Diagnose Another
                  </button>
                  <button className="btn-outline" style={{ flex: 1, padding: '12px' }} onClick={() => {
                    setIsDetectionModalOpen(false);
                    setDetectionResult(null);
                  }}>
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="detection-options-container">
                <div className="detection-option-card" onClick={() => document.getElementById('camera-upload').click()}>
                  <div className="detection-option-icon">📷</div>
                  <div className="detection-option-title">Take Photo</div>
                  <div className="detection-option-sub">Use Device Camera</div>
                </div>
                
                <div className="detection-option-card" onClick={() => document.getElementById('gallery-upload').click()}>
                  <div className="detection-option-icon">📁</div>
                  <div className="detection-option-title">Upload File</div>
                  <div className="detection-option-sub">From Photo Gallery</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ActionHome;
