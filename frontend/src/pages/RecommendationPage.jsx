import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { supabase } from '../supabase';
import { fetchWeatherAndAlerts } from '../services/weatherService';
import { generateSmartRecommendation } from '../services/recommendationEngine';
import { useColorMode } from '../context/ThemeContext';
import { Person, Terrain, Opacity, CalendarToday, Agriculture, WbSunny, TrendingUp, Spa, EmojiEvents, CheckCircle, Grass } from '@mui/icons-material';

// Colors mapped to match the core SmartAgri emerald & slate UI theme
const getThemeColors = () => ({
  soil: '#0F172A',
  leaf: '#059669',
  leafMid: '#047857',
  leafBright: '#10B981',
  leafGlow: '#34D399',
  gold: '#D97706',
  goldLight: '#F59E0B',
  cream: '#F8FAFC',
  creamDark: '#F1F5F9',
  earth: '#B45309',
  sky: '#E0F2FE',
  muted: '#64748B',
  cardBg: '#FFFFFF',
  pageBg: '#F8FAFC',
  border: '#E2E8F0',
  shadowGreen: '0 4px 20px rgba(5,150,105,0.12)',
  shadowCard: '0 4px 16px rgba(0,0,0,0.03)',
  fontAccent: '"Inter", sans-serif',
  fontBody: '"Inter", sans-serif',
});

const getCropIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes('paddy') || n.includes('sugarcane') || n.includes('maize')) return <Grass fontSize="inherit" />;
  return <Spa fontSize="inherit" />;
};

const formatCurrency = (val) => {
  return '₹' + val.toLocaleString('en-IN');
};

const RecommendationPage = () => {
  const navigate = useNavigate();
  const theme = useMemo(() => getThemeColors(), []);
  const [profile, setProfile] = useState(null);
  const [uiState, setUiState] = useState('initial'); // 'initial', 'loading', 'success', 'error'

  const [soilType, setSoilType] = useState('');
  const [waterAvailability, setWaterAvailability] = useState('');
  const [cropDurationType, setCropDurationType] = useState('short_term');
  const [landSize, setLandSize] = useState('5');

  const [weatherSummary, setWeatherSummary] = useState(null);
  const [temperature, setTemperature] = useState(null);

  const [topCrops, setTopCrops] = useState([]);
  useEffect(() => {
    const fetchProfileAndWeather = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate('/login');

      const { data: profileData, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();

      if (!error && profileData) {
        setProfile(profileData);
        setSoilType(profileData.soil_type || 'Black Soil');
        setWaterAvailability(profileData.irrigation?.includes('Good') ? 'more_water' : (profileData.irrigation?.includes('Limited') ? 'moderate_water' : 'less_water'));
        if (profileData.land_size) {
          const rawNum = profileData.land_size.toString().replace(/[^0-9.]/g, '');
          setLandSize(rawNum || '5');
        }

        const rawWeather = await fetchWeatherAndAlerts(profileData.location, import.meta.env.VITE_OPENWEATHER_API_KEY);
        setWeatherSummary(rawWeather);
        if (rawWeather && rawWeather.weather) {
          setTemperature(Math.round(rawWeather.weather.main.temp));
        } else {
          setTemperature(30);
        }
      }
    };
    fetchProfileAndWeather();
  }, [navigate]);

  const handleRecommendation = async () => {
    if (!waterAvailability || !soilType || !cropDurationType) return;
    
    // Ensure land size is never 0 or negative
    let safeLandSize = parseFloat(landSize);
    if (isNaN(safeLandSize) || safeLandSize <= 0) {
      safeLandSize = 0.1;
      setLandSize('0.1');
    }

    setUiState('loading');

    try {
      const rawKeys = import.meta.env.VITE_AGMARKNET_API_KEYS || import.meta.env.VITE_AGMARKNET_API_KEY || '';
      const agmarknetKeysArray = rawKeys.split(',').map(k => k.trim()).filter(k => k);

      const modifiedProfile = { ...profile, land_size: safeLandSize };
      
      const winners = await generateSmartRecommendation(
        modifiedProfile,
        soilType,
        waterAvailability,
        cropDurationType,
        agmarknetKeysArray
      );

      setTopCrops(winners);
      setUiState('success');
    } catch (err) {
      console.error(err);
      setUiState('error');
    }
  };

  const handleAddCrop = async (cropName) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      
      const userId = session.user.id;
      const crops = JSON.parse(localStorage.getItem(`user_crops_${userId}`) || '[]');
      if (crops.length >= 2) {
        alert('You can only manage a maximum of two crops simultaneously. Please delete a crop first.');
        return;
      }

      // Prompt for start date
      const todayStr = new Date().toISOString().split('T')[0];
      const dateInput = window.prompt(`Enter start date for ${cropName} (YYYY-MM-DD):`, todayStr);
      
      if (dateInput === null) return; // User cancelled

      // Parse and validate date
      const startDate = new Date(dateInput);
      if (isNaN(startDate.getTime())) {
        alert('Invalid date format. Please enter a valid date in YYYY-MM-DD format.');
        return;
      }

      const year = startDate.getFullYear();
      if (year < 2025 || year > 2027) {
        alert('Start date must be between 2025 and 2027.');
        return;
      }

      // Add to user crops list
      crops.push({
        id: Date.now(),
        cropName: cropName,
        startDate: startDate.toISOString(),
      });

      localStorage.setItem(`user_crops_${userId}`, JSON.stringify(crops));
      localStorage.setItem(`active_crop_index_${userId}`, (crops.length - 1).toString());

      alert(`Successfully added ${cropName} to your tracked crops! Redirecting to Dashboard...`);
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('An error occurred while adding the crop.');
    }
  };

  const handleQuickAddAndRedirect = async (cropName) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      
      const userId = session.user.id;
      const crops = JSON.parse(localStorage.getItem(`user_crops_${userId}`) || '[]');
      if (crops.length >= 2) {
        alert('You can only manage a maximum of two crops simultaneously. Please delete a crop first.');
        return;
      }

      const today = new Date();
      crops.push({
        id: Date.now(),
        cropName: cropName,
        startDate: today.toISOString(),
      });

      localStorage.setItem(`user_crops_${userId}`, JSON.stringify(crops));
      localStorage.setItem(`active_crop_index_${userId}`, (crops.length - 1).toString());

      navigate('/');
    } catch (err) {
      console.error(err);
      alert('An error occurred.');
    }
  };

  if (!profile) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', width: '100%' }}>
      <CircularProgress sx={{ color: '#059669' }} />
    </div>
  );

  return (
    <div style={{
      fontFamily: theme.fontBody,
      backgroundColor: theme.pageBg,
      color: theme.soil,
      minHeight: '100vh',
      paddingBottom: '80px',
      position: 'relative'
    }}>
      {/* Background radial textures */}
      <div style={{
        position: 'fixed', inset: 0,
        background: `radial-gradient(ellipse 80% 60% at 10% 0%, rgba(82,168,50,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 90% 100%, rgba(200,144,42,0.07) 0%, transparent 60%)`,
        pointerEvents: 'none', zIndex: 0
      }} />

      {/* Page Header */}
      <div style={{ padding: '32px 32px', width: '100%', position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '600px', height: '100%', opacity: 0.8, backgroundImage: `url('/assets/bg_abstract_green.png')`, backgroundSize: 'cover', backgroundPosition: 'center', WebkitMaskImage: 'linear-gradient(to right, transparent, black 80%)', maskImage: 'linear-gradient(to right, transparent, black 80%)', pointerEvents: 'none', zIndex: -1 }} />
        <div>
          <h1 style={{ fontFamily: theme.fontAccent, fontWeight: 900, fontSize: 'clamp(26px, 5vw, 42px)', lineHeight: 1.1, color: '#059669', letterSpacing: '-1px', margin: 0 }}>
            Crop <span style={{ color: '#D97706' }}>Prediction</span>
          </h1>
          <p style={{ fontSize: '15px', color: theme.muted, marginTop: '8px', fontWeight: 500, margin: 0, maxWidth: '500px' }}>
            AI-powered crop recommendations based on your farm conditions for maximum profit.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{
        width: '100%', padding: '0 24px 48px', margin: '24px 0 0',
        display: 'grid', gridTemplateColumns: 'minmax(280px, 300px) 1fr', gap: '24px', alignItems: 'start', position: 'relative', zIndex: 1
      }}>
        {/* Left Column: Filter Panel */}
        <aside style={{
          background: theme.cardBg, borderRadius: '24px', padding: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: `1px solid ${theme.border}`,
          position: 'sticky', top: '90px'
        }}>
          {/* Farm Profile Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
             <div style={{ padding: '8px', background: '#ECFDF5', borderRadius: '12px', color: '#059669', display: 'flex' }}>
                <Person style={{ fontSize: '20px' }} />
             </div>
             <div>
               <div style={{ fontFamily: theme.fontAccent, fontWeight: 900, fontSize: '16px', color: '#0F172A' }}>Farm Profile</div>
               <div style={{ fontSize: '12px', color: theme.muted, fontWeight: 500 }}>Your field conditions</div>
             </div>
          </div>

          {/* Soil */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#F8FAFC', borderRadius: '16px', padding: '12px 16px', marginBottom: '16px' }}>
             <div style={{ padding: '8px', background: '#ECFDF5', borderRadius: '12px', color: '#059669', display: 'flex' }}>
                <Terrain style={{ fontSize: '18px' }} />
             </div>
             <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: theme.muted, marginBottom: '2px' }}>Soil Type</div>
                <select 
                  value={soilType} onChange={(e) => setSoilType(e.target.value)}
                  style={{ width: '100%', appearance: 'none', background: 'transparent', border: 'none', padding: 0, fontFamily: theme.fontBody, fontSize: '14px', fontWeight: 800, color: '#0F172A', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="Black Soil">Black Soil</option>
                  <option value="Red Soil">Red Soil</option>
                  <option value="Alluvial Soil">Alluvial Soil</option>
                  <option value="Sandy Soil">Sandy Soil</option>
                  <option value="Clay Soil">Clay Soil</option>
                  <option value="Loamy Soil">Loamy Soil</option>
                  <option value="Laterite Soil">Laterite Soil</option>
                </select>
             </div>
          </div>

          {/* Water */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#F8FAFC', borderRadius: '16px', padding: '12px 16px', marginBottom: '16px' }}>
             <div style={{ padding: '8px', background: '#ECFDF5', borderRadius: '12px', color: '#059669', display: 'flex' }}>
                <Opacity style={{ fontSize: '18px' }} />
             </div>
             <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: theme.muted, marginBottom: '2px' }}>Water Source</div>
                <select 
                  value={waterAvailability} onChange={(e) => setWaterAvailability(e.target.value)}
                  style={{ width: '100%', appearance: 'none', background: 'transparent', border: 'none', padding: 0, fontFamily: theme.fontBody, fontSize: '14px', fontWeight: 800, color: '#0F172A', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="more_water">High (Canal)</option>
                  <option value="moderate_water">Medium (Borewell)</option>
                  <option value="less_water">Low (Rainfed)</option>
                </select>
             </div>
          </div>

          {/* Duration */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#F8FAFC', borderRadius: '16px', padding: '12px 16px', marginBottom: '16px' }}>
             <div style={{ padding: '8px', background: '#ECFDF5', borderRadius: '12px', color: '#059669', display: 'flex' }}>
                <CalendarToday style={{ fontSize: '18px' }} />
             </div>
             <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: theme.muted, marginBottom: '2px' }}>Duration Plan</div>
                <select 
                  value={cropDurationType} onChange={(e) => setCropDurationType(e.target.value)}
                  style={{ width: '100%', appearance: 'none', background: 'transparent', border: 'none', padding: 0, fontFamily: theme.fontBody, fontSize: '14px', fontWeight: 800, color: '#0F172A', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="short_term">Short-Term</option>
                  <option value="long_term">Long-Term</option>
                  <option value="perennial">Perennial</option>
                </select>
             </div>
          </div>

          {/* Land */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#F8FAFC', borderRadius: '16px', padding: '12px 16px', marginBottom: '24px' }}>
             <div style={{ padding: '8px', background: '#ECFDF5', borderRadius: '12px', color: '#059669', display: 'flex' }}>
                <Agriculture style={{ fontSize: '18px' }} />
             </div>
             <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: theme.muted, marginBottom: '2px' }}>Land (Acres)</div>
                <input 
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={landSize} 
                  onChange={(e) => setLandSize(e.target.value)}
                  style={{ width: '100%', background: 'transparent', border: 'none', padding: 0, fontFamily: theme.fontBody, fontSize: '14px', fontWeight: 800, color: '#0F172A', outline: 'none' }}
                />
             </div>
          </div>

          {/* Weather Block */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '16px', background: '#FFFBEB',
            border: '1px solid #FEF3C7', borderRadius: '16px', padding: '16px', marginBottom: '24px'
          }}>
            <WbSunny style={{ fontSize: '32px', color: '#F59E0B' }} />
            <div>
              <div style={{ fontFamily: theme.fontAccent, fontWeight: 900, fontSize: '24px', color: '#D97706', lineHeight: 1 }}>{temperature !== null ? `${temperature}°C` : '--°C'}</div>
              <div style={{ fontSize: '12px', color: '#D97706', fontWeight: 600, marginTop: '4px' }}>{profile.season} · {weatherSummary?.isGps ? weatherSummary.locationName : (weatherSummary?.locationName?.split(',')[0] || profile.location?.split(',')[0])}</div>
            </div>
          </div>

          <button 
            onClick={handleRecommendation}
            disabled={uiState === 'loading'}
            style={{
              width: '100%', background: '#059669', color: '#fff', border: 'none', borderRadius: '12px',
              padding: '16px', fontFamily: theme.fontAccent, fontWeight: 800, fontSize: '15px',
              cursor: uiState === 'loading' ? 'wait' : 'pointer', transition: 'background .2s', boxShadow: '0 4px 12px rgba(5,150,105,0.2)',
              opacity: uiState === 'loading' ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
            }}
          >
            <TrendingUp style={{ fontSize: '18px' }} /> {uiState === 'loading' ? 'Predicting...' : 'Predict Now'}
          </button>
        </aside>

        {/* Right Column: Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {uiState === 'initial' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', backgroundColor: theme.cream, borderRadius: '20px', border: `1px dashed ${theme.border}`}}>
              <Spa style={{ fontSize: '40px', filter: 'grayscale(1)', opacity: 0.3 }} />
              <p style={{ color: theme.muted, fontWeight: 500, marginTop: '10px' }}>Adjust farm profile to see prediction</p>
            </div>
          )}

          {uiState === 'loading' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', backgroundColor: theme.cream, borderRadius: '20px', padding: '30px' }}>
              <h3 style={{ fontFamily: theme.fontAccent, color: theme.leaf }}>We are predicting the best crop for you...</h3>
              <p style={{ color: theme.muted, fontSize: '14px', marginTop: '8px' }}>Analyzing live market data and your soil profile to find the perfect match.</p>
            </div>
          )}

          {uiState === 'success' && topCrops.length > 0 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontFamily: theme.fontAccent, fontWeight: 800, fontSize: '14px', color: '#059669', background: '#ECFDF5', borderRadius: '24px', padding: '6px 16px', border: '1px solid #D1FAE5', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle style={{ fontSize: '16px' }} /> {topCrops.length} crops matched
                </span>
              </div>

              {/* Map Crops */}
              {topCrops.map((crop, idx) => {
                const isFirst = idx === 0;
                
                let suitBadgeStyle = { background: '#ECFDF5', color: '#059669' };
                let fillBarColor = `linear-gradient(90deg, #059669, #34D399)`;
                if (crop.finalScore < 60) {
                   suitBadgeStyle = { background: '#FEF2F2', color: '#DC2626' };
                   fillBarColor = `linear-gradient(90deg, #DC2626, #F87171)`;
                } else if (crop.finalScore < 80) {
                   suitBadgeStyle = { background: '#FFFBEB', color: '#D97706' };
                   fillBarColor = `linear-gradient(90deg, #D97706, #FBBF24)`;
                }

                return (
                  <div key={crop.name} style={{
                    background: '#fff', borderRadius: '20px', border: `1.5px solid ${isFirst ? '#059669' : '#E2E8F0'}`,
                    boxShadow: isFirst ? '0 8px 24px rgba(5, 150, 105, 0.08)' : '0 4px 12px rgba(0,0,0,0.02)', overflow: 'hidden', position: 'relative'
                  }}>
                    {isFirst && (
                       <div style={{ position: 'absolute', top: 0, right: 0, background: '#059669', color: '#fff', fontFamily: theme.fontAccent, fontWeight: 800, fontSize: '12px', padding: '6px 16px', borderBottomLeftRadius: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                         <EmojiEvents style={{ fontSize: '14px' }} /> #1 Best Match
                       </div>
                    )}
                    <div style={{ padding: '24px' }}>
                      
                      {/* Top Header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                        <div style={{ width: '80px', height: '80px', background: 'radial-gradient(circle, #F4FBF7 0%, #ECFDF5 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '42px', color: '#059669', flexShrink: 0 }}>
                          {getCropIcon(crop.name)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: theme.fontAccent, fontWeight: 900, fontSize: '22px', color: '#0F172A', marginBottom: '6px' }}>{crop.name}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                             <span style={{ ...suitBadgeStyle, borderRadius: '8px', padding: '4px 10px', fontSize: '12px', fontWeight: 800, fontFamily: theme.fontAccent, display: 'flex', alignItems: 'center', gap: '6px' }}>
                               <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} /> {crop.finalScore}% Suitability
                             </span>
                             <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>Market Price: <strong style={{ color: '#059669', fontWeight: 800 }}>₹{crop.marketPrice}/qtl</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Suitability Fill */}
                      <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>
                          <span>Suitability Score</span><span>{crop.finalScore}%</span>
                        </div>
                        <div style={{ height: '6px', background: '#F1F5F9', borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: fillBarColor, width: `${crop.finalScore}%`, borderRadius: '99px' }} />
                        </div>
                      </div>

                      {/* Metrics Strip */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', background: '#F1F5F9', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px', border: `1px solid #F1F5F9` }}>
                        <div style={{ background: '#fff', padding: '16px 12px', textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Total Profit</div>
                          <div style={{ fontFamily: theme.fontAccent, fontWeight: 900, fontSize: '18px', color: '#059669' }}>{formatCurrency(crop.totalProfit)}</div>
                        </div>
                        <div style={{ background: '#fff', padding: '16px 12px', textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Monthly Income</div>
                          <div style={{ fontFamily: theme.fontAccent, fontWeight: 900, fontSize: '18px', color: '#D97706' }}>{formatCurrency(crop.monthlyIncome)}</div>
                        </div>
                        <div style={{ background: '#fff', padding: '16px 12px', textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Per Acre</div>
                          <div style={{ fontFamily: theme.fontAccent, fontWeight: 900, fontSize: '18px', color: '#0F172A' }}>{formatCurrency(crop.profitPerAcre)}</div>
                        </div>
                      </div>

                      {/* Tags */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                        {crop.reasons?.map((rsn, idx) => (
                           <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F0FDF4', color: '#059669', borderRadius: '24px', padding: '6px 14px', fontSize: '12px', fontWeight: 600 }}>
                             <Spa style={{ fontSize: '14px' }} /> {rsn}
                           </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '12px' }}>
                         <button 
                           onClick={() => handleAddCrop(crop.name)}
                           style={{ flex: 1, background: '#059669', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px', fontFamily: theme.fontAccent, fontWeight: 800, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(5,150,105,0.2)' }}
                         >
                           + Add to Active Crops
                         </button>
                         <button 
                           onClick={() => handleQuickAddAndRedirect(crop.name)}
                           style={{ flex: 1, background: '#fff', color: '#059669', border: `1.5px solid #059669`, borderRadius: '12px', padding: '14px', fontFamily: theme.fontAccent, fontWeight: 800, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
                         >
                           View Journey →
                         </button>
                      </div>

                    </div>
                  </div>
                )
              })}
            </>
          )}

        </div>
      </div>
      
      {/* Mobile Responsiveness override logic */}
      <style>{`
        @media (max-width: 768px) {
           .app > div:nth-child(3) { grid-template-columns: 1fr !important; padding: 0 16px 48px !important; }
           aside { position: static !important; }
        }
      `}</style>
    </div>
  );
};

export default RecommendationPage;
