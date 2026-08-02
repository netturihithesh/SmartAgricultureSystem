import React, { useEffect, useState, useMemo, useCallback } from 'react';
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

  // Populate substep day numbers evenly across each stage's [start_day, end_day] range if not explicitly provided
  for (const s of tempStages) {
    if (s.substeps && s.substeps.length > 0) {
      const len = s.substeps.length;
      const start = s.start_day || 1;
      const end = s.end_day || start;
      const span = Math.max(0, end - start);

      s.substeps = s.substeps.map((sub, idx) => {
        if (typeof sub === 'object' && sub.day !== null && sub.day !== undefined && !isNaN(sub.day)) {
          return sub;
        }
        const taskText = typeof sub === 'object' ? sub.task : sub;
        const calcDay = len <= 1 ? start : Math.round(start + (idx * span) / (len - 1));
        return { task: taskText, day: calcDay };
      });
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

// ── PANEL ICONS (dark fills, clearly visible on white backgrounds) ──────────
const WeatherSVG = {
  thunderstorm: (
    <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
      <ellipse cx="32" cy="20" rx="20" ry="13" fill="#374151"/>
      <ellipse cx="18" cy="25" rx="13" ry="9" fill="#374151"/>
      <ellipse cx="46" cy="25" rx="13" ry="9" fill="#374151"/>
      <rect x="8" y="25" width="44" height="12" rx="6" fill="#4B5563"/>
      <line x1="18" y1="39" x2="14" y2="52" stroke="#2563EB" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="32" y1="39" x2="28" y2="52" stroke="#2563EB" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="46" y1="39" x2="42" y2="52" stroke="#2563EB" strokeWidth="3.5" strokeLinecap="round"/>
      <polygon points="37,30 27,44 33,44 26,58 42,40 35,40" fill="#F59E0B"/>
    </svg>
  ),
  rain: (
    <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
      <ellipse cx="32" cy="20" rx="20" ry="13" fill="#374151"/>
      <ellipse cx="18" cy="25" rx="13" ry="9" fill="#374151"/>
      <ellipse cx="46" cy="25" rx="13" ry="9" fill="#374151"/>
      <rect x="8" y="25" width="44" height="12" rx="6" fill="#4B5563"/>
      <line x1="16" y1="40" x2="11" y2="56" stroke="#1D4ED8" strokeWidth="4" strokeLinecap="round"/>
      <line x1="28" y1="40" x2="23" y2="56" stroke="#1D4ED8" strokeWidth="4" strokeLinecap="round"/>
      <line x1="40" y1="40" x2="35" y2="56" stroke="#1D4ED8" strokeWidth="4" strokeLinecap="round"/>
      <line x1="50" y1="40" x2="45" y2="56" stroke="#1D4ED8" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  ),
  drizzle: (
    <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
      <ellipse cx="32" cy="22" rx="18" ry="12" fill="#4B5563"/>
      <ellipse cx="20" cy="27" rx="12" ry="8" fill="#4B5563"/>
      <ellipse cx="44" cy="27" rx="12" ry="8" fill="#4B5563"/>
      <rect x="10" y="27" width="40" height="10" rx="5" fill="#6B7280"/>
      <line x1="22" y1="40" x2="18" y2="54" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round"/>
      <line x1="34" y1="40" x2="30" y2="54" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round"/>
      <line x1="46" y1="40" x2="42" y2="54" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  ),
  snow: (
    <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
      <ellipse cx="32" cy="22" rx="18" ry="12" fill="#6B7280"/>
      <ellipse cx="20" cy="27" rx="12" ry="8" fill="#6B7280"/>
      <rect x="10" y="27" width="40" height="10" rx="5" fill="#9CA3AF"/>
      {[16,28,40,52].map(x => (
        <g key={x}>
          <line x1={x} y1="40" x2={x} y2="57" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round"/>
          <line x1={x-6} y1="46" x2={x+6} y2="52" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round"/>
          <line x1={x+6} y1="46" x2={x-6} y2="52" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round"/>
        </g>
      ))}
    </svg>
  ),
  fog: (
    <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
      <rect x="8" y="10" width="48" height="9" rx="4.5" fill="#6B7280"/>
      <rect x="4" y="23" width="56" height="8" rx="4" fill="#4B5563"/>
      <rect x="8" y="35" width="48" height="8" rx="4" fill="#6B7280"/>
      <rect x="4" y="47" width="56" height="8" rx="4" fill="#9CA3AF"/>
    </svg>
  ),
  wind: (
    <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
      <path d="M6 16 Q22 8 40 16 Q50 20 56 14 Q62 8 56 4 Q50 0 44 6" stroke="#1F2937" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <path d="M6 32 Q18 24 36 32 Q46 37 52 31 Q58 25 52 21" stroke="#374151" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M6 48 Q16 40 32 48 Q40 53 46 48" stroke="#4B5563" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  clearDay: (
    <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="16" fill="#FCD34D"/>
      <circle cx="32" cy="32" r="11" fill="#F59E0B"/>
      {[[32,6],[32,58],[6,32],[58,32],[12,12],[52,52],[52,12],[12,52]].map(([x,y],i) => {
        const dx=x-32, dy=y-32, l=Math.sqrt(dx*dx+dy*dy), nx=dx/l, ny=dy/l;
        return <line key={i} x1={32+nx*18} y1={32+ny*18} x2={32+nx*28} y2={32+ny*28} stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round"/>;
      })}
    </svg>
  ),
  clearNight: (
    <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
      <path d="M40 10 A20 20 0 1 1 20 52 A16 16 0 0 0 40 10Z" fill="#1E3A5F"/>
      <circle cx="52" cy="14" r="3.5" fill="#FDE68A"/>
      <circle cx="48" cy="5" r="2.5" fill="#FDE68A"/>
      <circle cx="60" cy="26" r="2" fill="#FDE68A"/>
    </svg>
  ),
  partlyDay: (
    <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
      <circle cx="22" cy="20" r="15" fill="#FCD34D"/>
      <circle cx="22" cy="20" r="10" fill="#F59E0B"/>
      <ellipse cx="40" cy="40" rx="20" ry="13" fill="#CBD5E1"/>
      <ellipse cx="28" cy="44" rx="13" ry="9" fill="#CBD5E1"/>
      <ellipse cx="52" cy="44" rx="13" ry="9" fill="#CBD5E1"/>
      <rect x="17" y="40" width="44" height="13" rx="6.5" fill="#E2E8F0"/>
    </svg>
  ),
  partlyNight: (
    <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
      <path d="M30 6 A18 18 0 1 1 12 40 A14 14 0 0 0 30 6Z" fill="#1E3A5F"/>
      <ellipse cx="44" cy="44" rx="18" ry="12" fill="#CBD5E1"/>
      <ellipse cx="32" cy="48" rx="12" ry="8" fill="#CBD5E1"/>
      <rect x="23" y="44" width="38" height="12" rx="6" fill="#E2E8F0"/>
    </svg>
  ),
  clouds: (
    <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
      <ellipse cx="32" cy="24" rx="20" ry="14" fill="#4B5563"/>
      <ellipse cx="18" cy="30" rx="14" ry="10" fill="#4B5563"/>
      <ellipse cx="46" cy="30" rx="14" ry="10" fill="#4B5563"/>
      <rect x="6" y="30" width="48" height="14" rx="7" fill="#6B7280"/>
    </svg>
  ),
};

// ── HERO ICONS (white/light fills, visible on gradient card background) ───────
const WeatherHeroSVG = {
  thunderstorm: (
    <svg width="92" height="92" viewBox="0 0 64 64" fill="none">
      <ellipse cx="32" cy="20" rx="20" ry="13" fill="rgba(0,0,0,0.35)"/>
      <ellipse cx="18" cy="25" rx="13" ry="9" fill="rgba(0,0,0,0.3)"/>
      <ellipse cx="46" cy="25" rx="13" ry="9" fill="rgba(0,0,0,0.3)"/>
      <rect x="8" y="25" width="44" height="12" rx="6" fill="rgba(0,0,0,0.25)"/>
      <line x1="18" y1="39" x2="14" y2="52" stroke="#BFDBFE" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="32" y1="39" x2="28" y2="52" stroke="#BFDBFE" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="46" y1="39" x2="42" y2="52" stroke="#BFDBFE" strokeWidth="3.5" strokeLinecap="round"/>
      <polygon points="37,30 27,44 33,44 26,58 42,40 35,40" fill="#FCD34D"/>
    </svg>
  ),
  rain: (
    <svg width="92" height="92" viewBox="0 0 64 64" fill="none">
      <ellipse cx="32" cy="20" rx="20" ry="13" fill="rgba(255,255,255,0.28)"/>
      <ellipse cx="18" cy="25" rx="13" ry="9" fill="rgba(255,255,255,0.22)"/>
      <ellipse cx="46" cy="25" rx="13" ry="9" fill="rgba(255,255,255,0.22)"/>
      <rect x="8" y="25" width="44" height="12" rx="6" fill="rgba(255,255,255,0.33)"/>
      <line x1="16" y1="40" x2="11" y2="56" stroke="white" strokeWidth="4" strokeLinecap="round"/>
      <line x1="28" y1="40" x2="23" y2="56" stroke="white" strokeWidth="4" strokeLinecap="round"/>
      <line x1="40" y1="40" x2="35" y2="56" stroke="white" strokeWidth="4" strokeLinecap="round"/>
      <line x1="50" y1="40" x2="45" y2="56" stroke="white" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  ),
  drizzle: (
    <svg width="92" height="92" viewBox="0 0 64 64" fill="none">
      <ellipse cx="32" cy="22" rx="18" ry="12" fill="rgba(255,255,255,0.3)"/>
      <ellipse cx="20" cy="27" rx="12" ry="8" fill="rgba(255,255,255,0.25)"/>
      <rect x="10" y="27" width="40" height="10" rx="5" fill="rgba(255,255,255,0.35)"/>
      <line x1="22" y1="40" x2="18" y2="54" stroke="#BFDBFE" strokeWidth="3" strokeLinecap="round"/>
      <line x1="34" y1="40" x2="30" y2="54" stroke="#BFDBFE" strokeWidth="3" strokeLinecap="round"/>
      <line x1="46" y1="40" x2="42" y2="54" stroke="#BFDBFE" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  ),
  snow: (
    <svg width="92" height="92" viewBox="0 0 64 64" fill="none">
      <ellipse cx="32" cy="22" rx="18" ry="12" fill="rgba(255,255,255,0.4)"/>
      <ellipse cx="20" cy="27" rx="12" ry="8" fill="rgba(255,255,255,0.35)"/>
      <rect x="10" y="27" width="40" height="10" rx="5" fill="rgba(255,255,255,0.45)"/>
      {[16,28,40,52].map(x => (
        <g key={x}>
          <line x1={x} y1="40" x2={x} y2="57" stroke="white" strokeWidth="3" strokeLinecap="round"/>
          <line x1={x-6} y1="46" x2={x+6} y2="52" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <line x1={x+6} y1="46" x2={x-6} y2="52" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </g>
      ))}
    </svg>
  ),
  fog: (
    <svg width="92" height="92" viewBox="0 0 64 64" fill="none">
      <rect x="8" y="10" width="48" height="9" rx="4.5" fill="rgba(255,255,255,0.55)"/>
      <rect x="4" y="23" width="56" height="8" rx="4" fill="rgba(255,255,255,0.45)"/>
      <rect x="8" y="35" width="48" height="8" rx="4" fill="rgba(255,255,255,0.35)"/>
      <rect x="4" y="47" width="56" height="8" rx="4" fill="rgba(255,255,255,0.2)"/>
    </svg>
  ),
  wind: (
    <svg width="92" height="92" viewBox="0 0 64 64" fill="none">
      <path d="M6 16 Q22 8 40 16 Q50 20 56 14 Q62 8 56 4" stroke="rgba(255,255,255,0.95)" strokeWidth="4" strokeLinecap="round" fill="none"/>
      <path d="M6 32 Q18 24 36 32 Q46 37 52 31" stroke="rgba(255,255,255,0.75)" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M6 48 Q16 40 32 48 Q40 53 46 48" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  clearDay: (
    <svg width="92" height="92" viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="22" fill="#FDE68A" opacity="0.35"/>
      <circle cx="32" cy="32" r="16" fill="#FCD34D"/>
      <circle cx="32" cy="32" r="11" fill="#F59E0B"/>
      {[[32,4],[32,60],[4,32],[60,32],[10,10],[54,54],[54,10],[10,54]].map(([x,y],i) => {
        const dx=x-32, dy=y-32, l=Math.sqrt(dx*dx+dy*dy), nx=dx/l, ny=dy/l;
        return <line key={i} x1={32+nx*20} y1={32+ny*20} x2={32+nx*30} y2={32+ny*30} stroke="#FDE68A" strokeWidth="4.5" strokeLinecap="round"/>;
      })}
    </svg>
  ),
  clearNight: (
    <svg width="92" height="92" viewBox="0 0 64 64" fill="none">
      <path d="M42 8 A26 26 0 1 1 18 56 A21 21 0 0 0 42 8Z" fill="#DBEAFE" opacity="0.95"/>
      <circle cx="56" cy="14" r="4" fill="#FDE68A"/>
      <circle cx="50" cy="5" r="2.5" fill="#FDE68A"/>
      <circle cx="62" cy="28" r="2" fill="#FDE68A"/>
      <circle cx="58" cy="6" r="1.5" fill="white" opacity="0.6"/>
    </svg>
  ),
  partlyDay: (
    <svg width="92" height="92" viewBox="0 0 64 64" fill="none">
      <circle cx="20" cy="18" r="16" fill="#FDE68A" opacity="0.4"/>
      <circle cx="20" cy="18" r="13" fill="#FCD34D"/>
      <circle cx="20" cy="18" r="9" fill="#F59E0B"/>
      <ellipse cx="40" cy="42" rx="22" ry="14" fill="white" opacity="0.97"/>
      <ellipse cx="27" cy="46" rx="14" ry="10" fill="white" opacity="0.97"/>
      <ellipse cx="53" cy="46" rx="14" ry="10" fill="white" opacity="0.97"/>
      <rect x="15" y="42" width="46" height="15" rx="7.5" fill="white"/>
    </svg>
  ),
  partlyNight: (
    <svg width="92" height="92" viewBox="0 0 64 64" fill="none">
      <path d="M28 6 A18 18 0 1 1 12 40 A14 14 0 0 0 28 6Z" fill="#DBEAFE" opacity="0.9"/>
      <ellipse cx="44" cy="44" rx="20" ry="13" fill="rgba(255,255,255,0.88)"/>
      <ellipse cx="31" cy="48" rx="13" ry="9" fill="rgba(255,255,255,0.88)"/>
      <rect x="23" y="44" width="40" height="14" rx="7" fill="white" opacity="0.93"/>
    </svg>
  ),
  clouds: (
    <svg width="92" height="92" viewBox="0 0 64 64" fill="none">
      <ellipse cx="32" cy="22" rx="22" ry="15" fill="rgba(255,255,255,0.45)"/>
      <ellipse cx="18" cy="28" rx="15" ry="11" fill="rgba(255,255,255,0.55)"/>
      <ellipse cx="46" cy="28" rx="15" ry="11" fill="rgba(255,255,255,0.55)"/>
      <rect x="6" y="28" width="52" height="18" rx="9" fill="white" opacity="0.93"/>
    </svg>
  ),
};

// ── WEATHER THEME GRADIENTS (card background per weather state) ────────────
const WEATHER_THEMES = {
  thunderstorm: 'linear-gradient(180deg, #1F2937 0%, #374151 30%, #56647A 60%, #8FA0B4 100%)',
  rain:         'linear-gradient(180deg, #243B55 0%, #3A5470 35%, #5578A0 65%, #8DB4CF 100%)',
  drizzle:      'linear-gradient(180deg, #3A5570 0%, #527590 40%, #7AA0B8 70%, #B8D0E0 100%)',
  snow:         'linear-gradient(180deg, #4A7FA8 0%, #6EA0C4 40%, #A8CCDF 70%, #E2F0F8 100%)',
  fog:          'linear-gradient(180deg, #4B5563 0%, #6B7280 40%, #9CA3AF 70%, #D1D5DB 100%)',
  wind:         'linear-gradient(180deg, #2D5F7A 0%, #4A85A0 40%, #7EB0C6 70%, #C0DDE8 100%)',
  clearNight:   'linear-gradient(180deg, #0C1829 0%, #1A3356 35%, #2D5080 65%, #6B93B8 100%)',
  clearDay:     'linear-gradient(180deg, #1D6BDB 0%, #3685F0 40%, #5BADF8 70%, #BAE3FF 100%)',
  partlyDay:    'linear-gradient(180deg, #4A90E2 0%, #7BB8F5 40%, #B8D9F8 70%, #F0F7FF 100%)',
  partlyNight:  'linear-gradient(180deg, #1A3A60 0%, #2E5585 40%, #4D7DB5 65%, #8EBDE0 100%)',
  default:      'linear-gradient(180deg, #4A90E2 0%, #7BB8F5 40%, #B8D9F8 70%, #F0F7FF 100%)',
};

const getWeatherThemeKey = (weatherMain, windKmh, isNight) => {
  if (!weatherMain) return 'default';
  if (weatherMain === 'Thunderstorm') return 'thunderstorm';
  if (weatherMain === 'Rain')         return 'rain';
  if (weatherMain === 'Drizzle')      return 'drizzle';
  if (weatherMain === 'Snow')         return 'snow';
  if (weatherMain === 'Fog' || weatherMain === 'Mist' || weatherMain === 'Haze' || weatherMain === 'Smoke') return 'fog';
  if (windKmh > 25)                   return 'wind';
  if (weatherMain === 'Clear')        return isNight ? 'clearNight' : 'clearDay';
  if (weatherMain === 'Clouds')       return isNight ? 'partlyNight' : 'partlyDay';
  return 'default';
};

const getForecastIcon = (main, speed, dt) => {
  const speedKmh = speed ? Math.round(speed * 3.6) : 0;
  const isNight = dt ? (() => { const h = new Date(dt * 1000).getHours(); return h < 6 || h >= 19; })() : false;
  if (main === 'Thunderstorm') return WeatherSVG.thunderstorm;
  if (main === 'Snow')         return WeatherSVG.snow;
  if (main === 'Drizzle')      return WeatherSVG.drizzle;
  if (main === 'Rain')         return WeatherSVG.rain;
  if (main === 'Fog' || main === 'Mist' || main === 'Haze' || main === 'Smoke') return WeatherSVG.fog;
  if (speedKmh > 20)           return WeatherSVG.wind;
  if (main === 'Clear')        return isNight ? WeatherSVG.clearNight : WeatherSVG.clearDay;
  if (main === 'Clouds')       return isNight ? WeatherSVG.partlyNight : WeatherSVG.partlyDay;
  return WeatherSVG.clouds;
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


  const [expandedStage, setExpandedStage] = useState(null);
  const [activeJourneyStageId, setActiveJourneyStageId] = useState(null);
  const [substepStatus, setSubstepStatus] = useState({});
  const [dynamicSchedule, setDynamicSchedule] = useState(null);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
  const [binModalOpen, setBinModalOpen] = useState(false);
  const [binnedCrops, setBinnedCrops] = useState([]);
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

  const landSizeNum = useMemo(() => {
    const raw = profile?.land_size || selectedCrop?.land_size || 1.5;
    const parsed = parseFloat(raw.toString().replace(/[^0-9.]/g, ''));
    return isNaN(parsed) || parsed <= 0 ? 1.5 : parsed;
  }, [profile, selectedCrop]);

  const formattedUserName = useMemo(() => {
    if (!profile?.full_name) return 'Farmer';
    return profile.full_name.replace(/[*,\s]+/g, ' ').trim() || 'Farmer';
  }, [profile]);

  const adjustedProfitData = useMemo(() => {
    if (!selectedCrop) return null;
    return calculateProfitSnapshot(
      cropEconomics,
      landSizeNum,
      selectedCrop.total_duration_days,
      selectedCrop.crop_name,
      weatherYieldImpact
    );
  }, [selectedCrop, cropEconomics, landSizeNum, weatherYieldImpact]);

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
    if (!cropObj) return;
    // Normalize name: remove spaces before "(" so "Paddy (Common)" matches "Paddy(Common)"
    const normalizeName = (n) => (n || '').replace(/\s*\(/g, '(').toLowerCase().trim();
    const rawName = cropObj.cropName || cropObj.crop_name || cropObj.name || '';
    const targetName = normalizeName(rawName);
    
    let crop = cropProcessData.find(c => normalizeName(c.crop_name) === targetName);
    if (!crop) {
      crop = cropProcessData.find(c => targetName.includes(normalizeName(c.crop_name)) || normalizeName(c.crop_name).includes(targetName)) || cropProcessData[0];
    }
    
    if (crop) {
      crop = adjustStageRanges(crop);
      const rawDate = cropObj.startDate || cropObj.start_date || cropObj.created_at;
      const parsedStart = rawDate ? new Date(rawDate) : new Date();
      const start = isNaN(parsedStart.getTime()) ? new Date() : parsedStart;

      const today = new Date();
      const diffTime = today.getTime() - start.getTime();
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      setSelectedCrop(crop);
      setCropStartDate(start);
      setDaysPassed(diffDays);

      const currentStage = calculateCurrentStage(crop.stages, diffDays);
      setExpandedStage(currentStage?.stage_id);

      const cd = cropDataList.find(c => normalizeName(c.api_name) === targetName || normalizeName(c.name) === targetName);
      if (cd && cd.economics) {
        setCropEconomics(cd.economics);
      } else {
        setCropEconomics(null);
      }

      let tasks = [];
      for (const stage of crop.stages) {
        if (stage.end_day >= diffDays) {
          for (let sub of stage.substeps) {
             const subTask = typeof sub === 'object' ? sub.task : sub;
             const targetAbsoluteDay = typeof sub === 'object' ? sub.day : stage.start_day;
             if (targetAbsoluteDay > diffDays) {
                 let daysFromNow = targetAbsoluteDay - diffDays;
                 let label = `Day ${targetAbsoluteDay}`;
                 if (daysFromNow === 1) label = 'Tomorrow';
                 else if (daysFromNow <= 7) label = `In ${daysFromNow} days`;
                 
                 tasks.push({ day: label, task: subTask });
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

  const refreshBinnedCrops = useCallback(() => {
    if (!session?.user?.id) return;
    const rawBin = JSON.parse(localStorage.getItem(`binned_crops_${session.user.id}`) || '[]');
    const now = new Date();
    const validBin = rawBin.filter(c => {
      if (!c.deletedAt) return false;
      const delDate = new Date(c.deletedAt);
      const diffDays = (now - delDate) / (1000 * 60 * 60 * 24);
      return diffDays <= 3;
    });
    if (validBin.length !== rawBin.length) {
      localStorage.setItem(`binned_crops_${session.user.id}`, JSON.stringify(validBin));
    }
    setBinnedCrops(validBin);
  }, [session]);

  useEffect(() => {
    refreshBinnedCrops();
  }, [refreshBinnedCrops, binModalOpen]);

  const requestDelete = () => setDeleteConfirmOpen(true);

  const handleConfirmDelete = () => {
    if (!userCrops[activeCropIndex]) return;
    const current = userCrops[activeCropIndex];
    const bin = JSON.parse(localStorage.getItem(`binned_crops_${session.user.id}`) || '[]');
    
    const binnedItem = {
      id: current.id || `crop_${Date.now()}`,
      cropName: current.cropName || current.crop_name || (selectedCrop ? selectedCrop.crop_name : 'Crop'),
      startDate: current.startDate || (cropStartDate ? cropStartDate.toISOString() : new Date().toISOString()),
      deletedAt: new Date().toISOString()
    };

    const newBin = [...bin, binnedItem];
    localStorage.setItem(`binned_crops_${session.user.id}`, JSON.stringify(newBin));
    setBinnedCrops(newBin);

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
    setAlertConfig({ open: true, message: `${binnedItem.cropName} moved to Recycle Bin`, type: 'info' });
  };

  const handleRestoreFromBin = (binnedId) => {
    if (userCrops.length >= 2) {
      setAlertConfig({ open: true, message: 'Maximum 2 active crops allowed. Please delete or swap an active crop first.', type: 'warning' });
      return;
    }
    const bin = JSON.parse(localStorage.getItem(`binned_crops_${session.user.id}`) || '[]');
    const cropToRestore = bin.find(c => c.id === binnedId);
    if (!cropToRestore) return;
    
    const deletedDate = new Date(cropToRestore.deletedAt);
    const daysInBin = (new Date() - deletedDate) / (1000 * 60 * 60 * 24);
    if (daysInBin > 3) {
      setAlertConfig({ open: true, message: 'This crop has been in the bin for more than 3 days and expired.', type: 'error' });
      const cleanedBin = bin.filter(c => c.id !== binnedId);
      localStorage.setItem(`binned_crops_${session.user.id}`, JSON.stringify(cleanedBin));
      setBinnedCrops(cleanedBin);
      return;
    }

    const restoredCrop = {
      id: cropToRestore.id,
      cropName: cropToRestore.cropName,
      startDate: cropToRestore.startDate
    };

    const newCrops = [...userCrops, restoredCrop];
    setUserCrops(newCrops);
    localStorage.setItem(`user_crops_${session.user.id}`, JSON.stringify(newCrops));
    
    const newBin = bin.filter(c => c.id !== binnedId);
    localStorage.setItem(`binned_crops_${session.user.id}`, JSON.stringify(newBin));
    setBinnedCrops(newBin);

    const newIndex = newCrops.length - 1;
    setActiveCropIndex(newIndex);
    localStorage.setItem(`active_crop_index_${session.user.id}`, newIndex.toString());
    loadCropView(restoredCrop);
    setBinModalOpen(false);
    setAlertConfig({ open: true, message: `${restoredCrop.cropName} restored successfully!`, type: 'success' });
  };

  const handlePermanentDelete = (binnedId) => {
    const bin = JSON.parse(localStorage.getItem(`binned_crops_${session.user.id}`) || '[]');
    const updatedBin = bin.filter(c => c.id !== binnedId);
    localStorage.setItem(`binned_crops_${session.user.id}`, JSON.stringify(updatedBin));
    setBinnedCrops(updatedBin);
    setAlertConfig({ open: true, message: 'Crop permanently deleted.', type: 'info' });
  };

  const currentStage = useMemo(() => {
    if (!selectedCrop) return null;
    return calculateCurrentStage(selectedCrop.stages, daysPassed);
  }, [selectedCrop, daysPassed]);

  const todaysTasks = useMemo(() => {
    if (!selectedCrop || !currentStage) return [];
    
    const stageId = currentStage.stage_id;
    const substeps = currentStage.substeps || [];
    
    return substeps.map((sub, idx) => {
      const isDone = substepStatus && substepStatus[`${stageId}_${idx}`];
      const taskText = typeof sub === 'object' ? sub.task : sub;
      const taskDay = typeof sub === 'object' ? sub.day : currentStage.start_day;
      
      let statusTag = '';
      let statusClass = '';
      
      if (isDone) {
        statusTag = 'Completed';
        statusClass = 'completed';
      } else if (taskDay === daysPassed) {
        statusTag = 'Due Today';
        statusClass = 'due-today';
      } else if (taskDay < daysPassed) {
        statusTag = 'Past Due';
        statusClass = 'past-due';
      } else {
        statusTag = 'Upcoming';
        statusClass = 'upcoming';
      }
      
      // Calculate calendar date for the task
      let taskDateStr = '';
      if (cropStartDate) {
        const d = new Date(new Date(cropStartDate).getTime() + (taskDay - 1) * 86400000);
        if (!isNaN(d.getTime())) {
          taskDateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        }
      }
      
      return {
        idx,
        task: taskText,
        day: taskDay,
        dateStr: taskDateStr,
        isDone,
        statusTag,
        statusClass,
        stageId,
      };
    });
  }, [selectedCrop, currentStage, daysPassed, substepStatus, cropStartDate]);

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
      
      {/* ── MAIN TWO-COLUMN DASHBOARD GRID ─────────────────────────────── */}
      <div className="dashboard-main-columns">
        
        {/* ── LEFT MAIN COLUMN ────────────────────────────────────────── */}
        <div className="dashboard-left-col">
          
          {/* HERO BANNER CARD WITH INTEGRATED LANDSCAPE & EMBEDDED PROGRESS RING */}
          <div className="hero-banner-card">
            <div className="hero-landscape-svg-wrap">
              <svg viewBox="0 0 900 240" fill="none" preserveAspectRatio="xMidYMid slice" className="landscape-svg">
                <defs>
                  <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F4FAF5"/>
                    <stop offset="100%" stopColor="#E2F4E7"/>
                  </linearGradient>
                  <linearGradient id="hillGrad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2E7D32"/>
                    <stop offset="100%" stopColor="#1B5E20"/>
                  </linearGradient>
                  <linearGradient id="hillGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4CAF50"/>
                    <stop offset="100%" stopColor="#2E7D32"/>
                  </linearGradient>
                </defs>
                <rect width="900" height="240" fill="url(#skyGrad)"/>
                <path d="M120 35 C140 18 180 18 200 35 C220 25 260 35 270 55 C280 75 260 90 240 90 L110 90 C90 90 80 75 100 55 Z" fill="rgba(255,255,255,0.7)"/>
                <path d="M580 45 C600 30 630 30 650 45 C665 40 690 45 700 60 C710 75 695 88 680 88 L570 88 Z" fill="rgba(255,255,255,0.6)"/>
                <path d="M0 150 Q250 80 500 140 T1000 110 L1000 240 L0 240 Z" fill="url(#hillGrad1)" opacity="0.45"/>
                <path d="M420 135 L424 85 L428 135 Z" fill="#1B5E20"/>
                <circle cx="424" cy="85" r="14" fill="none" stroke="#1B5E20" strokeWidth="1.5" strokeDasharray="3 3"/>
                <path d="M350 135 L370 115 L390 135 L390 155 L350 155 Z" fill="#A04000"/>
                <path d="M350 135 L370 115 L390 135 Z" fill="#78281F"/>
                <path d="M0 170 Q350 110 700 160 T1000 140 L1000 240 L0 240 Z" fill="url(#hillGrad2)"/>
                <path d="M-50 195 Q200 150 500 200 T1000 170 L1000 240 L-50 240 Z" fill="#1B5E20" opacity="0.85"/>
              </svg>
            </div>

            <div className="hero-banner-left-text">
              <span className="hero-greeting">{getGreeting()},</span>
              <h1 className="hero-user-name">{formattedUserName}</h1>
              <div className="hero-badge-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>Active Farmer</span>
              </div>
            </div>

            {/* EMBEDDED CROP PROGRESS CARD ON RIGHT SIDE OF HERO */}
            <div className="hero-crop-progress-card">
              {selectedCrop ? (
                <div className="progress-ring-container">
                  <svg className="progress-ring-svg" width="124" height="124" viewBox="0 0 120 120">
                    <circle className="progress-ring-bg" cx="60" cy="60" r="50"></circle>
                    <circle className="progress-ring-fill" cx="60" cy="60" r="50" style={{strokeDasharray: 314, strokeDashoffset: 314 * (1 - progressPercentage / 100)}}></circle>
                  </svg>
                  <div className="progress-ring-text">
                    <span className="progress-percent-val">{progressPercentage}%</span>
                    <span className="progress-title-lbl">Crop Progress</span>
                    <span className="progress-days-lbl">Day {daysPassed} / {selectedCrop.total_duration_days}</span>
                  </div>
                  <div className="ring-leaf-badge">🌱</div>
                </div>
              ) : (
                <div className="progress-empty-state">No Active Crop</div>
              )}
            </div>
          </div>

          {/* HIGH WIND WARNING ALERT BANNER */}
          <div className="weather-alert-banner-row">
            <div className="alert-banner-content warning">
              <div className="alert-banner-left">
                <div className="alert-warning-icon-badge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <div className="alert-text-body">
                  <span className="alert-heading">High Wind Warning</span>
                  <span className="alert-detail-text">Wind Speed: 22 km/h • Risk of crop stress. Avoid chemical spraying due to drift.</span>
                </div>
              </div>
              <svg className="alert-chevron-right" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>

          {/* ACTIVE CROP MAIN CARD */}
          {selectedCrop ? (
            <div className="card-box active-crop-main-card">
              {/* Top Banner Row */}
              <div className="crop-banner-top-row">
                <div className="crop-header-left">
                  <div className="crop-avatar-circle" title="Active Crop Avatar">
                    <svg width="56" height="56" viewBox="0 0 64 64" fill="none">
                      <path d="M14 52C16 38 24 24 36 16C28 26 24 38 22 52Z" fill="#16A34A"/>
                      <path d="M12 52C14 42 10 32 4 26C10 32 14 42 14 52Z" fill="#22C55E"/>
                      <path d="M22 56C24 40 32 24 46 10" stroke="#CA8A04" strokeWidth="3" strokeLinecap="round"/>
                      <path d="M22 56C28 38 42 20 54 14" stroke="#EAB308" strokeWidth="2.5" strokeLinecap="round"/>
                      {[
                        [46,10],[42,14],[38,18],[34,22],[30,26],[26,30],
                        [54,14],[50,18],[46,22],[42,26],[38,30],[34,34]
                      ].map(([x,y], i) => (
                        <g key={i}>
                          <ellipse cx={x} cy={y} rx="3.5" ry="6" fill="#F59E0B" transform={`rotate(${i % 2 === 0 ? 35 : -35} ${x} ${y})`}/>
                          <ellipse cx={x} cy={y} rx="2" ry="4.5" fill="#FDE047" transform={`rotate(${i % 2 === 0 ? 35 : -35} ${x} ${y})`}/>
                        </g>
                      ))}
                    </svg>
                  </div>
                  <div className="crop-title-group">
                    <h2 className="crop-name-heading">{selectedCrop.crop_name || 'Paddy (Basmati)'}</h2>
                    <div 
                      className="crop-stage-pill" 
                      onClick={() => { const el = document.querySelector('.crop-journey-card'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
                      style={{ cursor: 'pointer' }}
                      title="Click to view Crop Journey Stages"
                    >
                      <span>{currentStage?.title || 'Fertilizer Application'} Stage</span>
                    </div>
                  </div>
                </div>

                <div 
                  className="crop-tip-card"
                  onClick={() => { const el = document.querySelector('.todays-work-card') || document.querySelector('.crop-journey-card'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
                  style={{ cursor: 'pointer' }}
                  title="Click to view recommendations & stage tasks"
                >
                  <div className="tip-icon-circle">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8.5 14.5A5 5 0 0 1 12 5a5 5 0 0 1 3.5 9.5c-.7.7-1.5 1.6-1.5 2.5V18h-4v-1c0-.9-.8-1.8-1.5-2.5z"/>
                      <path d="M9 21h6"/>
                    </svg>
                  </div>
                  <div className="tip-text-body">
                    <span className="tip-label"><strong>Tip:</strong> Apply fertilizer in the next 3 days for best yield.</span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </div>

              {/* Middle Row: 4 Interactive Metric Cards */}
              <div className="crop-stats-four-cols">
                <div 
                  className="crop-stat-card-pill"
                  onClick={() => navigate('/dashboard/calendar')}
                  style={{ cursor: 'pointer' }}
                  title="Click to view Farm Calendar"
                >
                  <div className="stat-icon-box green">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <div className="stat-text-meta">
                    <span className="stat-lbl-sm">Expected Harvest</span>
                    <span className="stat-val-bold">
                      {new Date(new Date(cropStartDate).getTime() + selectedCrop.total_duration_days * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div 
                  className="crop-stat-card-pill"
                  onClick={() => { const el = document.querySelector('.crop-journey-card'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
                  style={{ cursor: 'pointer' }}
                  title="Click to view Stage Details"
                >
                  <div className="stat-icon-box green">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 10v12"/>
                      <path d="M12 10C12 10 8 7 5 9c0 0 1 5 7 5"/>
                      <path d="M12 10C12 10 16 7 19 9c0 0-1 5-7 5"/>
                    </svg>
                  </div>
                  <div className="stat-text-meta" style={{ flex: 1 }}>
                    <span className="stat-lbl-sm">Current Stage</span>
                    <span className="stat-val-bold">{currentStage?.stage_id || 4} of {selectedCrop.stages?.length || 8} Stages</span>
                    <div className="stat-progress-bar-track">
                      <div 
                        className="stat-progress-bar-fill" 
                        style={{ width: `${Math.min(100, Math.round(((currentStage?.stage_id || 4) / (selectedCrop.stages?.length || 8)) * 100))}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div 
                  className="crop-stat-card-pill"
                  onClick={() => { const el = document.querySelector('.crop-calendar-card'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
                  style={{ cursor: 'pointer' }}
                  title="Click to view Crop Daily Calendar"
                >
                  <div className="stat-icon-box green">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <div className="stat-text-meta">
                    <span className="stat-lbl-sm">Total Days</span>
                    <span className="stat-val-bold">Day {daysPassed} / {selectedCrop.total_duration_days}</span>
                  </div>
                </div>

                <div 
                  className="crop-stat-card-pill"
                  onClick={() => navigate('/dashboard/analytics')}
                  style={{ cursor: 'pointer' }}
                  title="Click to view Farm Analytics"
                >
                  <div className="stat-icon-box green">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3h18v18H3z"/>
                      <path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
                    </svg>
                  </div>
                  <div className="stat-text-meta">
                    <span className="stat-lbl-sm">Field Area</span>
                    <span className="stat-val-bold">{landSizeNum} Acres</span>
                  </div>
                </div>
              </div>

              {/* Bottom Row Buttons */}
              <div className="crop-card-actions-subrow">
                <div className="left-btn-group">
                  <button className="btn-predict-crop-gradient" onClick={() => navigate('/recommendation')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h-2"/>
                      <path d="M17.8 5.2L16.4 6.6"/><path d="M12.2 10.8L10.8 12.2"/><path d="M17.8 12.8L16.4 11.4"/><path d="M12.2 7.2L10.8 5.8"/>
                      <path d="M4 14l3.5-3.5a1.5 1.5 0 0 1 2.1 0l7.8 7.8a1.5 1.5 0 0 1 0 2.1L14 24"/>
                    </svg>
                    <span>Predict Crop</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </button>

                  {userCrops.length === 2 ? (
                    <button className="btn-outline-green-pill" onClick={handleSwapCrop}>Swap Crop</button>
                  ) : (
                    <button className="btn-outline-green-pill" onClick={() => navigate('/add-crop')}>+ Add 2nd Crop</button>
                  )}

                  <button className="btn-outline-red-pill" onClick={requestDelete} title="Move to Trash">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    <span>Delete Crop</span>
                  </button>
                </div>

                <button className="recycle-bin-card-btn" onClick={() => setBinModalOpen(true)}>
                  <div className="recycle-icon-box">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10"/>
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                    </svg>
                  </div>
                  <div className="recycle-meta">
                    <span className="r-title">Recycle Bin</span>
                    <span className="r-sub">View deleted crops</span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="card-box no-crop-state-card">
              <div className="no-crop-header-area">
                <h3>Start Your Farming Journey</h3>
                <p>Register a crop or use AI recommendations to get started.</p>
              </div>
              <div className="no-crop-actions-row">
                <div className="left-btn-group">
                  <button className="btn-predict-crop-gradient" onClick={() => navigate('/add-crop')}>
                    <span style={{ fontSize: '16px' }}>+</span>
                    <span>Add Crop</span>
                  </button>

                  <button className="btn-outline-green-pill" onClick={() => navigate('/recommendation')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h-2"/>
                      <path d="M17.8 5.2L16.4 6.6"/><path d="M12.2 10.8L10.8 12.2"/><path d="M17.8 12.8L16.4 11.4"/><path d="M12.2 7.2L10.8 5.8"/>
                      <path d="M4 14l3.5-3.5a1.5 1.5 0 0 1 2.1 0l7.8 7.8a1.5 1.5 0 0 1 0 2.1L14 24"/>
                    </svg>
                    <span>Predict Crop</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </button>
                </div>

                <button className="recycle-bin-card-btn" onClick={() => setBinModalOpen(true)}>
                  <div className="recycle-icon-box">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10"/>
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                    </svg>
                  </div>
                  <div className="recycle-meta">
                    <span className="r-title">Recycle Bin</span>
                    <span className="r-sub">View deleted crops</span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
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
                <span className="day-counter-pill">📅 Day {daysPassed}</span>
              </div>

              <div className="weather-advisor-inner-banner">
                <div className="advisor-warning-badge">
                  <span className="sun-icon">☀️</span>
                  <span>WEATHER ADVISOR (FARM: {profile?.location?.split(',')[0]?.toUpperCase() || 'KAMAREDDY'})</span>
                </div>
                <p className="advisor-desc-text">Avoid pesticide spraying today to prevent chemical drift.</p>
              </div>

              <div className="todays-tasks-list">
                {/* DYNAMIC WIND WARNING TASK */}
                {farmWeather?.weather?.wind?.speed && Math.round(farmWeather.weather.wind.speed * 3.6) > 20 && (
                  <div className="task-row-item active-urgent" style={{ borderLeft: '4px solid #DC2626', background: '#FEF2F2' }}>
                    <div className="task-left-check">
                      <span style={{ fontSize: '18px', marginRight: '8px' }}>🚩</span>
                      <div className="task-title-desc">
                        <h4 className="task-heading" style={{ color: '#991B1B', fontWeight: 800 }}>
                          Secure trellises and crop support posts
                          <span className="task-alert-tag" style={{ background: '#DC2626', color: '#FFFFFF', fontSize: '9px', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', fontWeight: 900 }}>WIND ALERT</span>
                        </h4>
                        <p className="task-subtext" style={{ color: '#7F1D1D', fontSize: '12px' }}>
                          Wind speed is high ({Math.round(farmWeather.weather.wind.speed * 3.6)} km/h). Prevent damage to seedlings.
                        </p>
                      </div>
                    </div>
                    <div className="task-right-meta">
                      <span className="t-day-val" style={{ color: '#991B1B' }}>Day {daysPassed}</span>
                      <span className="t-status-tag" style={{ background: '#FEE2E2', color: '#991B1B', fontWeight: 700 }}>High Risk</span>
                    </div>
                  </div>
                )}

                {/* DYNAMIC CROP JOURNEY TASKS */}
                {todaysTasks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: '#64748B' }}>
                    No tasks scheduled for the current stage.
                  </div>
                ) : (
                  todaysTasks.map(t => (
                    <div 
                      key={t.idx} 
                      className={`task-row-item ${t.isDone ? 'completed' : t.statusClass}`}
                      onClick={() => toggleSubstep(t.stageId, t.idx)}
                      style={{ cursor: 'pointer', transition: 'all 0.2s ease', opacity: t.isDone ? 0.7 : 1 }}
                    >
                      <div className="task-left-check">
                        <span className={`circle-radio ${t.isDone ? 'checked' : ''}`} style={{ flexShrink: 0, marginRight: '12px' }}>
                          {t.isDone && <span className="check-dot" style={{ display: 'block', width: '6px', height: '6px', backgroundColor: '#fff', borderRadius: '50%', margin: 'auto' }} />}
                        </span>
                        <div className="task-title-desc">
                          <h4 className="task-heading" style={{ textDecoration: t.isDone ? 'line-through' : 'none', color: t.isDone ? '#9CA3AF' : '#0F172A', fontWeight: 700 }}>
                            {t.task}
                          </h4>
                        </div>
                      </div>
                      <div className="task-right-meta">
                        <span className="t-day-val">Day {t.day}</span>
                        {t.dateStr && <span className="t-date-val">{t.dateStr}</span>}
                        <span className={`t-status-tag ${t.statusClass}`}>
                          {t.statusTag}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* EXPANDED & INTERACTIVE CROP JOURNEY CARD IN MAIN COLUMN */}
          {selectedCrop && (
            <div className="card-box crop-journey-card">
              <div className="card-title-header-row" style={{marginBottom: '20px'}}>
                <div>
                  <h3 className="card-main-title">Crop Journey</h3>
                  <span className="card-date-sub">Click any stage to inspect details & task checklist</span>
                </div>
                <span className="day-counter-pill">Stage {(activeJourneyStageId || currentStage?.stage_id || 4)} of {selectedCrop.stages?.length || 8}</span>
              </div>
              
              <div className="journey-pipeline-nodes-row">
                {(selectedCrop.stages || [
                  { stage_id: 1, title: 'Land Prep.', start_day: 1, end_day: 15 },
                  { stage_id: 2, title: 'Seed Prep.', start_day: 16, end_day: 30 },
                  { stage_id: 3, title: 'Transplant.', start_day: 31, end_day: 36 },
                  { stage_id: 4, title: 'Fertilizer Application', start_day: 37, end_day: 71 },
                  { stage_id: 5, title: 'Water Man.', start_day: 72, end_day: 90 },
                  { stage_id: 6, title: 'Pest & Dis.', start_day: 91, end_day: 110 },
                  { stage_id: 7, title: 'Harvesting', start_day: 111, end_day: 130 },
                  { stage_id: 8, title: 'Post Harv.', start_day: 131, end_day: 140 }
                ]).map((stg) => {
                  const currentCurId = currentStage?.stage_id || 4;
                  const isDone = stg.stage_id < currentCurId;
                  const isSelected = stg.stage_id === (activeJourneyStageId || currentCurId);
                  const statusClass = isSelected ? 'active' : (isDone ? 'done' : 'pending');

                  return (
                    <div 
                      key={stg.stage_id} 
                      className={`node-item ${statusClass}`}
                      onClick={() => setActiveJourneyStageId(stg.stage_id)}
                      style={{ cursor: 'pointer' }}
                      title={`Click to view Stage ${stg.stage_id}: ${stg.title}`}
                    >
                      <div className="node-circle">
                        {isDone ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        ) : stg.stage_id}
                      </div>
                      <span className="node-label">
                        {stg.title.length > 12 ? stg.title.slice(0, 10) + '...' : stg.title}
                      </span>
                    </div>
                  );
                })}
              </div>

              {(() => {
                const activeStgId = activeJourneyStageId || currentStage?.stage_id || 4;
                const activeStgObj = selectedCrop.stages?.find(s => s.stage_id === activeStgId) || currentStage || {
                  title: 'Fertilizer Application',
                  start_day: 37,
                  end_day: 71,
                  substeps: [
                    { task: 'Apply basal dose of NPK', day: 37 },
                    { task: 'Apply top dressing of Urea in splits', day: 54 },
                    { task: 'Apply Zinc sulfate to prevent Khaira disease', day: 71 }
                  ]
                };

                const isCurrent = activeStgId === (currentStage?.stage_id || 4);
                const isPast = activeStgId < (currentStage?.stage_id || 4);
                const statusTag = isCurrent ? 'In Progress' : (isPast ? 'Completed' : 'Upcoming');
                
                let pct = 0;
                if (isPast) pct = 100;
                else if (isCurrent) {
                  const totalStageDays = (activeStgObj.end_day - activeStgObj.start_day) || 1;
                  pct = Math.min(100, Math.max(0, Math.round(((daysPassed - activeStgObj.start_day) / totalStageDays) * 100)));
                }

                return (
                  <div className="journey-active-stage-panel">
                    <div className="stage-panel-head">
                      <h4 className="stage-title">{activeStgObj.title} — <span style={{color: isCurrent ? '#059669' : (isPast ? '#2563EB' : '#6B7280')}}>{statusTag}</span></h4>
                      <span className="stage-dates">
                        {cropStartDate && !isNaN(new Date(cropStartDate).getTime()) ? (
                          <>
                            {new Date(new Date(cropStartDate).getTime() + (activeStgObj.start_day - 1) * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(new Date(cropStartDate).getTime() + (activeStgObj.end_day - 1) * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • Day {activeStgObj.start_day}–{activeStgObj.end_day}
                          </>
                        ) : (
                          <>Day {activeStgObj.start_day} — Day {activeStgObj.end_day}</>
                        )}
                      </span>
                    </div>
                    <div className="stage-progress-bar-wrap">
                      <div className="stage-progress-fill" style={{width: `${pct}%`}}></div>
                    </div>
                    <span className="stage-progress-lbl">{pct}% of stage complete</span>

                    <div className="stage-substeps-checklist">
                      {activeStgObj.substeps?.map((sub, idx) => {
                        const isSubDone = isPast || (substepStatus && substepStatus[`${activeStgObj.stage_id}_${idx}`]);
                        const subTask = typeof sub === 'object' ? sub.task : sub;
                        const subDayNum = typeof sub === 'object' ? sub.day : null;
                        
                        let targetDay = subDayNum;
                        if (targetDay === null || targetDay === undefined || isNaN(targetDay)) {
                          const totalSubs = activeStgObj.substeps.length;
                          const start = activeStgObj.start_day || 1;
                          const end = activeStgObj.end_day || start;
                          const span = Math.max(0, end - start);
                          targetDay = totalSubs <= 1 ? start : Math.round(start + (idx * span) / (totalSubs - 1));
                        }

                        let subDateFormatted = `Day ${targetDay}`;
                        if (cropStartDate && !isNaN(new Date(cropStartDate).getTime())) {
                          const calDate = new Date(new Date(cropStartDate).getTime() + (targetDay - 1) * 86400000);
                          if (!isNaN(calDate.getTime())) {
                            subDateFormatted = `${calDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} (Day ${targetDay})`;
                          }
                        }

                        return (
                          <div 
                            key={idx} 
                            className="checklist-subitem"
                            onClick={() => toggleSubstep(activeStgObj.stage_id, idx)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="check-left">
                              <span className={`circle-radio ${isSubDone ? 'checked' : ''}`}>
                                {isSubDone && <span className="check-dot">✓</span>}
                              </span>
                              <span style={{ textDecoration: isSubDone ? 'line-through' : 'none', color: isSubDone ? '#9CA3AF' : 'inherit' }}>
                                {subTask}
                              </span>
                            </div>
                            <span className="subitem-date">{subDateFormatted}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

        </div>

        {/* ── RIGHT COLUMN ────────────────────────────────────────────── */}
        <div className="dashboard-right-col">
          
          {/* ── UNIFIED WEATHER + METRICS + SOIL CARD ── */}
          {(() => {
            const _wMain   = displayWeather?.weather?.weather[0]?.main || null;
            const _windKmh = displayWeather?.weather ? Math.round(displayWeather.weather.wind.speed * 3.6) : 10;
            const _curHr   = new Date().getHours();
            const _isNight = _curHr < 6 || _curHr >= 19;
            const _themeKey = getWeatherThemeKey(_wMain, _windKmh, _isNight);
            const _heroBg  = WEATHER_THEMES[_themeKey];
            const _heroIcon = (() => {
              const key = _themeKey;
              if (key === 'thunderstorm') return WeatherHeroSVG.thunderstorm;
              if (key === 'rain')         return WeatherHeroSVG.rain;
              if (key === 'drizzle')      return WeatherHeroSVG.drizzle;
              if (key === 'snow')         return WeatherHeroSVG.snow;
              if (key === 'fog')          return WeatherHeroSVG.fog;
              if (key === 'wind')         return WeatherHeroSVG.wind;
              if (key === 'clearNight')   return WeatherHeroSVG.clearNight;
              if (key === 'clearDay')     return WeatherHeroSVG.clearDay;
              if (key === 'partlyNight')  return WeatherHeroSVG.partlyNight;
              return WeatherHeroSVG.partlyDay;
            })();
            return (
          <div className="unified-weather-card" style={{ background: _heroBg }}>

            {/* TOP: location + live pill */}
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

            {/* BODY: big temperature + cloud/sun illustration */}
            <div className="weather-widget-body">
              <div className="weather-temp-group">
                <span className="weather-temp-val">
                  {displayWeather?.weather ? Math.round(displayWeather.weather.main.temp) : 25}°<span className="unit-c">C</span>
                </span>
                <div className="weather-desc-group">
                  <span className="weather-main-cond">{displayWeather?.weather?.weather[0]?.main || 'Clouds'}</span>
                  <span className="weather-sub-meta">
                    {displayWeather?.weather?.weather[0]?.description || 'Few Clouds'} • Feels like {displayWeather?.weather ? Math.round(displayWeather.weather.main.feels_like) : 23}° • AQI 32 – Good
                  </span>
                </div>
              </div>
              <div className="weather-icon-illustration" style={{width:96,height:96,display:'flex',alignItems:'center',justifyContent:'center'}}>
                {_heroIcon}
              </div>
            </div>

            {/* WHITE PANEL 1: Hourly forecast */}
            <div className="unified-inner-panel forecast-inner-panel">
              {displayWeather?.forecast ? displayWeather.forecast.slice(0, 5).map((f, idx) => (
                <div key={idx} className="fhu-item">
                  <span className="fhu-lbl">{idx === 0 ? 'Now' : formatForecastHour(f.dt)}</span>
                  <span className="fhu-icon">{getForecastIcon(f.weather[0]?.main, f.wind?.speed, f.dt)}</span>
                  <span className="fhu-temp">{Math.round(f.main.temp)}°</span>
                </div>
              )) : (
                <>
                  <div className="fhu-item"><span className="fhu-lbl">Now</span><span className="fhu-icon">{WeatherSVG.clouds}</span><span className="fhu-temp">25°</span></div>
                  <div className="fhu-item"><span className="fhu-lbl">8 AM</span><span className="fhu-icon">{WeatherSVG.wind}</span><span className="fhu-temp">25°</span></div>
                  <div className="fhu-item"><span className="fhu-lbl">11 AM</span><span className="fhu-icon">{WeatherSVG.partlyDay}</span><span className="fhu-temp">26°</span></div>
                  <div className="fhu-item"><span className="fhu-lbl">2 PM</span><span className="fhu-icon">{WeatherSVG.rain}</span><span className="fhu-temp">27°</span></div>
                  <div className="fhu-item"><span className="fhu-lbl">5 PM</span><span className="fhu-icon">{WeatherSVG.rain}</span><span className="fhu-temp">28°</span></div>
                </>
              )}
            </div>

{/* WHITE PANEL 2: 5 weather metrics – professional SVG icons */}
            <div className="unified-inner-panel metrics-inner-panel">
              <div className="um-item">
                <div className="um-icon red">
                  {/* Thermometer */}
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0Z" fill="#EF4444" opacity="0.15" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="11.5" cy="19" r="2.5" fill="#EF4444"/>
                    <line x1="11.5" y1="14" x2="11.5" y2="7" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="um-val">{displayWeather?.weather ? Math.round(displayWeather.weather.main.temp) : 25}°C</span>
                <span className="um-lbl">Temp</span>
              </div>
              <div className="um-item">
                <div className="um-icon blue">
                  {/* Water drop */}
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C12 2 5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13Z" fill="#3B82F6" opacity="0.15" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 19a4 4 0 0 1-4-4" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="um-val">{displayWeather?.weather ? displayWeather.weather.main.humidity : 81}%</span>
                <span className="um-lbl">Humidity</span>
              </div>
              <div className="um-item">
                <div className="um-icon cyan">
                  {/* Wind lines */}
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0891B2" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M5 8h10a3 3 0 1 0-3-3"/>
                    <path d="M5 12h14a3 3 0 1 1-3 3"/>
                    <path d="M5 16h8"/>
                  </svg>
                </div>
                <span className="um-val">{displayWeather?.weather ? Math.round(displayWeather.weather.wind.speed * 3.6) : 21}<span className="um-unit"> km/h</span></span>
                <span className="um-lbl">Wind</span>
              </div>
              <div className="um-item">
                <div className="um-icon purple">
                  {/* Umbrella / rain */}
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 12a11.05 11.05 0 0 0-22 0zm-5 7a3 3 0 0 1-6 0v-7"/>
                  </svg>
                </div>
                <span className="um-val">0%</span>
                <span className="um-lbl">Rain</span>
              </div>
              <div className="um-item">
                <div className="um-icon amber">
                  {/* Sun / UV */}
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="5" fill="#F59E0B" opacity="0.25" stroke="#F59E0B" strokeWidth="1.5"/>
                    <circle cx="12" cy="12" r="3" fill="#F59E0B"/>
                    <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="um-val">4</span>
                <span className="um-lbl">UV Index</span>
              </div>
            </div>

{/* WHITE PANEL 3: 4 soil items – professional SVG icons */}
            <div className="unified-inner-panel soil-inner-panel">
              <div className="sui-item">
                <div className="sui-icon green">
                  {/* Soil moisture – layered ground wave */}
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M3 17c2-2 4-3 6-1s4 3 6 1 4-3 6-1" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                    <path d="M3 21c2-2 4-3 6-1s4 3 6 1 4-3 6-1" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.5"/>
                    <path d="M12 3v8" stroke="#059669" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M9 6l3-3 3 3" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="sui-text">
                  <span className="sui-lbl">Soil Moisture</span>
                  <span className="sui-val green">Good</span>
                </div>
                <div className="sui-bar green"></div>
              </div>
              <div className="sui-divider"></div>
              <div className="sui-item">
                <div className="sui-icon blue">
                  {/* Irrigation – tap/droplet */}
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C12 2 6 9 6 14a6 6 0 0 0 12 0c0-5-6-12-6-12Z" fill="#2563EB" fillOpacity="0.12"/>
                    <path d="M12 18a3 3 0 0 1-3-3"/>
                  </svg>
                </div>
                <div className="sui-text">
                  <span className="sui-lbl">Irrigation Need</span>
                  <span className="sui-val blue">Moderate</span>
                </div>
                <div className="sui-bar blue"></div>
              </div>
              <div className="sui-divider"></div>
              <div className="sui-item">
                <div className="sui-icon yellow">
                  {/* Crop growth – sprouting seedling */}
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22V12"/>
                    <path d="M12 12C12 12 8 9 5 11c0 0 1 5 7 5"/>
                    <path d="M12 12C12 12 16 9 19 11c0 0-1 5-7 5"/>
                    <path d="M12 12C12 7 10 4 10 4s4 1 4 8"/>
                  </svg>
                </div>
                <div className="sui-text">
                  <span className="sui-lbl">Crop Growth</span>
                  <span className="sui-val green">+1.0%</span>
                </div>
                <div className="sui-bar green"></div>
              </div>
              <div className="sui-divider"></div>
              <div className="sui-item">
                <div className="sui-icon teal">
                  {/* Pest risk – shield checkmark */}
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" fill="#0D9488" fillOpacity="0.1"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                </div>
                <div className="sui-text">
                  <span className="sui-lbl">Pest Risk</span>
                  <span className="sui-val green">Low</span>
                </div>
                <div className="sui-bar green"></div>
              </div>
            </div>

          </div>
          );
          })()}

          {/* 4. PROFIT SNAPSHOT CARD (Fully Dynamic & Weather-Adjusted) */}
          {selectedCrop && adjustedProfitData && (
            <div className="card-box profit-snapshot-card">
              <div className="profit-card-header">
                <div>
                  <h3 className="card-main-title">Profit Snapshot</h3>
                  <span className="profit-crop-sub">{selectedCrop.crop_name} • {profile?.land_size || '1.5'} Acres</span>
                </div>
                <span className={`yield-impact-badge ${weatherYieldImpact >= 0 ? 'positive' : 'negative'}`}>
                  {weatherYieldImpact >= 0 ? `+${(weatherYieldImpact * 100).toFixed(1)}%` : `${(weatherYieldImpact * 100).toFixed(1)}%`} Yield Impact
                </span>
              </div>

              <div className="profit-main-amount-block">
                <span className="profit-amount-lbl">EXPECTED PROFIT (WEATHER ADJUSTED)</span>
                <h2 className="profit-amount-val">
                  ₹{(adjustedProfitData.totalProfit || 0).toLocaleString('en-IN')}
                </h2>
              </div>

              <div className="profit-three-metrics-grid">
                <div className="profit-metric-item">
                  <span className="pm-lbl">EST. YIELD</span>
                  <span className="pm-val">{adjustedProfitData.totalYield || 0} q</span>
                </div>
                <div className="profit-metric-item">
                  <span className="pm-lbl">MKT PRICE</span>
                  <span className="pm-val">₹{(adjustedProfitData.marketPricePerQ || 2400).toLocaleString('en-IN')}/q</span>
                </div>
                <div className="profit-metric-item">
                  <span className="pm-lbl">MONTHLY</span>
                  <span className="pm-val">₹{(adjustedProfitData.monthlyIncome || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="profit-wave-accent">
                <svg viewBox="0 0 400 30" preserveAspectRatio="none" style={{width: '100%', height: '30px', display: 'block'}}>
                  <path d="M0 15 Q100 0 200 15 T400 15 L400 30 L0 30 Z" fill="rgba(5, 150, 105, 0.08)"/>
                </svg>
              </div>
            </div>
          )}

          {/* 5. CROP DAILY CALENDAR CARD (Moved to Right Column below Profit Snapshot) */}
          {selectedCrop && (
            <div style={{ marginTop: '20px' }}>
              <CropCalendarCard 
                selectedCrop={selectedCrop} 
                cropStartDate={cropStartDate} 
                daysPassed={daysPassed} 
                substepStatus={substepStatus} 
              />
            </div>
          )}

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

      {/* RECYCLE BIN MODAL */}
      {binModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(10, 13, 11, 0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}>
          <div style={{ width: '90%', maxWidth: '520px', margin: 0, maxHeight: '80vh', overflowY: 'auto', padding: '24px 28px', borderRadius: '24px', background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 20px 40px rgba(0,0,0,0.18)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10"/>
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>Recycle Bin</h3>
                    <span style={{ fontSize: '12px', color: '#64748B' }}>Deleted crops are retained for 3 days</span>
                  </div>
                </div>
                <button onClick={() => setBinModalOpen(false)} style={{ background: '#F1F5F9', border: 'none', color: '#64748B', width: '32px', height: '32px', borderRadius: '50%', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
             </div>
             
             {binnedCrops.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '40px 16px', color: '#64748B', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                 <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                     <polyline points="23 4 23 10 17 10"/>
                     <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                   </svg>
                 </div>
                 <span style={{ fontWeight: 700, fontSize: '15px', color: '#334155' }}>Recycle Bin is Empty</span>
                 <span style={{ fontSize: '12px', color: '#94A3B8' }}>Deleted crops will appear here and can be restored anytime within 3 days.</span>
               </div>
             ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 {binnedCrops.map(dc => {
                   const delDate = new Date(dc.deletedAt);
                   const daysAgo = Math.floor((new Date() - delDate) / (1000 * 60 * 60 * 24));
                   const daysLeft = Math.max(0, 3 - daysAgo);
                   return (
                     <div key={dc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '14px 18px', flexWrap: 'wrap', gap: '12px' }}>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                         <div style={{ fontWeight: 800, fontSize: '15px', color: '#0F172A' }}>{dc.cropName || dc.crop_name}</div>
                         <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                           <span>Deleted {delDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                           <span>•</span>
                           <span style={{ color: '#D97706', fontWeight: 600 }}>Expires in {daysLeft} day{daysLeft === 1 ? '' : 's'}</span>
                         </div>
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                         <button 
                           onClick={() => handleRestoreFromBin(dc.id)} 
                           style={{ background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', padding: '8px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '12px', transition: 'all 0.2s ease' }}
                         >
                           Restore
                         </button>
                         <button 
                           onClick={() => handlePermanentDelete(dc.id)} 
                           style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '8px 12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}
                           title="Permanently Delete"
                         >
                           Delete
                         </button>
                       </div>
                     </div>
                   );
                 })}
               </div>
             )}
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(10, 13, 11, 0.8)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="neo-card" style={{ width: '90%', maxWidth: '440px', margin: 0, padding: '24px' }}>
              <h3 className="section-title" style={{ margin: '0 0 12px 0', color: 'var(--danger-red)' }}>Move Crop to Recycle Bin?</h3>
              <p style={{ color: 'var(--text-sub)', fontSize: '14px', lineHeight: 1.5, marginBottom: '24px' }}>
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
