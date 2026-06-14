import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Avatar, CircularProgress, Button, Chip } from '@mui/material';
import { WbSunny, WaterDrop, Air, Waves, Spoke, DeviceThermostat, Cloud, MyLocation, LocationOn } from '@mui/icons-material';
import { supabase } from '../supabase';
import { fetchWeatherAndAlerts } from '../services/weatherService';

const WeatherCenter = () => {
  const [profile, setProfile] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationSource, setLocationSource] = useState('profile'); // 'profile', 'gps'
  const [gpsError, setGpsError] = useState(null);

  const fetchWeatherWithGps = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        const res = await fetchWeatherAndAlerts(coords, import.meta.env.VITE_OPENWEATHER_API_KEY);
        if (res) {
          setWeatherData(res);
          setLocationSource('gps');
        } else {
          setGpsError("Failed to fetch weather for GPS coordinates.");
        }
        setLoading(false);
      },
      async (error) => {
        console.warn("Geolocation failed/denied:", error);
        setGpsError("Location access denied or unavailable.");
        if (profile) {
          const res = await fetchWeatherAndAlerts(profile.location, import.meta.env.VITE_OPENWEATHER_API_KEY);
          if (res) {
            setWeatherData(res);
            setLocationSource('profile');
          }
        }
        setLoading(false);
      },
      { timeout: 15000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    const loadWeatherContext = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          if (profileData) {
            setProfile(profileData);
            
            // Try to auto-request location
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                async (position) => {
                  const coords = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                  };
                  const res = await fetchWeatherAndAlerts(coords, import.meta.env.VITE_OPENWEATHER_API_KEY);
                  if (res) {
                    setWeatherData(res);
                    setLocationSource('gps');
                  } else {
                    const fb = await fetchWeatherAndAlerts(profileData.location, import.meta.env.VITE_OPENWEATHER_API_KEY);
                    if (fb) {
                      setWeatherData(fb);
                      setLocationSource('profile');
                    }
                  }
                  setLoading(false);
                },
                async (error) => {
                  console.warn("Auto-geolocation fallback:", error);
                  const res = await fetchWeatherAndAlerts(profileData.location, import.meta.env.VITE_OPENWEATHER_API_KEY);
                  if (res) {
                    setWeatherData(res);
                    setLocationSource('profile');
                  }
                  setLoading(false);
                },
                { timeout: 15000, enableHighAccuracy: true }
              );
            } else {
              const res = await fetchWeatherAndAlerts(profileData.location, import.meta.env.VITE_OPENWEATHER_API_KEY);
              if (res) {
                setWeatherData(res);
                setLocationSource('profile');
              }
              setLoading(false);
            }
          }
        }
      } catch (e) {
        console.error("Weather init error", e);
        setLoading(false);
      }
    };
    loadWeatherContext();
  }, []);

  if (loading) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress sx={{ color: '#2E7D32' }} />
      </Box>
    );
  }

  const alertInfo = weatherData?.alert || {
    title: "AI Advisory: Standby",
    message: "Awaiting local telemetry data sync.",
    severity: "warning", bgColor: '#fff5e6', iconColor: '#e65100'
  };

  const currTemp = weatherData?.weather ? Math.round(weatherData.weather.main.temp) : '--';
  const currHum = weatherData?.weather ? weatherData.weather.main.humidity : '--';
  const currWind = weatherData?.weather ? Math.round(weatherData.weather.wind.speed * 3.6) : '--';
  const currRain = weatherData?.weather ? Math.round(weatherData.weather.pop * 100) : '--';

  const riskLabel = (currWind > 20 || currRain > 60) ? "HIGH" : "SAFE";
  const riskColor = riskLabel === "SAFE" ? { bg: '#e8f5e9', text: '#2e7d32' } : { bg: '#ffebee', text: '#c62828' };

  // Calculate strict 5-Day summary from the raw 40-block forecast array
  let dailyForecast = [];
  if (weatherData?.forecastList) {
    const daysObj = {};
    weatherData.forecastList.forEach(item => {
      const dateStr = new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
      if (!daysObj[dateStr]) daysObj[dateStr] = { temps: [], icon: item.weather[0].main };
      daysObj[dateStr].temps.push(item.main.temp);
    });
    dailyForecast = Object.keys(daysObj).slice(0, 5).map(date => {
      const maxArr = Math.max(...daysObj[date].temps);
      return {
        day: date,
        maxTemp: Math.round(maxArr),
        condition: daysObj[date].icon
      };
    });
  } else {
    dailyForecast = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d, i) => ({ day: d, maxTemp: 30 - i, condition: 'Clear' }));
  }

  return (
    <Box className="weather-container" sx={{ maxWidth: '1200px', margin: '0 auto', padding: { xs: '16px', md: '32px 24px' }, pt: { xs: '90px', md: '110px' }, minHeight: '80vh' }}>
      
      {/* Header */}
      <Box sx={{ mb: '32px', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#111', fontSize: '28px', letterSpacing: '-0.5px' }}>
            Live Farm Weather 🌤️
          </Typography>
          <Typography sx={{ color: '#555', fontSize: '15px', mt: 1, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <LocationOn sx={{ color: weatherData?.isGps ? '#2E7D32' : '#777', fontSize: '18px' }} />
            <span>
              {weatherData?.isGps && weatherData?.coords
                ? `${weatherData.locationName} (${weatherData.coords.lat.toFixed(4)}°N, ${weatherData.coords.lon.toFixed(4)}°E)`
                : (weatherData?.locationName || profile?.location || 'Local')} intelligence and AI spraying advisory.
            </span>
            {weatherData?.isGps && (
              <Chip label="GPS Real-Time" size="small" color="success" variant="outlined" sx={{ height: '20px', fontSize: '10px', fontWeight: 700 }} />
            )}
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<MyLocation />} 
          onClick={fetchWeatherWithGps}
          sx={{ 
            backgroundColor: '#2E7D32', 
            borderRadius: '12px', 
            textTransform: 'none', 
            fontWeight: 700, 
            boxShadow: '0 4px 12px rgba(46,125,50,0.2)',
            '&:hover': {
              backgroundColor: '#1b5e20'
            }
          }}
        >
          Use Device GPS
        </Button>
      </Box>

      {gpsError && (
        <Box sx={{ mb: 2, p: '10px 16px', borderRadius: '10px', background: '#ffebee', border: '1px solid #ef5350' }}>
          <Typography sx={{ color: '#c62828', fontSize: '13px', fontWeight: 600 }}>
            ⚠️ Geolocation: {gpsError}
          </Typography>
        </Box>
      )}

      {/* Hero Advisory Card */}
      <Box className="advisory-banner" sx={{ display: 'flex', alignItems: 'center', gap: '18px', padding: '20px 24px', borderRadius: '20px', backgroundColor: alertInfo.bgColor, border: `1px solid ${alertInfo.iconColor}40`, mb: '28px' }}>
        <Avatar className="banner-icon" sx={{ backgroundColor: alertInfo.iconColor, width: '54px', height: '54px' }}>
          <Spoke />
        </Avatar>
        <Box>
          <Typography sx={{ fontWeight: 800, color: alertInfo.iconColor, fontSize: '18px', mb: '4px' }}>
            {alertInfo.title}
          </Typography>
          <Typography sx={{ color: '#555', fontSize: '15px', fontWeight: 500 }}>
            {alertInfo.message}
          </Typography>
        </Box>
      </Box>

      {/* Main Content Grid */}
      <Box className="weather-grid" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: '24px' }}>
        
        {/* Left Side Weather Metrics */}
        <Box className="metric-grid" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: '18px' }}>
          <Paper className="metric-card" sx={{ minHeight: '180px', borderRadius: '20px', padding: '24px', background: '#fff', boxShadow: '0 6px 16px rgba(0,0,0,0.04)', border: '1px solid #ececec', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <DeviceThermostat sx={{ fontSize: '48px', color: '#fbc02d', mb: 1 }} />
            <Typography sx={{ fontSize: '36px', fontWeight: 800, color: '#222' }}>{currTemp}°C</Typography>
            <Typography sx={{ fontSize: '14px', color: '#666', fontWeight: 600 }}>Active Temp</Typography>
          </Paper>
          
          <Paper className="metric-card" sx={{ minHeight: '180px', borderRadius: '20px', padding: '24px', background: '#fff', boxShadow: '0 6px 16px rgba(0,0,0,0.04)', border: '1px solid #ececec', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <WaterDrop sx={{ fontSize: '48px', color: '#29b6f6', mb: 1 }} />
            <Typography sx={{ fontSize: '36px', fontWeight: 800, color: '#222' }}>{currHum}%</Typography>
            <Typography sx={{ fontSize: '14px', color: '#666', fontWeight: 600 }}>Relative Humidity</Typography>
          </Paper>

          <Paper className="metric-card" sx={{ minHeight: '180px', borderRadius: '20px', padding: '24px', background: '#fff', boxShadow: '0 6px 16px rgba(0,0,0,0.04)', border: '1px solid #ececec', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: 16, right: 16, backgroundColor: riskColor.bg, color: riskColor.text, fontSize: '11px', fontWeight: 800, px: 1, py: 0.5, borderRadius: '6px' }}>Spraying Risk: {riskLabel}</Box>
            <Air sx={{ fontSize: '48px', color: '#ab47bc', mb: 1 }} />
            <Typography sx={{ fontSize: '36px', fontWeight: 800, color: '#222' }}>{currWind} <span style={{fontSize: '18px'}}>km/h</span></Typography>
            <Typography sx={{ fontSize: '14px', color: '#666', fontWeight: 600 }}>Wind Speed</Typography>
          </Paper>

          <Paper className="metric-card" sx={{ minHeight: '180px', borderRadius: '20px', padding: '24px', background: '#fff', boxShadow: '0 6px 16px rgba(0,0,0,0.04)', border: '1px solid #ececec', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: 16, right: 16, backgroundColor: riskLabel === 'SAFE' ? '#e8f5e9' : '#fff3e0', color: riskLabel === 'SAFE' ? '#2e7d32' : '#e65100', fontSize: '11px', fontWeight: 800, px: 1, py: 0.5, borderRadius: '6px' }}>Field Work: {riskLabel === 'SAFE' ? 'SAFE' : 'CAUTION'}</Box>
            <Waves sx={{ fontSize: '48px', color: '#5c6bc0', mb: 1 }} />
            <Typography sx={{ fontSize: '36px', fontWeight: 800, color: '#222' }}>{currRain}%</Typography>
            <Typography sx={{ fontSize: '14px', color: '#666', fontWeight: 600 }}>Rain Probability</Typography>
          </Paper>
        </Box>

        {/* Right Side Forecast Panel */}
        <Box>
          <Paper className="forecast-panel" sx={{ background: '#fff', borderRadius: '20px', padding: '22px', boxShadow: '0 6px 16px rgba(0,0,0,0.04)', height: '100%', border: '1px solid #ececec' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>5-Day Forecast</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {dailyForecast.map((block, idx) => (
                <Box key={idx} className="forecast-row" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: idx !== 4 ? '1px solid #f1f1f1' : 'none' }}>
                  <Typography sx={{ fontWeight: 600, color: '#444' }}>{block.day}</Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {block.condition === 'Clear' ? <WbSunny sx={{ fontSize: '20px', color: '#fbc02d' }} /> : <Cloud sx={{ fontSize: '20px', color: '#78909C' }} />}
                    <Typography sx={{ fontWeight: 700, minWidth: '40px', textAlign: 'right' }}>{block.maxTemp}°</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

      </Box>

    </Box>
  );
};

export default WeatherCenter;
