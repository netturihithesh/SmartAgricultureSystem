import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Paper, Grid, Button, Chip, InputAdornment, TextField, CircularProgress } from '@mui/material';
import { 
  MonetizationOn, InfoOutlined, Spa, Science, WaterDrop, Engineering, 
  PestControl, Agriculture, Adjust, AccountBalanceWallet, Replay, Shield, Lightbulb 
} from '@mui/icons-material';
import { supabase } from '../supabase';
import { calculateProfitSnapshot } from '../services/profitUtils';
import cropDataList from '../data/crop_data.json';
import cropProcessData from '../data/crop_process.json';

const ProfitPage = () => {
  const [profile, setProfile] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [loading, setLoading] = useState(true);

  // Expense States (User Editable)
  const [expenses, setExpenses] = useState({
    seeds: 0,
    fertilizers: 0,
    irrigation: 0,
    labor: 0,
    pesticides: 0,
    machinery: 0,
    others: 0
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      let initialCrop = cropProcessData[0];

      if (session?.user?.id) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data }) => {
          if (data) setProfile(data);
        });

        try {
          const crops = JSON.parse(localStorage.getItem(`user_crops_${session.user.id}`) || '[]');
          if (Array.isArray(crops) && crops.length > 0) {
            let activeIndex = parseInt(localStorage.getItem(`active_crop_index_${session.user.id}`) || '0');
            if (isNaN(activeIndex) || activeIndex >= crops.length) activeIndex = 0;
            const rawName = crops[activeIndex]?.cropName || crops[activeIndex]?.crop_name || '';
            const targetName = rawName.toLowerCase();
            if (targetName) {
              const found = cropProcessData.find(c => c.crop_name && c.crop_name.toLowerCase().includes(targetName));
              if (found) initialCrop = found;
            }
          }
        } catch (e) {
          console.error("Error loading user crops:", e);
        }
      }

      setSelectedCrop(initialCrop);
      setLoading(false);
    });
  }, []);

  const landSizeNum = useMemo(() => {
    const raw = profile?.land_size || 8; // using 8 to match the screenshot defaults
    const parsed = parseFloat(raw.toString().replace(/[^0-9.]/g, ''));
    return isNaN(parsed) || parsed <= 0 ? 8 : parsed;
  }, [profile]);

  const cropEconomics = useMemo(() => {
    if (!selectedCrop || !selectedCrop.crop_name) return cropDataList[0];
    const sName = selectedCrop.crop_name.toLowerCase();
    return cropDataList.find(c => c.crop_name && c.crop_name.toLowerCase().includes(sName)) || cropDataList[0];
  }, [selectedCrop]);

  const weatherYieldImpact = 0.05; // +5% yield boost

  const profitData = useMemo(() => {
    if (!selectedCrop || !cropEconomics) return null;
    return calculateProfitSnapshot(
      cropEconomics,
      landSizeNum,
      selectedCrop.total_duration_days || 140,
      selectedCrop.crop_name || 'Paddy (Basmati)',
      weatherYieldImpact
    );
  }, [selectedCrop, cropEconomics, landSizeNum]);

  const handleResetExpenses = () => {
    setExpenses({
      seeds: Math.round(landSizeNum * 3500),
      fertilizers: Math.round(landSizeNum * 4800),
      irrigation: Math.round(landSizeNum * 2200),
      labor: Math.round(landSizeNum * 5500),
      pesticides: Math.round(landSizeNum * 1500),
      machinery: Math.round(landSizeNum * 1000),
      others: Math.round(landSizeNum * 1000)
    });
  };

  // Set default expenses once when landSizeNum is ready
  useEffect(() => {
    if (landSizeNum && profile?.id) {
      const saved = localStorage.getItem(`custom_expenses_${profile.id}`);
      if (saved) {
        try {
          setExpenses(JSON.parse(saved));
          return;
        } catch(e) {
          console.error(e);
        }
      }
      handleResetExpenses();
    } else if (landSizeNum) {
      handleResetExpenses();
    }
  }, [landSizeNum, profile]);

  useEffect(() => {
    if (profile?.id) {
      localStorage.setItem(`custom_expenses_${profile.id}`, JSON.stringify(expenses));
    }
  }, [expenses, profile]);

  const handleExpenseChange = (field, value) => {
    const num = parseInt(value) || 0;
    setExpenses(prev => ({ ...prev, [field]: num }));
  };

  const totalExpenses = Object.values(expenses).reduce((a, b) => a + b, 0);
  const estimatedGrossRevenue = profitData ? profitData.totalYield * profitData.marketPricePerQ : 0;
  const estimatedNetProfit = estimatedGrossRevenue - totalExpenses;

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}><CircularProgress sx={{ color: '#059669' }} /></Box>;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3, lg: 4 }, pb: 10, bgcolor: '#F8FAFC', minHeight: '100vh', width: '100%', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Header Banner */}
      <Paper sx={{ p: 4, mb: 4, background: '#065F46', color: '#fff', borderRadius: '20px', position: 'relative', overflow: 'hidden' }}>
        {/* Abstract Leaf Background */}
        <Box sx={{ position: 'absolute', right: '-5%', top: '-20%', width: '400px', height: '300px', opacity: 0.15, backgroundImage: `url('/assets/bg_abstract_green.png')`, backgroundSize: 'cover', backgroundPosition: 'center', pointerEvents: 'none', maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)', WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)' }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, position: 'relative', zIndex: 1 }}>
          <Box>
            <Chip icon={<MonetizationOn sx={{ color: '#FCD34D !important', fontSize: '18px' }} />} label="Financial Analytics & Revenue Estimator" sx={{ bgcolor: '#047857', color: '#fff', fontWeight: 600, mb: 2, borderRadius: '8px', '& .MuiChip-label': { px: 1.5 } }} size="small" />
            <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '28px', md: '34px' }, mb: 1, letterSpacing: '-0.5px' }}>
              Profit Snapshot & Economics
            </Typography>
            <Typography variant="body1" sx={{ color: '#A7F3D0', fontSize: '15px', fontWeight: 400 }}>
              Real-time weather-adjusted yield estimates, market rate benchmarks, and revenue forecasts.
            </Typography>
          </Box>
          {selectedCrop && (
            <Paper sx={{ p: '14px 24px', bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px', color: '#fff', display: 'flex', flexDirection: 'column', minWidth: '180px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Spa sx={{ fontSize: '16px', color: '#6EE7B7' }} />
                <Typography variant="caption" sx={{ color: '#6EE7B7', fontWeight: 700, letterSpacing: '0.5px' }}>ACTIVE CROP</Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '18px' }}>{selectedCrop.crop_name}</Typography>
              <Typography variant="body2" sx={{ color: '#D1FAE5', mt: 0.5 }}>{landSizeNum} Acres</Typography>
            </Paper>
          )}
        </Box>
      </Paper>

      {/* Main Content Grid */}
      {profitData && (
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={7} lg={7} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* Expected Revenue Breakdown Card */}
            <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '18px' }}>Expected Revenue Breakdown</Typography>
                  <InfoOutlined sx={{ color: '#94A3B8', fontSize: '20px' }} />
                </Box>
                <Chip label={`+${(weatherYieldImpact * 100).toFixed(1)}% Weather Yield Boost`} sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700, borderRadius: '8px' }} size="small" />
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '16px', mb: 3 }}>
                {/* Gross Revenue Main */}
                <Box sx={{ p: 3, flex: '1 1 300px', borderRight: { xs: 'none', md: '1px solid #DCFCE7' }, borderBottom: { xs: '1px solid #DCFCE7', md: 'none' } }}>
                  <Typography variant="caption" sx={{ color: '#059669', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>ESTIMATED GROSS REVENUE</Typography>
                  <Typography variant="h2" sx={{ fontWeight: 900, color: '#065F46', my: 1, fontSize: '42px', letterSpacing: '-1px' }}>
                    ₹{estimatedGrossRevenue.toLocaleString('en-IN')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#047857', fontWeight: 500 }}>
                    Calculated across {landSizeNum} Acres for a {selectedCrop?.total_duration_days || 140}-day crop cycle.
                  </Typography>
                </Box>
                {/* 3 Stats */}
                <Box sx={{ display: 'flex', flex: '1 1 auto', divideX: '1px solid #DCFCE7' }}>
                  <Box sx={{ flex: 1, p: 3, textAlign: 'center', borderRight: '1px solid #DCFCE7', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Projected Yield</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.5 }}>{profitData.totalYield} Quintals</Typography>
                  </Box>
                  <Box sx={{ flex: 1, p: 3, textAlign: 'center', borderRight: '1px solid #DCFCE7', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Market Rate</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.5 }}>₹{profitData.marketPricePerQ.toLocaleString('en-IN')} /q</Typography>
                  </Box>
                  <Box sx={{ flex: 1, p: 3, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Est. Monthly Income</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#059669', mt: 0.5 }}>₹{profitData.monthlyIncome.toLocaleString('en-IN')}</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Equation row */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#F8FAFC', borderRadius: '12px', p: 2.5, px: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Projected Yield</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#0F172A' }}>{profitData.totalYield} q</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600 }}>x</Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Market Rate</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#0F172A' }}>₹{profitData.marketPricePerQ.toLocaleString('en-IN')} /q</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600 }}>=</Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Gross Revenue</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800, color: '#059669' }}>₹{estimatedGrossRevenue.toLocaleString('en-IN')}</Typography>
                </Box>
              </Box>
            </Paper>

            {/* Profit Overview Card */}
            <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '18px', mb: 3 }}>Profit Overview</Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 3, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                <Box sx={{ flex: 1, minWidth: '200px', p: 3, bgcolor: '#F0FDF4', borderRadius: '16px', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700, display: 'block', mb: 1 }}>Estimated Gross Revenue</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#059669' }}>₹{estimatedGrossRevenue.toLocaleString('en-IN')}</Typography>
                </Box>
                <Typography variant="h5" sx={{ color: '#94A3B8', fontWeight: 400 }}>-</Typography>
                <Box sx={{ flex: 1, minWidth: '200px', p: 3, bgcolor: '#FFFBEB', borderRadius: '16px', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 700, display: 'block', mb: 1 }}>Total Expenses (Your Inputs)</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#B45309' }}>₹{totalExpenses.toLocaleString('en-IN')}</Typography>
                </Box>
                <Typography variant="h5" sx={{ color: '#94A3B8', fontWeight: 400 }}>=</Typography>
                <Box sx={{ flex: 1, minWidth: '200px', p: 3, bgcolor: '#F0FDF4', borderRadius: '16px', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700, display: 'block', mb: 1 }}>Estimated Net Profit</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#059669' }}>₹{estimatedNetProfit.toLocaleString('en-IN')}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, p: 2, bgcolor: '#F8FAFC', borderRadius: '12px' }}>
                <Lightbulb sx={{ color: '#3B82F6', fontSize: '20px' }} />
                <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>Add your actual expenses on the right to calculate your original (net) profit.</Typography>
              </Box>
            </Paper>

          </Grid>

          {/* Right Column: Expense Tracker */}
          <Grid item xs={12} md={5} lg={5}>
            <Paper sx={{ p: 4, borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Box sx={{ p: 1.5, bgcolor: '#ECFDF5', borderRadius: '12px', color: '#059669', display: 'flex' }}>
                  <AccountBalanceWallet />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '18px' }}>Your Expense Tracker</Typography>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>Add your actual farming expenses</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 'auto' }}>
                {[
                  { key: 'seeds', label: 'Seeds & Saplings', icon: <Spa fontSize="small" />, color: '#10B981' },
                  { key: 'fertilizers', label: 'Fertilizers & Nutrients', icon: <Science fontSize="small" />, color: '#3B82F6' },
                  { key: 'irrigation', label: 'Irrigation & Power', icon: <WaterDrop fontSize="small" />, color: '#0EA5E9' },
                  { key: 'labor', label: 'Labor & Harvesting', icon: <Engineering fontSize="small" />, color: '#F59E0B' },
                  { key: 'pesticides', label: 'Pesticides & Chemicals', icon: <PestControl fontSize="small" />, color: '#22C55E' },
                  { key: 'machinery', label: 'Machinery & Fuel', icon: <Agriculture fontSize="small" />, color: '#F97316' },
                  { key: 'others', label: 'Others', icon: <Adjust fontSize="small" />, color: '#94A3B8' },
                ].map((item) => (
                  <Box key={item.key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: `${item.color}15`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.icon}
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>{item.label}</Typography>
                    </Box>
                    <TextField
                      variant="outlined"
                      size="small"
                      value={expenses[item.key]}
                      onChange={(e) => handleExpenseChange(item.key, e.target.value)}
                      sx={{ width: '120px', '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: '#F8FAFC' }, '& input': { textAlign: 'right', fontWeight: 600, color: '#0F172A' } }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  </Box>
                ))}
              </Box>

              <Box sx={{ mt: 4, p: 3, bgcolor: '#FFFBEB', borderRadius: '16px', border: '1px solid #FEF3C7', mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 800, display: 'block', mb: 0.5 }}>TOTAL EXPENSES</Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#B45309' }}>₹{totalExpenses.toLocaleString('en-IN')}</Typography>
              </Box>

              <Button
                variant="outlined"
                fullWidth
                startIcon={<Replay />}
                onClick={handleResetExpenses}
                sx={{ borderColor: '#A7F3D0', color: '#059669', fontWeight: 700, borderRadius: '12px', py: 1.5, textTransform: 'none', '&:hover': { bgcolor: '#ECFDF5', borderColor: '#059669' } }}
              >
                Reset Expenses
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Footer Info */}
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, p: 1.5, px: 3, bgcolor: '#ECFDF5', borderRadius: '12px', mt: 4 }}>
        <Shield sx={{ color: '#059669', fontSize: '18px' }} />
        <Typography variant="body2" sx={{ color: '#047857', fontWeight: 600, fontSize: '13px' }}>
          All estimates are based on current weather, market trends & historical data.
        </Typography>
      </Box>

    </Box>
  );
};

export default ProfitPage;
