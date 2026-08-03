import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Grid, Paper, Avatar, CircularProgress, Button, Chip, Container } from '@mui/material';
import { 
  WbSunny, WaterDrop, Air, Waves, Spoke, DeviceThermostat, Cloud, 
  LocationOn, Refresh, CheckCircle, AccessTime, Cancel, Warning, 
  Visibility, Speed, Navigation, ArrowForwardIos, FilterVintage,
  Spa, CalendarToday, NightsStay, Thunderstorm, AcUnit, Grain
} from '@mui/icons-material';
import { supabase } from '../supabase';
import { fetchWeatherAndAlerts } from '../services/weatherService';
import cropProcessData from '../data/crop_process.json';

const WeatherCenter = () => {
  const [profile, setProfile] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('Updated 10 min ago');
  const [activeCrop, setActiveCrop] = useState(null);

  useEffect(() => {
    loadWeatherContext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadWeatherContext = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      let userLocation = 'Kamareddy, Telangana';
      if (session?.user?.id) {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profileData) {
          setProfile(profileData);
          if (profileData.location) userLocation = profileData.location;
        }

        try {
          const crops = JSON.parse(localStorage.getItem(`user_crops_${session.user.id}`) || '[]');
          if (Array.isArray(crops) && crops.length > 0) {
            let activeIndex = parseInt(localStorage.getItem(`active_crop_index_${session.user.id}`) || '0');
            if (isNaN(activeIndex) || activeIndex >= crops.length) activeIndex = 0;
            const rawName = crops[activeIndex]?.cropName || crops[activeIndex]?.crop_name || '';
            const targetName = rawName.toLowerCase();
            const found = cropProcessData.find(c => c.crop_name && c.crop_name.toLowerCase().includes(targetName));
            if (found) setActiveCrop(found);
          }
        } catch (error) {
          console.warn("Failed to load crops from localStorage", error);
        }
      }

      if (!activeCrop) {
        setActiveCrop(cropProcessData[0]);
      }

      const res = await fetchWeatherAndAlerts(userLocation, import.meta.env.VITE_OPENWEATHER_API_KEY, forceRefresh);
      if (res) {
        setWeatherData(res);
      }
      setLastUpdated(`Updated ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`);
    } catch (e) {
      console.error("Weather init error", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUseGPS = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = { lat: position.coords.latitude, lon: position.coords.longitude };
          const res = await fetchWeatherAndAlerts(coords, import.meta.env.VITE_OPENWEATHER_API_KEY, true);
          if (res) {
            setWeatherData(res);
            setLastUpdated(`Updated ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`);
          }
          setLoading(false);
        },
        (error) => {
          console.error("GPS error", error);
          setLoading(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const currTemp = weatherData?.weather ? Math.round(weatherData.weather.main.temp) : 31;
  const feelsLike = weatherData?.weather ? Math.round(weatherData.weather.main.feels_like) : 33;
  const conditionMain = weatherData?.weather?.weather[0]?.main || 'Sunny';

  const hourlyForecastData = useMemo(() => {
    if (!weatherData?.forecastList) {
      return [
        { time: 'Now', temp: 31, rain: '20%', condition: 'Sunny', isCurrent: true },
        { time: '9 AM', temp: 30, rain: '10%', condition: 'Sunny' },
        { time: '12 PM', temp: 32, rain: '20%', condition: 'Clouds' },
        { time: '3 PM', temp: 30, rain: '40%', condition: 'Rain' },
        { time: '6 PM', temp: 28, rain: '20%', condition: 'Clouds' },
        { time: '9 PM', temp: 26, rain: '10%', condition: 'Clouds' },
      ];
    }
    return weatherData.forecastList.slice(0, 6).map((item, idx) => {
      const isCurrent = idx === 0;
      const timeStr = isCurrent ? 'Now' : new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
      return {
        time: timeStr,
        temp: Math.round(item.main.temp),
        rain: `${Math.round((item.pop || 0) * 100)}%`,
        condition: item.weather[0]?.main || 'Clear',
        isCurrent
      };
    });
  }, [weatherData]);

  const weeklyForecastData = useMemo(() => {
    if (!weatherData?.forecastList) {
      return [
        { day: 'Mon', max: 31, min: 24, rain: '10%', icon: '☀️' },
        { day: 'Tue', max: 30, min: 23, rain: '70%', icon: '🌧️' },
        { day: 'Wed', max: 29, min: 23, rain: '60%', icon: '☁️' },
        { day: 'Thu', max: 31, min: 24, rain: '20%', icon: '⛅' },
        { day: 'Fri', max: 30, min: 24, rain: '60%', icon: '🌧️' },
        { day: 'Sat', max: 31, min: 24, rain: '20%', icon: '⛅' },
        { day: 'Sun', max: 32, min: 24, rain: '10%', icon: '☀️' },
      ];
    }
    
    const dailyMap = {};
    weatherData.forecastList.forEach(item => {
      const dateStr = new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = { max: -100, min: 100, pop: 0, condition: item.weather[0]?.main || 'Clear' };
      }
      if (item.main.temp_max > dailyMap[dateStr].max) dailyMap[dateStr].max = item.main.temp_max;
      if (item.main.temp_min < dailyMap[dateStr].min) dailyMap[dateStr].min = item.main.temp_min;
      if ((item.pop || 0) > dailyMap[dateStr].pop) dailyMap[dateStr].pop = item.pop;
    });

    return Object.keys(dailyMap).slice(0, 7).map(day => {
      const condition = dailyMap[day].condition;
      let icon = '☀️';
      if (condition === 'Rain') icon = '🌧️';
      else if (condition === 'Clouds') icon = '☁️';
      else if (condition === 'Clear') icon = '☀️';
      else icon = '⛅';

      return {
        day: day,
        max: Math.round(dailyMap[day].max),
        min: Math.round(dailyMap[day].min),
        rain: `${Math.round(dailyMap[day].pop * 100)}%`,
        icon
      };
    });
  }, [weatherData]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress sx={{ color: '#059669' }} />
      </Box>
    );
  }

  const activeCropName = activeCrop?.crop_name || 'Paddy (Basmati)';
  const activeStageTitle = activeCrop?.stages?.[3]?.title || 'Fertilizer Application';
  const currentHour = new Date().getHours();
  const isNight = currentHour < 6 || currentHour >= 18;

  let HeroIcon = WbSunny;
  let heroIconColor = '#FDE047';
  // Default: Clear Day
  let heroBgGradient = 'linear-gradient(to right, rgba(20, 83, 45, 0.85), rgba(20, 83, 45, 0.1))';
  let heroBgUrl = '/assets/bg_farm_sunny.png';
  
  if (conditionMain === 'Rain' || conditionMain === 'Drizzle') {
    HeroIcon = conditionMain === 'Drizzle' ? Grain : WaterDrop;
    heroIconColor = '#93C5FD'; // light blue
    heroBgGradient = isNight 
      ? 'linear-gradient(to right, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.4))'
      : 'linear-gradient(to right, rgba(30, 58, 138, 0.85), rgba(30, 58, 138, 0.3))';
    heroBgUrl = '/assets/bg_farm_rain.png';
  } else if (conditionMain === 'Thunderstorm') {
    HeroIcon = Thunderstorm;
    heroIconColor = '#E2E8F0';
    heroBgGradient = 'linear-gradient(to right, rgba(15, 23, 42, 0.95), rgba(30, 27, 77, 0.6))';
    heroBgUrl = '/assets/bg_farm_thunderstorm.png';
  } else if (conditionMain === 'Snow') {
    HeroIcon = AcUnit;
    heroIconColor = '#FFFFFF';
    heroBgGradient = isNight
      ? 'linear-gradient(to right, rgba(30, 41, 59, 0.9), rgba(30, 41, 59, 0.4))'
      : 'linear-gradient(to right, rgba(148, 163, 184, 0.9), rgba(148, 163, 184, 0.4))';
    heroBgUrl = '/assets/bg_farm_snow.png';
  } else if (['Mist', 'Smoke', 'Haze', 'Dust', 'Fog', 'Sand', 'Ash', 'Squall', 'Tornado'].includes(conditionMain)) {
    HeroIcon = Cloud;
    heroIconColor = '#CBD5E1';
    heroBgGradient = isNight
      ? 'linear-gradient(to right, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.5))'
      : 'linear-gradient(to right, rgba(100, 116, 139, 0.9), rgba(100, 116, 139, 0.4))';
    heroBgUrl = '/assets/bg_farm_fog.png';
  } else if (conditionMain === 'Clouds' || conditionMain === 'PartlyCloudy') {
    HeroIcon = isNight ? NightsStay : Cloud;
    heroIconColor = '#E2E8F0';
    heroBgGradient = isNight
      ? 'linear-gradient(to right, rgba(30, 41, 59, 0.95), rgba(30, 41, 59, 0.3))'
      : 'linear-gradient(to right, rgba(71, 85, 105, 0.85), rgba(71, 85, 105, 0.2))';
    heroBgUrl = isNight
      ? '/assets/bg_farm_night.png' // cloudy night
      : '/assets/bg_farm_cloudy.png'; // cloudy day field
  } else if (isNight) {
    HeroIcon = NightsStay;
    heroIconColor = '#E2E8F0';
    heroBgGradient = 'linear-gradient(to right, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.3))';
    heroBgUrl = '/assets/bg_farm_night.png'; // starry night
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3, lg: 4 }, pb: 10, bgcolor: '#F8FAFC', minHeight: '100vh', width: '100%' }}>
      
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', fontSize: { xs: '26px', md: '32px' } }}>
            Weather
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', fontSize: '14px', mt: 0.5 }}>
            Real-time weather insights for smarter farming decisions
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, bgcolor: '#fff', px: 2, py: 1, borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)', cursor: 'pointer' }}>
            <LocationOn sx={{ color: '#059669', fontSize: 18 }} />
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
              {weatherData?.locationName || profile?.location || 'Kamareddy, Telangana'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, ml: 0.5 }}>v</Typography>
          </Box>
          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {lastUpdated}
            <Refresh sx={{ fontSize: 14, cursor: 'pointer' }} onClick={() => loadWeatherContext(true)} />
          </Typography>
        </Box>
      </Box>

      {/* ── 1. EXACT TARGET HERO WEATHER BANNER (IMAGE BACKDROP ONLY) ── */}
      <Paper 
        sx={{ 
          p: { xs: 3, md: 4 }, 
          borderRadius: '24px', 
          mb: 4, 
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: `${heroBgGradient}, url('${heroBgUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 75%',
          boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
          color: '#fff',
          width: '100%',
          minHeight: '260px',
          display: 'flex',
          flexDirection: 'column',
          justify: 'space-between'
        }}
      >
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          CURRENT WEATHER {weatherData?.locationName ? `IN ${weatherData.locationName.toUpperCase()}` : ''}
        </Typography>

        <Box sx={{ my: 1, position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
          <HeroIcon sx={{ fontSize: 96, color: heroIconColor, filter: `drop-shadow(0 4px 16px ${heroIconColor}99)` }} />
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography variant="h1" sx={{ fontWeight: 900, fontSize: { xs: '64px', md: '84px' }, lineHeight: 1 }}>
                {currTemp}°
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 500, fontSize: '36px', opacity: 0.9 }}>C</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, fontSize: '24px' }}>
              {conditionMain === 'Sunny' ? 'Partly Cloudy' : conditionMain}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 700, mt: 0.2 }}>
              Feels like {feelsLike}°C
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* ── 2. MIDDLE ROW (HOURLY FORECAST & CROP WEATHER IMPACT) ───────── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Hourly Forecast */}
        <Grid size={{ xs: 12, md: 7 }} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: '#fff', border: '1px solid #E2E8F0', flex: 1, display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
              <AccessTime sx={{ color: '#059669', fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '18px' }}>
                Hourly Forecast
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1.5, overflowX: 'auto', pb: 1, scrollbarWidth: 'none' }}>
              {hourlyForecastData.map((h, i) => (
                <Box 
                  key={i}
                  sx={{ 
                    p: 2, 
                    borderRadius: '16px', 
                    border: h.isCurrent ? '2px solid #059669' : '1px solid #E2E8F0',
                    bgcolor: h.isCurrent ? '#ECFDF5' : '#F8FAFC',
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="caption" sx={{ color: h.isCurrent ? '#059669' : '#64748B', fontWeight: 800, display: 'block', mb: 1 }}>
                    {h.time}
                  </Typography>
                  <Box sx={{ fontSize: 26, my: 0.5 }}>
                    {h.condition === 'Rain' ? '🌧️' : h.condition === 'Sunny' ? '☀️' : h.condition === 'PartlyCloudy' ? '⛅' : '☁️'}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', my: 0.5, fontSize: '18px' }}>
                    {h.temp}°
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#3B82F6', fontWeight: 700, fontSize: '11px' }}>
                    💧 {h.rain}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Crop Weather Impact */}
        <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: '#fff', border: '1px solid #E2E8F0', flex: 1, display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
              <Spa sx={{ color: '#059669', fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '18px' }}>
                Crop Weather Impact
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8, mb: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px dashed #E2E8F0' }}>
                <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>Crop</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>{activeCropName}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px dashed #E2E8F0' }}>
                <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>Stage</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>{activeStageTitle}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>Impact</Typography>
                <Chip label="Moderate Risk" size="small" sx={{ bgcolor: '#FEF3C7', color: '#D97706', fontWeight: 800, borderRadius: '8px' }} />
              </Box>
            </Box>

            <Box sx={{ p: 2, bgcolor: '#F0FDF4', borderRadius: '16px', border: '1px solid #DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#166534', fontWeight: 800, display: 'block', mb: 0.5 }}>Recommendation</Typography>
                <Typography variant="body2" sx={{ color: '#15803D', fontWeight: 600, fontSize: '13px', lineHeight: 1.4 }}>
                  Delay urea application by 1 day due to chance of rainfall.
                </Typography>
              </Box>
              <Box sx={{ fontSize: 32 }}>🌾</Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ── 3. BOTTOM ROW (7-DAY FORECAST & WEATHER ALERTS) ──────────────── */}
      <Grid container spacing={3} sx={{ mb: 4, alignItems: 'stretch' }}>
        {/* 7-Day Forecast */}
        <Grid size={{ xs: 12, md: 7 }} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: '#fff', border: '1px solid #E2E8F0', flex: 1, display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
              <CalendarToday sx={{ color: '#059669', fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '18px' }}>
                7-Day Forecast
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
              {weeklyForecastData.map((w, idx) => (
                <Box key={idx} sx={{ p: 1.5, borderRadius: '14px', border: '1px solid #F1F5F9', bgcolor: '#F8FAFC', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block' }}>{w.day}</Typography>
                  <Box sx={{ fontSize: 22, my: 0.5 }}>{w.icon}</Box>
                  <Typography variant="body2" sx={{ fontWeight: 900, color: '#0F172A' }}>{w.max}°</Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, display: 'block' }}>{w.min}°</Typography>
                  <Typography variant="caption" sx={{ color: '#3B82F6', fontWeight: 700, fontSize: '10px', mt: 0.5, display: 'block' }}>💧 {w.rain}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Weather Alerts */}
        <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: '#fff', border: '1px solid #E2E8F0', flex: 1, display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Warning sx={{ color: '#DC2626', fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '18px' }}>
                  Weather Alerts
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {weatherData?.alert ? (
                <Box 
                  sx={{ 
                    p: 2.5, 
                    borderRadius: '16px', 
                    bgcolor: weatherData.alert.severity === 'warning' ? '#FFF5F5' : '#F0FDF4', 
                    border: `1px solid ${weatherData.alert.severity === 'warning' ? '#FECACA' : '#BBF7D0'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: weatherData.alert.severity === 'warning' ? '#FEE2E2' : '#DCFCE7' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Warning sx={{ color: weatherData.alert.severity === 'warning' ? '#DC2626' : '#16A34A', fontSize: 26 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#111827', fontSize: '14px' }}>
                        {weatherData.alert.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#374151', fontWeight: 600, fontSize: '12px', display: 'block' }}>
                        {weatherData.alert.message}
                      </Typography>
                    </Box>
                  </Box>
                  <ArrowForwardIos sx={{ fontSize: 14, color: weatherData.alert.severity === 'warning' ? '#EF4444' : '#16A34A' }} />
                </Box>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
                    ✅ No extreme weather alerts at this time.
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ── 4. FOOTER ACTION BAR ────────────────────────────────────────── */}
      <Paper sx={{ p: 2.5, borderRadius: '20px', bgcolor: '#fff', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ fontSize: 20 }}>🌿</Box>
          <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600 }}>
            {lastUpdated}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            onClick={handleUseGPS}
            startIcon={<LocationOn />}
            sx={{ 
              borderColor: '#059669', 
              color: '#059669', 
              fontWeight: 800, 
              borderRadius: '12px',
              textTransform: 'none',
              px: 3,
              '&:hover': { borderColor: '#047857', bgcolor: '#F0FDF4' }
            }}
          >
            Use My Location
          </Button>
          <Button 
            variant="contained" 
            onClick={() => loadWeatherContext(true)}
            startIcon={<Refresh />}
            sx={{ 
              bgcolor: '#059669', 
              color: '#fff', 
              fontWeight: 800, 
              borderRadius: '12px',
              textTransform: 'none',
              px: 3,
              '&:hover': { bgcolor: '#047857' }
            }}
          >
            Refresh Weather
          </Button>
        </Box>
      </Paper>

    </Box>
  );
};

export default WeatherCenter;
