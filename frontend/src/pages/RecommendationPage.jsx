import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, Select, MenuItem, Grid, Divider, Avatar, Chip } from '@mui/material';
import { Spa, TrendingUp, FilterList, BarChart, Warning, WbCloudy, Verified, ArrowForward, DeviceThermostat, GridOn, Opacity, LocationOn, DateRange, FiberManualRecord } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { fetchWeatherAndAlerts } from '../services/weatherService';
import { generateSmartRecommendation } from '../services/recommendationEngine';

const getCropEmoji = (name) => {
  const n = name.toLowerCase();
  if (n.includes('paddy')) return '🌾';
  if (n.includes('cotton')) return '☁️';
  if (n.includes('sugarcane')) return '🎋';
  if (n.includes('turmeric')) return '🎗️';
  if (n.includes('mango')) return '🥭';
  if (n.includes('chili')) return '🌶️';
  if (n.includes('castor')) return '🫘';
  if (n.includes('maize')) return '🌽';
  if (n.includes('banana')) return '🍌';
  if (n.includes('tomato')) return '🍅';
  if (n.includes('potato')) return '🥔';
  if (n.includes('onion')) return '🧅';
  return '🌱';
};

const RecommendationPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [uiState, setUiState] = useState('initial'); // 'initial', 'loading', 'success', 'error'

  // Inputs
  const [soilType, setSoilType] = useState('');
  const [waterAvailability, setWaterAvailability] = useState('');
  const [cropDurationType, setCropDurationType] = useState('');

  // Real-time Context API
  const [weatherSummary, setWeatherSummary] = useState(null);
  const [temperature, setTemperature] = useState(null);

  // Output State
  const [topCrops, setTopCrops] = useState([]);
  const [maxProfit, setMaxProfit] = useState(1);

  useEffect(() => {
    const fetchProfileAndWeather = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate('/login');

      // 1. Get Profile
      const { data: profileData, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();

      if (!error && profileData) {
        setProfile(profileData);
        setSoilType(profileData.soil_type || 'Black Soil');
        setWaterAvailability(profileData.irrigation?.includes('Good') ? 'more_water' : (profileData.irrigation?.includes('Limited') ? 'moderate_water' : 'less_water'));
        setCropDurationType('short_term'); // default

        // 2. Pre-fetch Weather quietly for Temperature UI injection
        const rawWeather = await fetchWeatherAndAlerts(profileData.location, import.meta.env.VITE_OPENWEATHER_API_KEY);
        setWeatherSummary(rawWeather);
        if (rawWeather && rawWeather.weather) {
          setTemperature(Math.round(rawWeather.weather.main.temp));
        } else {
          setTemperature(30); // fallback
        }
      }
    };
    fetchProfileAndWeather();
  }, [navigate]);

  const handleRecommendation = async () => {
    if (!waterAvailability || !soilType || !cropDurationType) return;
    setUiState('loading');

    try {
      // Execute Heavy Modular Engine Call
      const VITE_AGMARKNET_API_KEY = import.meta.env.VITE_AGMARKNET_API_KEY || ''; // Pass key if exists

      const winners = await generateSmartRecommendation(
        profile,
        soilType,
        waterAvailability,
        cropDurationType,
        VITE_AGMARKNET_API_KEY
      );

      // Update Chart maximum for relativistic scaling
      const maxP = Math.max(...winners.map(w => w.estimatedProfit));
      setMaxProfit(maxP);

      setTopCrops(winners);
      setUiState('success');

    } catch (err) {
      console.error(err);
      setUiState('error');
    }
  };

  const getMedalColor = (idx) => {
    if (idx === 0) return '#FFD700'; // Gold
    if (idx === 1) return '#C0C0C0'; // Silver
    if (idx === 2) return '#CD7F32'; // Bronze
    return '#E0E0E0'; // Honorable mentions
  };

  if (!profile) return null;

  return (
    <Box sx={{ 
      p: { xs: 1.5, md: 4 }, 
      pt: { xs: '85px', md: '100px' },
      minHeight: '100vh', 
      pb: { xs: 12, md: 4 },
      backgroundImage: 'radial-gradient(rgba(46,125,50,0.03) 1px, transparent 1px)',
      backgroundSize: '20px 20px'
    }}>
      <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>

      {/* HERO SECTION CRAZY GOOD */}
      <Box sx={{ 
        mb: { xs: 3, md: 5 }, 
        textAlign: { xs: 'left', md: 'center' }, 
        px: { xs: 2.5, md: 3 },
        py: { xs: 3, md: 4 },
        background: 'linear-gradient(135deg, #eafaf1, #ffffff)',
        border: '1px solid #d7f0df',
        borderRadius: '22px',
        boxShadow: '0 8px 24px rgba(34, 139, 34, 0.08)'
      }}>
        <Typography variant="h3" sx={{ fontWeight: 800, color: '#1B5E20', mb: 1.5, fontSize: { xs: '26px', sm: '38px' }, letterSpacing: '-0.5px' }}>
          Smart Crop Match
        </Typography>
        <Typography sx={{ color: '#555', fontSize: { xs: '15px', md: '17px' }, fontWeight: 500, lineHeight: 1.5, maxWidth: '600px', mx: 'auto' }}>
          Find the absolute best crops for your farm combining your local soil and live market economics.
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2.5, md: 4 }}>

        {/* LEFT COLUMN: Premium Mobile Input Section */}
        <Grid item xs={12} md={4} sx={{ position: { md: 'relative' } }}>
          <Box sx={{ maxWidth: '420px', margin: '0 auto' }}>
            <Typography sx={{ fontSize: '28px', fontWeight: 800, color: '#222', mb: '22px', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <FilterList sx={{ color: '#2E7D32', fontSize: '32px' }} /> Farm Conditions
            </Typography>

            <Paper
              elevation={0}
              sx={{
                padding: '24px 20px',
                borderRadius: '24px',
                backgroundColor: '#ffffff',
                border: '1px solid #e8e8e8',
                boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                position: { md: 'sticky' },
                top: '100px',
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

                {/* Editable Field 1 */}
                <Box>
                  <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#555', mb: '8px', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <GridOn fontSize="small" sx={{ color: '#795548' }} /> Soil
                  </Typography>
                  <Select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    fullWidth
                    sx={{
                      height: '54px', borderRadius: '14px', backgroundColor: '#fff', fontSize: '16px', fontWeight: 600, color: '#222',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d9d9d9' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#b0b0b0' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2e7d32', borderWidth: '1px' },
                      '&.Mui-focused': { boxShadow: '0 0 0 4px rgba(46,125,50,0.08)' }
                    }}
                  >
                    <MenuItem value="Alluvial Soil">Alluvial</MenuItem>
                    <MenuItem value="Black Soil">Black</MenuItem>
                    <MenuItem value="Red Soil">Red</MenuItem>
                    <MenuItem value="Laterite Soil">Laterite</MenuItem>
                    <MenuItem value="Sandy Soil">Sandy</MenuItem>
                    <MenuItem value="Clay Soil">Clay</MenuItem>
                    <MenuItem value="Loamy Soil">Loamy Soil</MenuItem>
                  </Select>
                </Box>

                {/* Editable Field 2 */}
                <Box>
                  <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#555', mb: '8px', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Opacity fontSize="small" sx={{ color: '#1976D2' }} /> Water
                  </Typography>
                  <Select
                    value={waterAvailability}
                    onChange={(e) => setWaterAvailability(e.target.value)}
                    fullWidth
                    sx={{
                      height: '54px', borderRadius: '14px', backgroundColor: '#fff', fontSize: '16px', fontWeight: 600, color: '#222',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d9d9d9' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#b0b0b0' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2e7d32', borderWidth: '1px' },
                      '&.Mui-focused': { boxShadow: '0 0 0 4px rgba(46,125,50,0.08)' }
                    }}
                  >
                    <MenuItem value="more_water">High (Canal)</MenuItem>
                    <MenuItem value="moderate_water">Med (Borewell)</MenuItem>
                    <MenuItem value="less_water">Low (Rainfed)</MenuItem>
                  </Select>
                </Box>

                {/* Editable Field 3 */}
                <Box>
                  <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#555', mb: '8px', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <DateRange fontSize="small" sx={{ color: '#F57F17' }} /> Duration Plan
                  </Typography>
                  <Select
                    value={cropDurationType}
                    onChange={(e) => setCropDurationType(e.target.value)}
                    fullWidth
                    sx={{
                      height: '54px', borderRadius: '14px', backgroundColor: '#fff', fontSize: '16px', fontWeight: 600, color: '#222',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d9d9d9' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#b0b0b0' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2e7d32', borderWidth: '1px' },
                      '&.Mui-focused': { boxShadow: '0 0 0 4px rgba(46,125,50,0.08)' }
                    }}
                  >
                    <MenuItem value="short_term">Short Term {'(< 120 Days)'}</MenuItem>
                    <MenuItem value="long_term">Long Term {'(> 120 Days)'}</MenuItem>
                    <MenuItem value="perennial">Perennial {'(Years)'}</MenuItem>
                  </Select>
                </Box>

              </Box>

              {/* ACTION PANEL (Grouped Weather + CTA) */}
              <Box sx={{ 
                background: '#fafafa', 
                borderRadius: '20px', 
                padding: '18px', 
                mt: '22px',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)'
              }}>
                {/* Weather Strip */}
                <Box sx={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', padding: '14px 18px', mb: '16px',
                  borderRadius: '16px', background: '#fffdf5', border: '1px solid #f2d27a',
                }}>
                  <Typography sx={{ fontWeight: 800, color: '#D84315', fontSize: '18px', display: 'flex', alignItems: 'center', lineHeight: 1 }}>
                    ☀️ {temperature !== null ? `${temperature}°C` : '...'}
                  </Typography>
                  <Box sx={{ width: '1.5px', height: '16px', backgroundColor: '#e0c07c', borderRadius: '1px', opacity: 0.8 }} />
                  <Typography sx={{ fontWeight: 700, color: '#444', fontSize: '18px', display: 'flex', alignItems: 'center', lineHeight: 1 }}>
                    {profile.season}
                  </Typography>
                </Box>

                {/* Analyze Button */}
                <Button
                  variant="contained"
                  onClick={handleRecommendation}
                  disabled={uiState === 'loading'}
                  endIcon={uiState === 'loading' ? null : <ArrowForward />}
                  sx={{
                    width: '100%', height: '56px', borderRadius: '16px',
                    backgroundColor: '#2e7d32',
                    color: 'white', fontSize: '20px', fontWeight: 800, letterSpacing: '0.4px',
                    boxShadow: '0 8px 18px rgba(46,125,50,0.18)',
                    transition: 'all 0.2s ease', textTransform: 'uppercase',
                    '&:hover': { backgroundColor: '#1b5e20', boxShadow: '0 10px 22px rgba(46,125,50,0.25)' },
                    '&:active': { transform: 'scale(0.98)' }
                  }}
                >
                  {uiState === 'loading' ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Analyze Best Crops'}
                </Button>
              </Box>

            </Paper>
          </Box>
        </Grid>

        {/* RIGHT COLUMN: Results Section */}
        <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column' }}>

          {uiState === 'initial' && (
            <Box sx={{ 
              flex: 1,
              width: '100%', 
              minHeight: { xs: '300px', md: 'calc(100vh - 140px)' },
              borderRadius: '24px',
              background: 'linear-gradient(90deg, #f2f2f2 25%, #f8f8f8 50%, #f2f2f2 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              border: '1px solid #eee'
            }}>
              <Spa sx={{ fontSize: '48px', color: '#e0e0e0', mb: 2 }} />
              <Typography sx={{ color: '#aaa', fontWeight: 600, fontSize: '16px' }}>Configure farm settings to view recommendations</Typography>
            </Box>
          )}

          {uiState === 'loading' && (
            <Box sx={{ 
              flex: 1,
              width: '100%', 
              minHeight: { xs: '300px', md: 'calc(100vh - 140px)' }, 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
              borderRadius: '24px', backgroundColor: '#f0f5f1', p: 4 
            }}>
              <CircularProgress size={50} sx={{ color: '#2E7D32', mb: 3 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#2E7D32', mb: 1 }}>Strict Multi-Filtering...</Typography>
              <Typography sx={{ color: '#666', fontWeight: 600, fontSize: '14px', textAlign: 'center' }}>Fetching Live Agmarknet Prices for survivors.</Typography>
            </Box>
          )}

          {uiState === 'success' && topCrops.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, md: 4 }, animation: 'fadeIn 0.4s ease-in' }}>

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#222', mb: 2, display: 'inline-block' }}>Top 5 Recommendations</Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {topCrops.map((crop, idx) => (
                    <Paper key={crop.name} sx={{
                      p: { xs: 2.5, sm: 3 },
                      borderRadius: '20px',
                      background: idx === 0 ? 'linear-gradient(135deg, #f8fff5, #ffffff)' : '#fff',
                      borderLeft: '5px solid #2E7D32',
                      borderTop: idx === 0 ? '1px solid #d7f0df' : '1px solid #eee',
                      borderBottom: idx === 0 ? '1px solid #d7f0df' : '1px solid #eee',
                      borderRight: idx === 0 ? '1px solid #d7f0df' : '1px solid #eee',
                      boxShadow: idx === 0 ? '0 14px 34px rgba(46,125,50,0.18)' : '0 10px 30px rgba(0,0,0,0.08)',
                      transform: idx === 0 ? 'scale(1.02)' : 'none',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      mb: idx === 0 ? 3 : 2,
                      '&:hover': { transform: idx === 0 ? 'scale(1.02) translateY(-2px)' : 'translateY(-2px)', boxShadow: '0 15px 35px rgba(0,0,0,0.12)' }
                    }}>
                      {/* Faded Background Medal */}
                      <Box sx={{ position: 'absolute', top: 0, right: 0, width: '60px', height: '60px', backgroundColor: getMedalColor(idx), opacity: idx === 0 ? 0.15 : 0.05, borderBottomLeftRadius: '100%' }} />

                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 3 }, alignItems: { xs: 'flex-start', sm: 'center' } }}>

                        {/* Title & Emojis */}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h5" sx={{ fontWeight: 900, color: '#1B5E20', mb: 0.5, fontSize: { xs: '20px', sm: '24px' }, display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getCropEmoji(crop.name)} {crop.name}
                          </Typography>

                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                            <Chip size="small" label={`Suitability: ${crop.finalScore}%`} sx={{ backgroundColor: '#2E7D32', color: '#fff', fontWeight: 700 }} />
                            <Chip size="small" label={`Market: ₹${crop.marketPrice}/qtl`} sx={{ backgroundColor: '#FFF3E0', color: '#E65100', fontWeight: 700 }} />
                          </Box>

                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {crop.reasons.slice(0, 2).map((rsn, i) => (
                              <Typography key={i} sx={{ fontWeight: 600, color: '#555', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Verified sx={{ color: '#4CAF50', fontSize: '14px' }} /> {rsn}
                              </Typography>
                            ))}
                          </Box>
                        </Box>

                        {/* LIVE PROFIT WIDGET */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: { xs: '100%', sm: 'auto' }, pt: { xs: 2, sm: 0 }, borderTop: { xs: '1px solid #EEE', sm: 'none' } }}>
                          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: '10px' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', p: 1.2, borderRadius: '12px', backgroundColor: '#F0FDF4', border: '1px solid #DCFCE7', alignItems: 'flex-start', minWidth: '100px' }}>
                              <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#166534', mb: 0.5 }}>💰 Total Profit</Typography>
                              <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#166534' }}>₹{crop.totalProfit.toLocaleString()}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', p: 1.2, borderRadius: '12px', backgroundColor: '#FFFBEB', border: '1px solid #FEF3C7', alignItems: 'flex-start', minWidth: '110px' }}>
                              <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#B45309', mb: 0.5 }}>📅 Monthly Income</Typography>
                              <Typography sx={{ fontSize: '15px', fontWeight: 900, color: '#D97706' }}>₹{crop.monthlyIncome.toLocaleString()}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', p: 1.2, borderRadius: '12px', backgroundColor: '#F9FAFB', border: '1px solid #F3F4F6', alignItems: 'flex-start', minWidth: '100px' }}>
                              <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', mb: 0.5 }}>🌾 Per Acre</Typography>
                              <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#374151' }}>₹{crop.profitPerAcre.toLocaleString()}</Typography>
                            </Box>
                          </Box>

                          <Button size="small" variant={idx === 0 ? "contained" : "outlined"} fullWidth sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none', backgroundColor: idx === 0 ? '#2E7D32' : 'transparent', color: idx === 0 ? '#fff' : '#2E7D32', borderColor: '#2E7D32', mt: 0.5, py: 0.8 }}>
                            Cultivation Plan
                          </Button>
                        </Box>

                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Box>

              {/* Premium Animated Profit Chart */}
              <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: '20px', backgroundColor: '#fff', border: '1px solid #E0E0E0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#333', mb: 3, display: 'flex', alignItems: 'center', gap: 1, fontSize: '16px' }}>
                  <BarChart sx={{ color: '#F57F17' }} /> Farm Income Estimation (Monthly)
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {topCrops.map((crop, idx) => {
                    const barWidth = `${(crop.estimatedProfit / maxProfit) * 100}%`;
                    return (
                      <Box key={crop.name} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography sx={{ fontWeight: 700, color: '#444', fontSize: '13px' }}>{getCropEmoji(crop.name)} {crop.name}</Typography>
                          <Typography sx={{ fontWeight: 800, color: idx === 0 ? '#1B5E20' : '#555', fontSize: '13px' }}>
                            ₹{crop.estimatedProfit > 1000 ? (Math.round(crop.estimatedProfit / 1000) + 'k') : crop.estimatedProfit}
                          </Typography>
                        </Box>
                        <Box sx={{ width: '100%', height: '12px', backgroundColor: '#F5F5F5', borderRadius: '6px', overflow: 'hidden' }}>
                          <Box sx={{ width: barWidth, height: '100%', backgroundColor: idx === 0 ? '#4CAF50' : '#A5D6A7', transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)', borderRadius: '6px' }} />
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Paper>

              {/* Pulsing Smart Alerts */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#333', mb: 1.5, fontSize: '16px' }}>Live Connection Status</Typography>
                <Paper sx={{ p: 2, borderRadius: '16px', border: `1px solid ${weatherSummary?.alert ? weatherSummary.alert.iconColor : '#90CAF9'}40`, backgroundColor: weatherSummary?.alert ? weatherSummary.alert.bgColor : '#E3F2FD', boxShadow: 'none' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

                    {/* Pulse Animation Wrapper */}
                    <Box sx={{ position: 'relative', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Box sx={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', backgroundColor: weatherSummary?.alert ? weatherSummary.alert.iconColor : '#2196F3', opacity: 0.2, animation: 'pulse 1.5s infinite' }} />
                      <FiberManualRecord sx={{ color: weatherSummary?.alert ? weatherSummary.alert.iconColor : '#1976D2', fontSize: '20px', zIndex: 1 }} />
                    </Box>

                    <Box>
                      <Typography sx={{ fontWeight: 800, color: weatherSummary?.alert ? weatherSummary.alert.iconColor : '#1565C0', fontSize: '14px' }}>
                        System Synchronized
                      </Typography>
                      <Typography sx={{ color: '#555', fontSize: '13px', fontWeight: 500, lineHeight: 1.3 }}>
                        {weatherSummary?.alert ? weatherSummary.alert.message : weatherSummary?.weather ? `Agmarknet Online. Area Weather: ${weatherSummary.weather.weather[0].description}.` : 'Servers online.'}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>

            </Box>
          )}
        </Grid>
      </Grid>



      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      </Box>
    </Box>
  );
};

export default RecommendationPage;
