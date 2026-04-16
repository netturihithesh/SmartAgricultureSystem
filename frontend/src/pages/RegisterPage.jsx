import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, InputAdornment, IconButton, Link,
  CircularProgress, MenuItem, Stepper, Step, StepLabel, Fade, Alert, ToggleButtonGroup, ToggleButton,
  Autocomplete, useTheme
} from '@mui/material';
import {
  Visibility, VisibilityOff, Agriculture as EcoIcon, Person, Email,
  Lock, LocationOn, Terrain, SquareFoot, WaterDrop, WbSunny, ArrowForward, ArrowBack, ShareLocation
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { supabase } from '../supabase';
import statesData from '../data/statesDistricts.json';
import { useColorMode } from '../context/ThemeContext';

const RegisterPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [language, setLanguage] = useState('en');
  const navigate = useNavigate();
  const { mode } = useColorMode();
  const isDark = mode === 'dark';

  const bgPaper = isDark ? 'rgba(255,255,255,0.02)' : '#ffffff';
  const textPrimary = isDark ? '#e2e8f0' : '#1e293b';
  const textSecondary = isDark ? '#94a3b8' : '#475569';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e0e0e0';
  const accentColor = isDark ? '#39FF6A' : '#2E7D32';

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    state: '',
    district: '',
    soilType: '',
    landSize: '',
    irrigation: ''
  });

  const getSeason = (state) => {
    const month = new Date().getMonth() + 1;
    if (['Tamil Nadu', 'Kerala'].includes(state)) {
      if (month >= 5 && month <= 9) return 'Kharif';
    } else {
      if (month >= 6 && month <= 10) return 'Kharif';
    }
    if (month > 10 || month <= 3) return 'Rabi';
    return 'Zaid';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'landSize' && value !== '' && Number(value) <= 0) return;
    if (name === 'state') {
      setFormData({ ...formData, state: value, district: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleLanguageChange = (event, newLanguage) => {
    if (newLanguage !== null) setLanguage(newLanguage);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (activeStep === 0) {
      if (formData.password !== formData.confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
      setActiveStep(1);
    } else {
      setLoading(true);
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });
        if (authError) throw authError;

        if (authData.user) {
          const locationString = `${formData.district}, ${formData.state}`;
          const formattedLandSize = `${formData.landSize} Acres`;

          const { error: profileError } = await supabase.from('profiles').insert([
            {
              id: authData.user.id,
              full_name: formData.name,
              location: locationString,
              soil_type: formData.soilType,
              land_size: formattedLandSize,
              irrigation: formData.irrigation,
              season: getSeason(formData.state)
            }
          ]);
          if (profileError) throw profileError;

          // Success message injection before redirect
          setSuccessMsg('Account created successfully! Taking you to the Home action page...');
          setTimeout(() => {
            navigate('/'); 
          }, 2000);
        }
      } catch (err) {
        setErrorMsg(err.message || 'An error occurred during registration.');
      } finally {
        setLoading(false);
      }
    }
  };

  const steps = ['Step 1: Account', 'Step 2: Farm'];

  const inputStyles = {
    height: '56px',
    borderRadius: '12px',
    fontSize: '16px',
    backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#FAFAFA',
    color: textPrimary,
    '& fieldset': { borderColor: borderColor, borderWidth: '1.5px', borderRadius: '12px' },
    '&:hover fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.3)' : '#BDBDBD !important' },
    '&.Mui-focused fieldset': { borderColor: `${accentColor} !important`, borderWidth: '2px !important' },
    '&.Mui-focused': { backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : bgPaper, boxShadow: isDark ? `0 4px 12px rgba(57,255,106,0.15)` : '0 4px 12px rgba(46,125,50,0.08)' },
    transition: 'all 0.2s ease-in-out'
  };

  const iconColor = isDark ? '#aaa' : '#888';
  const indianStates = Object.keys(statesData);
  const availableDistricts = formData.state ? (statesData[formData.state] || []) : [];

  return (
    <Box sx={{
      minHeight: '100vh',
      background: isDark ? '#0A0D0B' : 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: { xs: '16px', md: '48px 24px' },
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* Decorative Background Elements */}
      {!isDark && (
        <>
          <Box sx={{ position: 'absolute', top: '-10%', left: '-5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }} />
          <Box sx={{ position: 'absolute', bottom: '-5%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(46,125,50,0.1) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }} />
        </>
      )}

      {/* Language Toggle */}
      <Box sx={{ position: 'absolute', top: '16px', right: '24px', zIndex: 2 }}>
        <ToggleButtonGroup
          value={language}
          exclusive
          onChange={handleLanguageChange}
          size="small"
          sx={{ backgroundColor: bgPaper, borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
        >
          <ToggleButton value="en" sx={{ fontWeight: 600, color: textPrimary }}>EN</ToggleButton>
          <ToggleButton value="te" sx={{ fontWeight: 600, color: textPrimary }}>తెలుగు</ToggleButton>
          <ToggleButton value="hi" sx={{ fontWeight: 600, color: textPrimary }}>हिंदी</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Branding */}
      <Box sx={{ textAlign: 'center', mb: '24px', mt: { xs: '40px', md: '0' }, zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
          <EcoIcon sx={{ fontSize: 42, color: accentColor, filter: isDark ? 'drop-shadow(0px 0px 8px rgba(57,255,106,0.3))' : 'drop-shadow(0px 4px 8px rgba(46, 125, 50, 0.3))' }} />
          <Typography sx={{ fontSize: '32px', fontWeight: 800, color: isDark ? '#e2e8f0' : '#1B5E20', letterSpacing: '-0.5px' }}>SmartAgri</Typography>
        </Box>
      </Box>

      {/* Card */}
      <Box
        sx={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: bgPaper,
          backdropFilter: isDark ? 'blur(10px)' : 'blur(20px)',
          borderRadius: '24px',
          p: { xs: '24px 20px', sm: '40px' },
          boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.6)' : '0 24px 60px rgba(0,0,0,0.08)',
          zIndex: 1,
          border: `1px solid ${borderColor}`
        }}
      >
        <Typography variant="h2" sx={{ fontSize: { xs: '22px', sm: '26px' }, fontWeight: 800, color: textPrimary, mb: '12px', textAlign: 'center' }}>
          {activeStep === 0 ? 'Create an Account' : 'Farm Details'}
        </Typography>
        <Typography sx={{ fontSize: '16px', color: textSecondary, mb: '32px', textAlign: 'center' }}>
          {activeStep === 0 ? 'Start making data-driven crop decisions.' : 'Enter your farm metrics for AI calibration.'}
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4, '& .MuiStepIcon-root.Mui-active': { color: accentColor }, '& .MuiStepIcon-root.Mui-completed': { color: isDark ? '#2fe058' : '#4CAF50' } }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>
                <Typography sx={{ fontWeight: 600, fontSize: '14px', color: textSecondary }}>{label}</Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {errorMsg && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{errorMsg}</Alert>}
        {successMsg && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>{successMsg}</Alert>}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {activeStep === 0 && (
              <Fade in={activeStep === 0}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  <Box>
                    <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#222', mb: '6px' }}>Full Name</Typography>
                    <TextField fullWidth variant="outlined" placeholder="Enter your full name" name="name" value={formData.name} onChange={handleChange} required 
                      FormHelperTextProps={{ sx: { fontSize: '13px' } }}
                      InputProps={{ sx: inputStyles, startAdornment: <InputAdornment position="start"><Person sx={{ color: iconColor }} /></InputAdornment> }} 
                    />
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#222', mb: '6px' }}>Email Address</Typography>
                    <TextField fullWidth variant="outlined" placeholder="Enter your email" type="email" name="email" value={formData.email} onChange={handleChange} required 
                      FormHelperTextProps={{ sx: { fontSize: '13px' } }}
                      InputProps={{ sx: inputStyles, startAdornment: <InputAdornment position="start"><Email sx={{ color: iconColor }} /></InputAdornment> }} 
                    />
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#222', mb: '6px' }}>Password</Typography>
                    <TextField fullWidth variant="outlined" placeholder="Create a strong password" type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required 
                      FormHelperTextProps={{ sx: { fontSize: '13px' } }}
                      InputProps={{
                        sx: inputStyles,
                        startAdornment: <InputAdornment position="start"><Lock sx={{ color: iconColor }} /></InputAdornment>,
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#999' }}>
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#222', mb: '6px' }}>Confirm Password</Typography>
                    <TextField fullWidth variant="outlined" placeholder="Re-enter your password" type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required 
                      FormHelperTextProps={{ sx: { fontSize: '13px' } }}
                      InputProps={{ sx: inputStyles, startAdornment: <InputAdornment position="start"><Lock sx={{ color: iconColor }} /></InputAdornment> }} 
                    />
                  </Box>

                </Box>
              </Fade>
            )}

            {/* --- STEP 2: Farm Setup --- */}
            {activeStep === 1 && (
              <Fade in={activeStep === 1} timeout={500}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Location - State & District Group */}
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: '16px' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#222', mb: '6px' }}>State</Typography>
                      <Autocomplete
                        options={indianStates}
                        value={formData.state || null}
                        onChange={(event, newValue) => {
                          setFormData({ ...formData, state: newValue || '', district: '' });
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            required={!formData.state}
                            placeholder="Type to search State"
                            helperText="(Search and select your State)"
                            FormHelperTextProps={{ sx: { fontSize: '13px', ml: 0 } }}
                            InputProps={{
                              ...params.InputProps,
                              sx: inputStyles,
                              startAdornment: (
                                <>
                                  <InputAdornment position="start" sx={{ pl: 1 }}><LocationOn sx={{ color: iconColor }} /></InputAdornment>
                                  {params.InputProps.startAdornment}
                                </>
                              )
                            }}
                          />
                        )}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#222', mb: '6px' }}>District</Typography>
                      <Autocomplete
                        options={availableDistricts}
                        value={formData.district || null}
                        disabled={!formData.state}
                        onChange={(event, newValue) => {
                          setFormData({ ...formData, district: newValue || '' });
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            required={!formData.district}
                            placeholder={formData.state ? "Type to search District" : "Select State first"}
                            helperText="(Search and select your District)"
                            FormHelperTextProps={{ sx: { fontSize: '13px', ml: 0 } }}
                            InputProps={{
                              ...params.InputProps,
                              sx: inputStyles,
                              startAdornment: (
                                <>
                                  <InputAdornment position="start" sx={{ pl: 1 }}><ShareLocation sx={{ color: iconColor }} /></InputAdornment>
                                  {params.InputProps.startAdornment}
                                </>
                              )
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>

                  {/* Soil Type */}
                  <Box>
                    <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#222', mb: '6px' }}>Soil Type</Typography>
                    <TextField select fullWidth variant="outlined" name="soilType" value={formData.soilType} onChange={handleChange} required 
                      helperText="(Select the type of soil in your farm)" FormHelperTextProps={{ sx: { fontSize: '13px', ml: 0 } }}
                      InputProps={{ sx: inputStyles, startAdornment: <InputAdornment position="start"><Terrain sx={{ color: iconColor }} /></InputAdornment> }}
                    >
                      <MenuItem value="" disabled>Select Soil Type</MenuItem>
                      <MenuItem value="Alluvial Soil">Alluvial Soil</MenuItem>
                      <MenuItem value="Black Soil">Black Soil</MenuItem>
                      <MenuItem value="Red Soil">Red Soil</MenuItem>
                      <MenuItem value="Laterite Soil">Laterite Soil</MenuItem>
                      <MenuItem value="Sandy Soil">Sandy Soil</MenuItem>
                      <MenuItem value="Clay Soil">Clay Soil</MenuItem>
                      <MenuItem value="Loamy Soil">Loamy Soil</MenuItem>
                    </TextField>
                  </Box>

                  {/* Land Size */}
                  <Box>
                    <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#222', mb: '6px' }}>Land Size</Typography>
                    <TextField fullWidth variant="outlined" type="number" name="landSize" value={formData.landSize} onChange={handleChange} required 
                      placeholder="2.5"
                      error={formData.landSize !== '' && Number(formData.landSize) <= 0}
                      helperText={formData.landSize !== '' && Number(formData.landSize) <= 0 ? 'Land size must be greater than 0' : '(Enter total area of your farm)'}
                      FormHelperTextProps={{ sx: { fontSize: '13px', ml: 0 } }}
                      inputProps={{ min: '0.01', step: 'any' }}
                      InputProps={{ 
                        sx: inputStyles, 
                        startAdornment: <InputAdornment position="start"><SquareFoot sx={{ color: iconColor }} /></InputAdornment>,
                        endAdornment: <InputAdornment position="end"><Typography sx={{ fontWeight: 600, color: '#555' }}>Acres</Typography></InputAdornment>
                      }}
                    />
                  </Box>

                  {/* Irrigation */}
                  <Box>
                    <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#222', mb: '6px' }}>Irrigation</Typography>
                    <TextField select fullWidth variant="outlined" name="irrigation" value={formData.irrigation} onChange={handleChange} required 
                      helperText="(How well is your farm watered?)" FormHelperTextProps={{ sx: { fontSize: '13px', ml: 0 } }}
                      InputProps={{ sx: inputStyles, startAdornment: <InputAdornment position="start"><WaterDrop sx={{ color: iconColor }} /></InputAdornment> }}
                    >
                      <MenuItem value="" disabled>Select Irrigation Level</MenuItem>
                      <MenuItem value="Good Water Available">Good Water Available</MenuItem>
                      <MenuItem value="Limited Water">Limited Water</MenuItem>
                      <MenuItem value="No Irrigation">No Irrigation</MenuItem>
                    </TextField>
                  </Box>

                  {/* Season */}
                  <Box>
                    <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#222', mb: '6px' }}>Season</Typography>
                    <TextField fullWidth variant="outlined" name="season" value={getSeason(formData.state)} 
                      helperText="(Auto-detected based on current month and state)" FormHelperTextProps={{ sx: { fontSize: '13px', ml: 0 } }}
                      InputProps={{ sx: { ...inputStyles, backgroundColor: '#EEEEEE' }, startAdornment: <InputAdornment position="start"><WbSunny sx={{ color: iconColor }} /></InputAdornment>, readOnly: true }}
                    />
                  </Box>

                </Box>
              </Fade>
            )}

            <Box sx={{ display: 'flex', gap: '16px', mt: 2 }}>
              {activeStep === 1 && <Button onClick={() => setActiveStep(0)} variant="outlined" sx={{ height: '56px', borderRadius: '12px', minWidth: '60px', color: textSecondary, borderColor: borderColor }}><ArrowBack /></Button>}
              <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ height: '56px', borderRadius: '12px', backgroundColor: accentColor, color: isDark ? '#000' : '#fff', fontWeight: 700, textTransform: 'none', boxShadow: 'none', '&:hover': { backgroundColor: isDark ? '#2fe058' : '#1B5E20' }, '&:disabled': { backgroundColor: isDark ? '#4CAF50' : '#A5D6A7', color: isDark ? '#000' : '#fff' } }}>
                {loading ? <CircularProgress size={24} sx={{ color: isDark ? '#000' : '#fff' }} /> : (activeStep === 0 ? 'Next Step' : 'Create Account 🌾')}
              </Button>
            </Box>
          </Box>
        </form>

        <Typography sx={{ textAlign: 'center', mt: 4, color: textSecondary }}>
          Already have an account? <Link component={RouterLink} to="/login" sx={{ color: accentColor, fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Sign In</Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterPage;
