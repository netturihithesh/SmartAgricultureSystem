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

const getCropEmoji = (name) => {
  if (!name) return '🌱';
  const n = name.toLowerCase();
  if (n.includes('paddy')) return '🌾';
  if (n.includes('cotton')) return '☁️';
  if (n.includes('sugarcane')) return '🎋';
  if (n.includes('turmeric')) return '🎗️';
  if (n.includes('mango')) return '🥭';
  if (n.includes('chili') || n.includes('chilli')) return '🌶️';
  if (n.includes('castor')) return '🫘';
  if (n.includes('maize')) return '🌽';
  if (n.includes('banana')) return '🍌';
  if (n.includes('tomato')) return '🍅';
  if (n.includes('potato')) return '🥔';
  if (n.includes('onion')) return '🧅';
  if (n.includes('papaya')) return '🌿';
  return '🌱';
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
      
      {/* ── TOP HERO 3-CARD ROW ────────────────────────────────────────── */}
      <div className="top-cards-row">
        
        {/* CARD 1: GREEN HERO CARD */}
        <div className="hero-banner-card">
          <div className="hero-banner-content">
            <span className="hero-greeting">{getGreeting()},</span>
            <h1 className="hero-user-name">{profile?.full_name || 'Netturi Hitheshsena Reddy'}</h1>
            <div className="hero-badge-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>Active Farmer</span>
            </div>
          </div>
          <div className="hero-leaf-graphic">
            <svg width="180" height="180" viewBox="0 0 200 200" fill="none">
              <path d="M40 160C40 160 80 140 110 90C140 40 180 20 180 20C180 20 160 60 110 90C60 120 40 160 40 160Z" fill="rgba(255, 255, 255, 0.15)"/>
              <path d="M20 180C20 180 70 150 90 100C110 50 140 30 140 30C140 30 120 70 90 100C60 130 20 180 20 180Z" fill="rgba(255, 255, 255, 0.1)"/>
            </svg>
          </div>
        </div>

        {/* CARD 2: CROP PROGRESS CARD */}
        <div className="crop-progress-card">
          <h3 className="card-section-title">Crop Progress</h3>
          {selectedCrop ? (
            <div className="progress-ring-container">
              <svg className="progress-ring-svg" width="120" height="120" viewBox="0 0 120 120">
                <circle className="progress-ring-bg" cx="60" cy="60" r="50"></circle>
                <circle className="progress-ring-fill" cx="60" cy="60" r="50" style={{strokeDasharray: 314, strokeDashoffset: 314 * (1 - progressPercentage / 100)}}></circle>
              </svg>
              <div className="progress-ring-text">
                <span className="progress-percent-val">{progressPercentage}%</span>
                <span className="progress-days-lbl">Day {daysPassed} / {selectedCrop.total_duration_days}</span>
              </div>
            </div>
          ) : (
            <div className="progress-empty-state">No Active Crop</div>
          )}
        </div>

        {/* CARD 3: LIVE WEATHER WIDGET CARD */}
        <div className="weather-widget-card">
          <div className="weather-widget-top">
            <div className="weather-location-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{profile?.location || 'Kamareddy, Telangana'}</span>
            </div>
            <div className="weather-live-pill">
              <span className="live-dot-indicator"></span> LIVE
            </div>
          </div>

          <div className="weather-widget-body">
            <div className="weather-temp-group">
              <span className="weather-temp-val">
                {displayWeather?.weather ? Math.round(displayWeather.weather.main.temp) : 25}°
              </span>
              <div className="weather-desc-group">
                <span className="weather-main-cond">{displayWeather?.weather?.weather[0]?.main || 'Clouds'}</span>
                <span className="weather-sub-meta">
                  {displayWeather?.weather?.weather[0]?.description || 'Few Clouds'} • Feels like {displayWeather?.weather ? Math.round(displayWeather.weather.main.feels_like) : 23}° • AQI 32 - Good
                </span>
              </div>
            </div>
            <div className="weather-icon-illustration">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="10" r="5" fill="#FBBF24"/>
                <path d="M19.5 17.5A3.5 3.5 0 0 0 21 14c0-2.5-2-4.5-4.5-4.5-.4-3.5-3-6-6.5-6-3.5 0-6.5 2.5-6.5 6C1.5 10 0 12 0 14.5 0 17 2 19 4.5 19h12" fill="#FFFFFF" opacity="0.9"/>
              </svg>
            </div>
          </div>

          <div className="weather-forecast-hourly-bar">
            {displayWeather?.forecast ? displayWeather.forecast.slice(0, 5).map((f, idx) => (
              <div key={idx} className="forecast-hour-item">
                <span className="f-hour-lbl">{idx === 0 ? 'NOW' : formatForecastHour(f.dt)}</span>
                <span className="f-hour-icon">{getForecastIcon(f.weather[0]?.main, f.wind?.speed, f.dt)}</span>
                <span className="f-hour-temp">{Math.round(f.main.temp)}°</span>
              </div>
            )) : (
              <>
                <div className="forecast-hour-item"><span className="f-hour-lbl">NOW</span><span className="f-hour-temp">25°</span></div>
                <div className="forecast-hour-item"><span className="f-hour-lbl">8 AM</span><span className="f-hour-temp">25°</span></div>
                <div className="forecast-hour-item"><span className="f-hour-lbl">11 AM</span><span className="f-hour-temp">26°</span></div>
                <div className="forecast-hour-item"><span className="f-hour-lbl">2 PM</span><span className="f-hour-temp">27°</span></div>
                <div className="forecast-hour-item"><span className="f-hour-lbl">5 PM</span><span className="f-hour-temp">28°</span></div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* ── WEATHER WARNING BANNER ROW ─────────────────────────────────── */}
      <div className="weather-alert-banner-row">
        <div className="alert-banner-content warning">
          <div className="alert-banner-left">
            <div className="alert-warning-icon-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div className="alert-text-body">
              <span className="alert-heading">High Wind Warning</span>
              <span className="alert-detail-text">Wind Speed: 22 km/h • Risk of crop stress. Avoid chemical spraying due to drift.</span>
            </div>
          </div>
          <svg className="alert-chevron-right" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </div>

      {/* ── MAIN TWO-COLUMN DASHBOARD GRID ─────────────────────────────── */}
      <div className="dashboard-main-columns">
        
        {/* ── LEFT MAIN COLUMN ────────────────────────────────────────── */}
        <div className="dashboard-left-col">
          
          {/* ACTIVE CROP MAIN CARD */}
          {selectedCrop ? (
            <div className="card-box active-crop-main-card">
              <div className="crop-header-flex">
                <div className="crop-sprout-icon-box">
                  <span className="crop-emoji-icon">{getCropEmoji(selectedCrop.crop_name)}</span>
                </div>
                <div className="crop-title-group">
                  <h2 className="crop-name-heading">{selectedCrop.crop_name}</h2>
                  <div className="crop-stage-outline-pill">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
                    </svg>
                    <span>{currentStage?.title || 'Initialization'}</span>
                  </div>
                </div>

                <div className="crop-stats-three-cols">
                  <div className="crop-stat-item">
                    <div className="stat-icon-circle green">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    </div>
                    <div className="stat-text-meta">
                      <span className="stat-lbl-sm">EXPECTED HARVEST</span>
                      <span className="stat-val-bold">
                        {new Date(new Date(cropStartDate).getTime() + selectedCrop.total_duration_days * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="stat-v-divider"></div>

                  <div className="crop-stat-item">
                    <div className="stat-icon-circle green">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                      </svg>
                    </div>
                    <div className="stat-text-meta">
                      <span className="stat-lbl-sm">CURRENT STAGE</span>
                      <span className="stat-val-bold">{currentStage?.stage_id || 1} of {selectedCrop.stages.length} Stages</span>
                    </div>
                  </div>

                  <div className="stat-v-divider"></div>

                  <div className="crop-stat-item">
                    <div className="stat-icon-circle green">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    </div>
                    <div className="stat-text-meta">
                      <span className="stat-lbl-sm">TOTAL DAYS</span>
                      <span className="stat-val-bold">Day {daysPassed} / {selectedCrop.total_duration_days}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="crop-card-actions-subrow">
                <div className="left-btn-group">
                  <button className="btn-solid-teal" onClick={() => navigate('/dashboard/calendar')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '6px'}}>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    View Full Journey
                  </button>
                  {userCrops.length === 2 ? (
                    <button className="btn-outline-green" onClick={handleSwapCrop}>Swap Crop</button>
                  ) : (
                    <button className="btn-outline-green" onClick={() => navigate('/add-crop')}>+ Add 2nd Crop</button>
                  )}
                  <button className="btn-outline-red" onClick={requestDelete} title="Move to Trash">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '6px'}}>
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    Delete Crop
                  </button>
                </div>

                <button className="recycle-bin-card-btn" onClick={() => setBinModalOpen(true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                    <path d="M3 3v5h5"/>
                  </svg>
                  <div className="recycle-meta">
                    <span className="r-title">Recycle Bin</span>
                    <span className="r-sub">View deleted crops</span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="card-box no-crop-state-card">
              <h3>Start Your Farming Journey</h3>
              <p>Register a crop or use AI recommendations to get started.</p>
              <button className="btn-solid-teal" onClick={() => navigate('/add-crop')}>+ Add Crop</button>
            </div>
          )}

          {/* TODAY'S WORK CARD */}
          {selectedCrop && currentStage && (
            <div className="card-box todays-work-card">
              <div className="card-title-header-row">
                <div>
                  <h3 className="card-main-title">Today's Work</h3>
                  <span className="card-date-sub">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <span className="day-counter-pill">Day {daysPassed}</span>
              </div>

              <div className="weather-advisor-inner-banner">
                <div className="advisor-warning-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2.5">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <span>WEATHER ADVISOR (FARM: {profile?.location?.split(',')[0] || 'KAMAREDDY'})</span>
                </div>
                <p className="advisor-desc-text">Avoid pesticide spraying today to prevent chemical drift.</p>
              </div>

              <div className="todays-tasks-list">
                {/* Active Urgent Wind Task */}
                <div className="task-row-item active-urgent">
                  <div className="task-left-check">
                    <div className="radio-check-circle"></div>
                    <div className="task-title-desc">
                      <h4 className="task-heading">
                        🚩 Secure trellises, strappings, and crop support posts
                        <span className="task-alert-tag">WIND ALERT</span>
                      </h4>
                      <p className="task-subtext">Wind speed is high (22 km/h). Prevent damage to seedlings and tall crop stalks.</p>
                    </div>
                  </div>
                  <div className="task-right-meta">
                    <span className="t-day-val">Day {daysPassed}</span>
                    <span className="t-date-val">Aug 2</span>
                    <span className="t-status-tag optimal">Optimal timing</span>
                  </div>
                </div>

                {/* Past Due Task */}
                <div className="task-row-item past-due">
                  <div className="task-left-check">
                    <div className="radio-check-circle"></div>
                    <div className="task-title-desc">
                      <h4 className="task-heading">Apply basal dose of NPK</h4>
                    </div>
                  </div>
                  <div className="task-right-meta">
                    <span className="t-day-val">Day 37</span>
                    <span className="t-date-val">Jul 21</span>
                    <span className="t-status-tag red">Past Due</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CROP DAILY CALENDAR CARD */}
          {selectedCrop && (
            <CropCalendarCard 
              selectedCrop={selectedCrop} 
              cropStartDate={cropStartDate} 
              daysPassed={daysPassed} 
              substepStatus={substepStatus} 
            />
          )}

        </div>

        {/* ── RIGHT COLUMN ────────────────────────────────────────────── */}
        <div className="dashboard-right-col">
          
          {/* PROFIT SNAPSHOT CARD */}
          <div className="card-box profit-snapshot-card">
            <div className="profit-card-header">
              <h3 className="card-main-title">Profit Snapshot</h3>
              <div className="profit-crop-tag-flex">
                <span className="profit-crop-name">{selectedCrop ? selectedCrop.crop_name : 'Paddy(Basmati)'}</span>
                <span className="yield-impact-badge">+0.3% Yield Impact</span>
              </div>
            </div>

            <div className="profit-main-amount-block">
              <span className="profit-amount-lbl">EXPECTED PROFIT (WEATHER ADJUSTED)</span>
              <h2 className="profit-amount-val">₹1,23,570</h2>
            </div>

            <div className="profit-three-metrics-grid">
              <div className="profit-metric-item">
                <span className="pm-lbl">EST. YIELD</span>
                <span className="pm-val">144 q</span>
              </div>
              <div className="profit-metric-item">
                <span className="pm-lbl">MKT PRICE</span>
                <span className="pm-val">₹2,300/q</span>
              </div>
              <div className="profit-metric-item">
                <span className="pm-lbl">MONTHLY</span>
                <span className="pm-val">₹20,595</span>
              </div>
            </div>
          </div>

          {/* CROP JOURNEY CARD */}
          {selectedCrop && (
            <div className="card-box crop-journey-card">
              <h3 className="card-main-title" style={{marginBottom: '20px'}}>Crop Journey</h3>
              
              <div className="journey-pipeline-nodes-row">
                {selectedCrop.stages.map((stage, idx) => {
                  const status = stage.stage_id < currentStage?.stage_id ? 'done' : (stage.stage_id === currentStage?.stage_id ? 'active' : 'pending');
                  return (
                    <div key={idx} className={`node-item ${status}`} onClick={() => setExpandedStage(stage.stage_id)}>
                      <div className="node-circle">
                        {status === 'done' ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        ) : stage.stage_id}
                      </div>
                      <span className="node-label">{stage.title.slice(0, 8)}...</span>
                    </div>
                  );
                })}
              </div>

              {/* Active Stage Detail Panel */}
              <div className="journey-active-stage-panel">
                <div className="stage-panel-head">
                  <h4 className="stage-title">{currentStage?.title || 'Fertilizer Application'} — In Progress</h4>
                  <span className="stage-dates">Day 37 — Day 71</span>
                </div>
              </div>
            </div>
          )}

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
