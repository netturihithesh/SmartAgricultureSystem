import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Avatar, CircularProgress } from '@mui/material';
import { WbSunny, WaterDrop, Air, Waves, Spoke, DeviceThermostat, Cloud } from '@mui/icons-material';
import { supabase } from '../supabase';
import { fetchWeatherAndAlerts } from '../services/weatherService';

const WeatherCenter = () => {
  const [profile, setProfile] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWeatherContext = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          if (profileData) {
            setProfile(profileData);
            const res = await fetchWeatherAndAlerts(profileData.location, import.meta.env.VITE_OPENWEATHER_API_KEY);
            if (res) setWeatherData(res);
          }
        }
      } catch (e) {
        console.error("Weather init error", e);
      } finally {
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
      <Box sx={{ mb: '32px' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#111', fontSize: '28px', letterSpacing: '-0.5px' }}>
          Live Farm Weather 🌤️
        </Typography>
        <Typography sx={{ color: '#555', fontSize: '15px', mt: 1 }}>
          {profile?.location || 'Local'} intelligence and AI spraying advisory.
        </Typography>
      </Box>

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
