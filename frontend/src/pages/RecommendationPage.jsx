import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { fetchWeatherAndAlerts } from '../services/weatherService';
import { generateSmartRecommendation } from '../services/recommendationEngine';

// Colors mapped to match the wider SmartAgri MUI theme but retaining the premium earthly color grade
const theme = {
  soil: '#25211e', // Rich dark brown-black instead of flat gray
  leaf: '#2E7D32',
  leafMid: '#256628',
  leafBright: '#4CAF50',
  leafGlow: '#66BB6A',
  gold: '#c8902a', // Restored premium dark gold
  goldLight: '#e5b95c', // Premium light gold
  cream: '#fcfbfa', // Very subtle warm white
  creamDark: '#f0ebe0', // Earthy muted cream
  earth: '#8b6914', // Earthy brown/gold accent
  sky: '#E3F2FD',
  muted: '#7a7060', // Warm muted gray/brown
  cardBg: '#FFFFFF',
  pageBg: '#faf9f7', // Warm page background instead of stark white
  border: '#E8E4DF', // Warm border color
  shadowGreen: '0 4px 20px rgba(46,125,50,0.12)',
  shadowCard: '0 8px 30px rgba(0,0,0,0.06)',
  fontAccent: '"Inter", sans-serif',
  fontBody: '"Inter", sans-serif',
};

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
  if (n.includes('papaya')) return '🌿';
  return '🌱';
};

const formatCurrency = (val) => {
  return '₹' + val.toLocaleString('en-IN');
};

const RecommendationPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [uiState, setUiState] = useState('initial'); // 'initial', 'loading', 'success', 'error'

  const [soilType, setSoilType] = useState('');
  const [waterAvailability, setWaterAvailability] = useState('');
  const [cropDurationType, setCropDurationType] = useState('short_term');
  const [landSize, setLandSize] = useState('5');

  const [weatherSummary, setWeatherSummary] = useState(null);
  const [temperature, setTemperature] = useState(null);

  const [topCrops, setTopCrops] = useState([]);
  const [maxProfit, setMaxProfit] = useState(1);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Keep it minimal, rely on App.jsx CSS Baseline
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

  const handleSyncPrices = async () => {
    setIsSyncing(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/prices/update`, {
        method: 'POST',
      });
      if (response.ok) {
        alert('Live market prices synced successfully!');
      } else {
        alert('Failed to sync prices.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to the server to sync prices.');
    } finally {
      setIsSyncing(false);
    }
  };

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

      const maxP = Math.max(...winners.map(w => w.estimatedProfit), 1);
      setMaxProfit(maxP);

      setTopCrops(winners);
      setUiState('success');
    } catch (err) {
      console.error(err);
      setUiState('error');
    }
  };

  if (!profile) return null;

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
      <div style={{ padding: '100px 24px 0', maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontFamily: theme.fontAccent, fontWeight: 800, fontSize: 'clamp(26px, 5vw, 40px)', lineHeight: 1.1, color: theme.leaf, letterSpacing: '-1px', margin: 0 }}>
          Crop <span style={{ color: theme.gold }}>Prediction</span>
        </h1>
        <p style={{ fontSize: '14px', color: theme.muted, marginTop: '6px', fontWeight: 400, margin: 0 }}>
          Based on your soil, water & season — AI-ranked for maximum profit
        </p>
      </div>

      {/* Main Grid */}
      <div style={{
        maxWidth: '1100px', margin: '24px auto 0', padding: '0 24px 48px',
        display: 'grid', gridTemplateColumns: 'minmax(280px, 300px) 1fr', gap: '24px', alignItems: 'start', position: 'relative', zIndex: 1
      }}>
        {/* Left Column: Filter Panel */}
        <aside style={{
          background: theme.cardBg, borderRadius: '20px', padding: '24px',
          boxShadow: theme.shadowCard, border: `1px solid ${theme.border}`,
          position: 'sticky', top: '90px'
        }}>
          <div style={{ fontFamily: theme.fontAccent, fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '.08em', color: theme.muted, marginBottom: '16px' }}>
            Farm Profile
          </div>

          {/* Soil */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: theme.muted, marginBottom: '8px' }}>Soil Type</div>
            <select 
              value={soilType} onChange={(e) => setSoilType(e.target.value)}
              style={{ width: '100%', appearance: 'none', background: theme.cream, border: `1.5px solid ${theme.border}`, borderRadius: '12px', padding: '11px 14px', fontFamily: theme.fontBody, fontSize: '14px', fontWeight: 500, color: theme.soil, outline: 'none', cursor: 'pointer' }}
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

          {/* Water */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: theme.muted, marginBottom: '8px' }}>Water Source</div>
            <select 
              value={waterAvailability} onChange={(e) => setWaterAvailability(e.target.value)}
              style={{ width: '100%', appearance: 'none', background: theme.cream, border: `1.5px solid ${theme.border}`, borderRadius: '12px', padding: '11px 14px', fontFamily: theme.fontBody, fontSize: '14px', fontWeight: 500, color: theme.soil, outline: 'none', cursor: 'pointer' }}
            >
              <option value="more_water">High (Canal)</option>
              <option value="moderate_water">Medium (Borewell)</option>
              <option value="less_water">Low (Rainfed)</option>
            </select>
          </div>

          {/* Duration */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: theme.muted, marginBottom: '8px' }}>Duration Plan</div>
            <select 
              value={cropDurationType} onChange={(e) => setCropDurationType(e.target.value)}
              style={{ width: '100%', appearance: 'none', background: theme.cream, border: `1.5px solid ${theme.border}`, borderRadius: '12px', padding: '11px 14px', fontFamily: theme.fontBody, fontSize: '14px', fontWeight: 500, color: theme.soil, outline: 'none', cursor: 'pointer' }}
            >
              <option value="short_term">Short-Term</option>
              <option value="long_term">Long-Term</option>
              <option value="perennial">Perennial</option>
            </select>
          </div>

          {/* Land */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: theme.muted, marginBottom: '8px' }}>Land (Acres)</div>
            <input 
              type="number"
              min="0.1"
              step="0.1"
              value={landSize} 
              onChange={(e) => setLandSize(e.target.value)}
              style={{ width: '100%', background: theme.cream, border: `1.5px solid ${theme.border}`, borderRadius: '12px', padding: '11px 14px', fontFamily: theme.fontBody, fontSize: '14px', fontWeight: 500, color: theme.soil, outline: 'none' }}
            />
          </div>

          {/* Weather Chip */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px', background: 'linear-gradient(135deg, #fff8e8, #fef3d3)',
            border: '1.5px solid rgba(200,144,42,0.25)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px'
          }}>
            <div style={{ fontSize: '28px' }}>☀️</div>
            <div>
              <div style={{ fontFamily: theme.fontAccent, fontWeight: 700, fontSize: '22px', color: theme.gold }}>{temperature !== null ? `${temperature}°C` : '--°C'}</div>
              <div style={{ fontSize: '12px', color: theme.earth, fontWeight: 500 }}>{profile.season} · {profile.location?.split(',')[0]}</div>
            </div>
          </div>

          <button 
            onClick={handleSyncPrices}
            disabled={isSyncing}
            style={{
              width: '100%', background: 'transparent', color: theme.leaf, border: `1.5px solid ${theme.leaf}`, borderRadius: '14px',
              padding: '10px', fontFamily: theme.fontAccent, fontWeight: 600, fontSize: '13px',
              cursor: isSyncing ? 'wait' : 'pointer', transition: 'all .2s', marginBottom: '20px',
              opacity: isSyncing ? 0.6 : 1
            }}
          >
            {isSyncing ? 'Syncing...' : '🔄 Sync Live Prices'}
          </button>

          <button 
            onClick={handleRecommendation}
            disabled={uiState === 'loading'}
            style={{
              width: '100%', background: theme.leaf, color: '#fff', border: 'none', borderRadius: '14px',
              padding: '15px', fontFamily: theme.fontAccent, fontWeight: 700, fontSize: '15px',
              cursor: uiState === 'loading' ? 'wait' : 'pointer', transition: 'background .2s', boxShadow: '0 4px 16px rgba(45,90,27,0.3)',
              opacity: uiState === 'loading' ? 0.7 : 1
            }}
          >
            {uiState === 'loading' ? 'Predicting...' : 'Predict Now'}
          </button>
        </aside>

        {/* Right Column: Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {uiState === 'initial' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', backgroundColor: theme.cream, borderRadius: '20px', border: `1px dashed ${theme.border}`}}>
              <div style={{ fontSize: '40px', filter: 'grayscale(1)', opacity: 0.3 }}>🌱</div>
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
                <span style={{ fontFamily: theme.fontAccent, fontWeight: 700, fontSize: '14px', color: theme.leaf, background: 'rgba(82,168,50,0.1)', borderRadius: '20px', padding: '4px 12px' }}>
                  {topCrops.length} crops matched
                </span>
              </div>

              {/* Map Crops */}
              {topCrops.map((crop, idx) => {
                const isFirst = idx === 0;
                
                let suitBadgeStyle = { background: 'rgba(82,168,50,0.13)', color: '#2d6e10' };
                let fillBarColor = `linear-gradient(90deg, ${theme.leafMid}, ${theme.leafGlow})`;
                if (crop.finalScore < 60) {
                   suitBadgeStyle = { background: 'rgba(180,60,40,0.10)', color: '#8b3020' };
                   fillBarColor = `linear-gradient(90deg, #c0504d, #e07070)`;
                } else if (crop.finalScore < 80) {
                   suitBadgeStyle = { background: 'rgba(200,144,42,0.13)', color: '#8b5a10' };
                   fillBarColor = `linear-gradient(90deg, ${theme.gold}, ${theme.goldLight})`;
                }

                return (
                  <div key={crop.name} style={{
                    background: theme.cardBg, borderRadius: '20px', border: `1.5px solid ${isFirst ? 'rgba(200,144,42,0.35)' : theme.border}`,
                    boxShadow: theme.shadowCard, overflow: 'hidden', position: 'relative'
                  }}>
                    {isFirst && (
                       <div style={{ background: `linear-gradient(90deg, ${theme.gold}, ${theme.goldLight})`, color: '#fff', fontFamily: theme.fontAccent, fontWeight: 700, fontSize: '11px', letterSpacing: '.08em', textAlign: 'center', padding: '5px' }}>
                         # 1 Best Match
                       </div>
                    )}
                    <div style={{ padding: '20px' }}>
                      
                      {/* Top Header */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '48px', height: '48px', background: theme.cream, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', border: `1.5px solid ${theme.creamDark}` }}>
                            {getCropEmoji(crop.name)}
                          </div>
                          <div>
                            <div style={{ fontFamily: theme.fontAccent, fontWeight: 700, fontSize: '19px', color: theme.soil }}>{crop.name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px', flexWrap: 'wrap' }}>
                               <span style={{ ...suitBadgeStyle, borderRadius: '6px', padding: '3px 8px', fontSize: '12px', fontWeight: 600, fontFamily: theme.fontAccent, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                 <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} /> {crop.finalScore}% Suitability
                               </span>
                               <span style={{ fontSize: '12px', color: theme.muted, fontWeight: 400 }}>Market: <strong style={{ color: theme.leaf, fontWeight: 600 }}>₹{crop.marketPrice}/qtl</strong></span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Suitability Fill */}
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: theme.muted, marginBottom: '5px' }}>
                          <span>Suitability score</span><span>{crop.finalScore}%</span>
                        </div>
                        <div style={{ height: '6px', background: theme.creamDark, borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: fillBarColor, width: `${crop.finalScore}%` }} />
                        </div>
                      </div>

                      {/* Metrics Strip */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: theme.border, borderRadius: '12px', overflow: 'hidden', marginBottom: '14px', border: `1px solid ${theme.border}` }}>
                        <div style={{ background: theme.cream, padding: '12px 10px', textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', fontWeight: 500, color: theme.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '3px' }}>Total Profit</div>
                          <div style={{ fontFamily: theme.fontAccent, fontWeight: 700, fontSize: '15px', color: theme.leaf }}>{formatCurrency(crop.totalProfit)}</div>
                        </div>
                        <div style={{ background: theme.cream, padding: '12px 10px', textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', fontWeight: 500, color: theme.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '3px' }}>Monthly Income</div>
                          <div style={{ fontFamily: theme.fontAccent, fontWeight: 700, fontSize: '15px', color: theme.gold }}>{formatCurrency(crop.monthlyIncome)}</div>
                        </div>
                        <div style={{ background: theme.cream, padding: '12px 10px', textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', fontWeight: 500, color: theme.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '3px' }}>Per Acre</div>
                          <div style={{ fontFamily: theme.fontAccent, fontWeight: 700, fontSize: '15px', color: theme.soil }}>{formatCurrency(crop.profitPerAcre)}</div>
                        </div>
                      </div>

                      {/* Tags */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                        {crop.reasons?.map((rsn, idx) => (
                           <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(82,168,50,0.08)', border: '1px solid rgba(82,168,50,0.15)', color: theme.leaf, borderRadius: '20px', padding: '3px 10px', fontSize: '12px' }}>
                             {rsn}
                           </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '10px' }}>
                         <button style={{ flex: 1, background: theme.leaf, color: '#fff', border: 'none', borderRadius: '12px', padding: '12px 18px', fontFamily: theme.fontAccent, fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                           View Cultivation Plan →
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
