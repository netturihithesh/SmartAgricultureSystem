import React, { useState } from 'react';
import { Box, Typography, TextField, Button, InputAdornment, IconButton, Link, CircularProgress, MenuItem, Grid } from '@mui/material';
import { Visibility, VisibilityOff, Agriculture as EcoIcon } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/setup'); // Redirects to Farm Setup flow
    }, 1500);
  };

  const inputStyles = { 
    height: '50px', borderRadius: '10px', fontSize: '14px', backgroundColor: '#fff',
    '& fieldset': { borderColor: '#e3e7e6', borderWidth: '1px' },
    '&:hover fieldset': { borderColor: '#ccc !important' },
    '&.Mui-focused fieldset': { borderColor: '#2e7d32 !important', borderWidth: '1px !important' },
    '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(46,125,50,0.08)' }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(180deg, #f4f7f6, #eef3f1)', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      padding: { xs: '24px', md: '48px 24px' }
    }}>
      
      {/* 🌾 Top Branding Area */}
      <Box sx={{ textAlign: 'center', mb: '25px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
          <EcoIcon sx={{ fontSize: 36, color: '#2E7D32' }} />
          <Typography sx={{ fontSize: '26px', fontWeight: 800, color: '#1B5E20', letterSpacing: '0.5px' }}>SmartAgri</Typography>
        </Box>
        <Typography sx={{ fontSize: '15px', color: '#555', fontWeight: 500 }}>
          AI-powered crop intelligence platform
        </Typography>
      </Box>

      {/* 📝 Register Floating Card */}
      <Box 
        sx={{ 
          width: '100%', 
          maxWidth: '520px', 
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          p: { xs: '32px 24px', sm: '38px' },
          boxShadow: '0 30px 70px rgba(0,0,0,0.08)'
        }}
      >
        <Typography variant="h2" sx={{ fontSize: '24px', fontWeight: 700, color: '#111', mb: '8px', textAlign: 'center' }}>
          Create Your SmartAgri Account
        </Typography>
        <Typography sx={{ fontSize: '14px', color: '#666', mb: '32px', textAlign: 'center' }}>
          Start making data-driven crop decisions today
        </Typography>

        <form onSubmit={handleRegister}>
          <Grid container spacing={2}>
            {/* Full Name */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: '4px' }}>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#444', mb: '6px' }}>Full Name</Typography>
                <TextField fullWidth variant="outlined" placeholder="John Farmer" required InputProps={{ sx: inputStyles }} />
              </Box>
            </Grid>

            {/* Email */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: '4px' }}>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#444', mb: '6px' }}>Email Address</Typography>
                <TextField fullWidth variant="outlined" placeholder="farmer@email.com" type="email" required InputProps={{ sx: inputStyles }} />
              </Box>
            </Grid>

            {/* Password */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: '4px' }}>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#444', mb: '6px' }}>Password</Typography>
                <TextField fullWidth variant="outlined" placeholder="••••••••" type={showPassword ? 'text' : 'password'} required 
                  InputProps={{
                    sx: inputStyles,
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
            </Grid>

            {/* Confirm Password */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: '4px' }}>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#444', mb: '6px' }}>Confirm Password</Typography>
                <TextField fullWidth variant="outlined" placeholder="••••••••" type={showPassword ? 'text' : 'password'} required InputProps={{ sx: inputStyles }} />
              </Box>
            </Grid>

            {/* ⭐ Domain Specific AI Feature Injection! */}
            <Grid item xs={12}>
              <Box sx={{ my: '12px', pt: '16px', borderTop: '1px solid #eee' }}>
                <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#2e7d32', mb: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Smart Agriculture Initialization
                </Typography>
                <Typography sx={{ fontSize: '13px', color: '#666', mb: '16px' }}>
                  Provide base metrics to accurately calibrate your AI yield models.
                </Typography>
              </Box>
            </Grid>

            {/* Farm Location Dropdown */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: '12px' }}>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#444', mb: '6px' }}>Farm Location</Typography>
                <TextField select fullWidth variant="outlined" defaultValue="" required InputProps={{ sx: inputStyles }}>
                  <MenuItem value="" disabled>Select Region</MenuItem>
                  <MenuItem value="midwest">Midwest (USA)</MenuItem>
                  <MenuItem value="california">Central Valley (CA)</MenuItem>
                  <MenuItem value="europe">Western Europe</MenuItem>
                  <MenuItem value="asia">Southeast Asia</MenuItem>
                  <MenuItem value="other">Other Region</MenuItem>
                </TextField>
              </Box>
            </Grid>

            {/* Soil Type Dropdown */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: '12px' }}>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#444', mb: '6px' }}>Primary Soil Type</Typography>
                <TextField select fullWidth variant="outlined" defaultValue="" required InputProps={{ sx: inputStyles }}>
                  <MenuItem value="" disabled>Select Soil</MenuItem>
                  <MenuItem value="loam">Loam / Silt</MenuItem>
                  <MenuItem value="clay">Heavy Clay</MenuItem>
                  <MenuItem value="sandy">Sandy / Coarse</MenuItem>
                  <MenuItem value="peat">Peaty</MenuItem>
                  <MenuItem value="mixed">Mixed Types</MenuItem>
                </TextField>
              </Box>
            </Grid>
          </Grid>

          <Button 
            type="submit"
            variant="contained" 
            fullWidth
            disabled={loading}
            sx={{ 
              mt: '24px', height: '50px', borderRadius: '12px', backgroundColor: '#2e7d32', color: '#fff', 
              fontSize: '15px', fontWeight: 600, letterSpacing: '0.3px', textTransform: 'none',
              boxShadow: 'none', transition: 'all 0.25s ease',
              '&:hover': { backgroundColor: '#256628', transform: 'translateY(-1px)', boxShadow: '0 8px 16px rgba(46, 125, 50, 0.2)' },
              '&:disabled': { backgroundColor: '#A5D6A7', color: '#fff' }
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Create Smart Account'}
          </Button>
        </form>

        <Typography sx={{ textAlign: 'center', mt: '32px', fontSize: '14px', color: '#666' }}>
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" sx={{ color: '#2e7d32', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
            Sign In
          </Link>
        </Typography>
      </Box>

    </Box>
  );
};

export default RegisterPage;
