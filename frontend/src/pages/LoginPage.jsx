import React, { useState } from 'react';
import { Box, Typography, TextField, Button, InputAdornment, IconButton, Link, Divider, CircularProgress } from '@mui/material';
import { Visibility, VisibilityOff, Google, Agriculture as EcoIcon } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(180deg, #f4f7f6, #eef3f1)', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '24px'
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

      {/* 🔐 Login Floating Card */}
      <Box 
        sx={{ 
          width: '100%', 
          maxWidth: '400px',
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          p: { xs: '32px 24px', sm: '38px' },
          boxShadow: '0 30px 70px rgba(0,0,0,0.08)'
        }}
      >
        <Typography variant="h2" sx={{ fontSize: '24px', fontWeight: 700, color: '#111', mb: '8px', textAlign: 'center' }}>
          Welcome Back 👋
        </Typography>
        <Typography sx={{ fontSize: '14px', color: '#666', mb: '24px', textAlign: 'center' }}>
          Login to access your smart farming dashboard
        </Typography>

        <form onSubmit={handleLogin}>
          <Box sx={{ mb: '16px' }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#444', mb: '6px' }}>Email Address</Typography>
            <TextField 
              fullWidth
              variant="outlined"
              placeholder="farmer@email.com"
              type="email"
              required
              InputProps={{
                sx: { 
                  height: '50px', borderRadius: '10px', fontSize: '14px', backgroundColor: '#fff',
                  '& fieldset': { borderColor: '#e3e7e6', borderWidth: '1px' },
                  '&:hover fieldset': { borderColor: '#ccc !important' },
                  '&.Mui-focused fieldset': { borderColor: '#2e7d32 !important', borderWidth: '1px !important' },
                  '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(46,125,50,0.08)' }
                }
              }}
            />
          </Box>

          <Box sx={{ mb: '10px' }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#444', mb: '6px' }}>Password</Typography>
            <TextField 
              fullWidth
              variant="outlined"
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
              required
              InputProps={{
                sx: { 
                  height: '50px', borderRadius: '10px', fontSize: '14px', backgroundColor: '#fff',
                  '& fieldset': { borderColor: '#e3e7e6', borderWidth: '1px' },
                  '&:hover fieldset': { borderColor: '#ccc !important' },
                  '&.Mui-focused fieldset': { borderColor: '#2e7d32 !important', borderWidth: '1px !important' },
                  '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(46,125,50,0.08)' }
                },
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

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: '24px' }}>
            <Link href="#" underline="hover" sx={{ fontSize: '13px', color: '#2E7D32', fontWeight: 600 }}>
              Forgot Password?
            </Link>
          </Box>

          <Button 
            type="submit"
            variant="contained" 
            fullWidth
            disabled={loading}
            sx={{ 
              height: '50px', borderRadius: '12px', backgroundColor: '#2e7d32', color: '#fff', 
              fontSize: '15px', fontWeight: 600, letterSpacing: '0.3px', textTransform: 'none',
              boxShadow: 'none', transition: 'all 0.25s ease',
              '&:hover': { backgroundColor: '#256628', transform: 'translateY(-1px)', boxShadow: '0 8px 16px rgba(46, 125, 50, 0.15)' },
              '&:disabled': { backgroundColor: '#A5D6A7', color: '#fff' }
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Login to Dashboard'}
          </Button>
        </form>

        <Box sx={{ display: 'flex', alignItems: 'center', my: '24px' }}>
          <Divider sx={{ flex: 1, borderColor: '#eee' }} />
          <Typography sx={{ px: '16px', fontSize: '12px', color: '#999', fontWeight: 500 }}>OR</Typography>
          <Divider sx={{ flex: 1, borderColor: '#eee' }} />
        </Box>

        <Button 
          variant="outlined" 
          fullWidth
          startIcon={<Google sx={{ color: '#DB4437' }} />}
          sx={{ 
            height: '50px', borderRadius: '10px', borderColor: '#e5e7eb', color: '#333', fontSize: '14px', fontWeight: 600, textTransform: 'none',
            backgroundColor: '#fafafa', transition: 'all 0.2s ease',
            '&:hover': { backgroundColor: '#ffffff', borderColor: '#ccc' }
          }}
        >
          Continue with Google
        </Button>

        <Typography sx={{ textAlign: 'center', mt: '32px', fontSize: '14px', color: '#666' }}>
          New to SmartAgri?{' '}
          <Link component={RouterLink} to="/register" sx={{ color: '#2e7d32', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
            Create Account
          </Link>
        </Typography>
      </Box>

    </Box>
  );
};

export default LoginPage;
