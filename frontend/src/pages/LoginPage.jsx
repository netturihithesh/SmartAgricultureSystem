import React, { useState } from 'react';
<<<<<<< Updated upstream
import { Box, Typography, TextField, Button, InputAdornment, IconButton, Link, Divider, CircularProgress, Alert } from '@mui/material';
=======
import {
  Box, Typography, TextField, Button, InputAdornment, IconButton,
  Link, Divider, CircularProgress, useTheme
} from '@mui/material';
>>>>>>> Stashed changes
import { Visibility, VisibilityOff, Google, Agriculture as EcoIcon } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { supabase } from '../supabase';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const bgDefault = theme.palette.background.default;
  const bgPaper = theme.palette.background.paper;
  const textPrimary = theme.palette.text.primary;
  const textSecondary = theme.palette.text.secondary;

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
<<<<<<< Updated upstream
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Navigate directly to the Action Home Page on success
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = { 
    height: '56px', borderRadius: '12px', fontSize: '15px', backgroundColor: '#FAFAFA',
    '& fieldset': { borderColor: '#E0E0E0', borderWidth: '1.5px', borderRadius: '12px' },
    '&:hover fieldset': { borderColor: '#BDBDBD !important' },
    '&.Mui-focused fieldset': { borderColor: '#2e7d32 !important', borderWidth: '2px !important' },
    '&.Mui-focused': { backgroundColor: '#FFFFFF', boxShadow: '0 4px 12px rgba(46,125,50,0.08)' },
    transition: 'all 0.2s ease-in-out'
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      padding: { xs: '16px', md: '48px 24px' },
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Decorative Background Elements */}
      <Box sx={{ position: 'absolute', top: '-10%', left: '-5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }} />
      <Box sx={{ position: 'absolute', bottom: '-5%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(46,125,50,0.1) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }} />

      {/* 🌾 Top Branding Area */}
      <Box sx={{ textAlign: 'center', mb: '32px', zIndex: 1 }}>
=======
    setTimeout(() => { setLoading(false); navigate('/dashboard'); }, 1500);
  };

  const inputStyles = {
    height: '50px', borderRadius: '10px', fontSize: '14px',
    backgroundColor: bgPaper,
    '& fieldset': { borderColor: isDark ? '#444' : '#e3e7e6', borderWidth: '1px' },
    '&:hover fieldset': { borderColor: isDark ? '#666' : '#ccc !important' },
    '&.Mui-focused fieldset': { borderColor: '#2e7d32 !important', borderWidth: '1px !important' },
    '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(46,125,50,0.08)' }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: isDark
        ? 'linear-gradient(180deg, #1e2a24, #2a3830)'
        : 'linear-gradient(180deg, #f4f7f6, #eef3f1)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '24px'
    }}>

      {/* Branding */}
      <Box sx={{ textAlign: 'center', mb: '25px' }}>
>>>>>>> Stashed changes
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
          <EcoIcon sx={{ fontSize: 42, color: '#2E7D32', filter: 'drop-shadow(0px 4px 8px rgba(46, 125, 50, 0.3))' }} />
          <Typography sx={{ fontSize: '32px', fontWeight: 800, color: '#1B5E20', letterSpacing: '-0.5px' }}>SmartAgri</Typography>
        </Box>
<<<<<<< Updated upstream
      </Box>

      {/* 🔐 Login Floating Card */}
      <Box 
        sx={{ 
          width: '100%', 
          maxWidth: '440px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          p: { xs: '32px 24px', sm: '40px' },
          boxShadow: '0 24px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(46, 125, 50, 0.04)',
          zIndex: 1
        }}
      >
        <Typography variant="h2" sx={{ fontSize: '26px', fontWeight: 800, color: '#111', mb: '8px', textAlign: 'center', letterSpacing: '-0.5px' }}>
          Welcome Back 👋
        </Typography>
        <Typography sx={{ fontSize: '15px', color: '#666', mb: '32px', textAlign: 'center' }}>
          Login to access your smart farming dashboard.
=======
        <Typography sx={{ fontSize: '15px', color: textSecondary, fontWeight: 500 }}>
          AI-powered crop intelligence platform
        </Typography>
      </Box>

      {/* Login Card */}
      <Box sx={{
        width: '100%', maxWidth: '400px', backgroundColor: bgPaper,
        borderRadius: '18px', p: { xs: '32px 24px', sm: '38px' },
        boxShadow: isDark ? '0 30px 70px rgba(0,0,0,0.4)' : '0 30px 70px rgba(0,0,0,0.08)',
        border: `1px solid ${isDark ? '#333' : 'transparent'}`
      }}>
        <Typography variant="h2" sx={{ fontSize: '24px', fontWeight: 700, color: textPrimary, mb: '8px', textAlign: 'center' }}>
          Welcome Back 👋
        </Typography>
        <Typography sx={{ fontSize: '14px', color: textSecondary, mb: '24px', textAlign: 'center' }}>
          Login to access your smart farming dashboard
>>>>>>> Stashed changes
        </Typography>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', fontSize: '15px' }}>
            {errorMsg}
          </Alert>
        )}

        <form onSubmit={handleLogin}>
<<<<<<< Updated upstream
          <Box sx={{ mb: '20px' }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#222', mb: '6px' }}>Email Address</Typography>
            <TextField 
              fullWidth
              variant="outlined"
              placeholder="farmer@email.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              InputProps={{ sx: inputStyles }}
            />
          </Box>

          <Box sx={{ mb: '12px' }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#222', mb: '6px' }}>Password</Typography>
            <TextField 
              fullWidth
              variant="outlined"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? 'text' : 'password'}
              required
=======
          <Box sx={{ mb: '16px' }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: textPrimary, mb: '6px' }}>Email Address</Typography>
            <TextField fullWidth variant="outlined" placeholder="farmer@email.com" type="email" required
              InputProps={{ sx: inputStyles }} />
          </Box>

          <Box sx={{ mb: '10px' }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: textPrimary, mb: '6px' }}>Password</Typography>
            <TextField fullWidth variant="outlined" placeholder="••••••••" type={showPassword ? 'text' : 'password'} required
>>>>>>> Stashed changes
              InputProps={{
                sx: inputStyles,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: textSecondary }}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }} />
          </Box>

<<<<<<< Updated upstream
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: '32px' }}>
            <Link href="#" underline="hover" sx={{ fontSize: '14px', color: '#2E7D32', fontWeight: 700 }}>
              Forgot Password?
            </Link>
          </Box>

          <Button 
            type="submit"
            variant="contained" 
            fullWidth
            disabled={loading}
            sx={{ 
              height: '56px', borderRadius: '14px', backgroundColor: '#2E7D32', color: '#fff', 
              fontSize: '16px', fontWeight: 700, letterSpacing: '0.3px', textTransform: 'none',
              boxShadow: '0 8px 24px rgba(46, 125, 50, 0.25)', transition: 'all 0.3s ease',
              '&:hover': { backgroundColor: '#1B5E20', transform: 'translateY(-2px)', boxShadow: '0 12px 32px rgba(46, 125, 50, 0.35)' },
              '&:disabled': { backgroundColor: '#A5D6A7', color: '#fff' }
            }}
          >
            {loading ? <CircularProgress size={28} sx={{ color: '#fff' }} /> : 'Login to Dashboard'}
          </Button>
        </form>

        <Box sx={{ display: 'flex', alignItems: 'center', my: '32px' }}>
          <Divider sx={{ flex: 1, borderColor: '#eee' }} />
          <Typography sx={{ px: '16px', fontSize: '13px', color: '#999', fontWeight: 600 }}>OR</Typography>
          <Divider sx={{ flex: 1, borderColor: '#eee' }} />
        </Box>

        <Button 
          variant="outlined" 
          fullWidth
          startIcon={<Google sx={{ color: '#DB4437' }} />}
          sx={{ 
            height: '56px', borderRadius: '14px', borderColor: '#E0E0E0', color: '#444', fontSize: '15px', fontWeight: 700, textTransform: 'none',
            backgroundColor: '#FAFAFA', transition: 'all 0.2s ease',
            '&:hover': { backgroundColor: '#FFFFFF', borderColor: '#BDBDBD', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
          }}
        >
          Continue with Google
        </Button>

        <Typography sx={{ textAlign: 'center', mt: '36px', fontSize: '15px', color: '#666', fontWeight: 500 }}>
=======
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: '24px' }}>
            <Link href="#" underline="hover" sx={{ fontSize: '13px', color: '#2E7D32', fontWeight: 600 }}>Forgot Password?</Link>
          </Box>

          <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{
            height: '50px', borderRadius: '12px', backgroundColor: '#2e7d32', color: '#fff',
            fontSize: '15px', fontWeight: 600, textTransform: 'none', boxShadow: 'none',
            '&:hover': { backgroundColor: '#256628', transform: 'translateY(-1px)', boxShadow: '0 8px 16px rgba(46, 125, 50, 0.15)' },
            '&:disabled': { backgroundColor: '#A5D6A7', color: '#fff' }
          }}>
            {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Login to Dashboard'}
          </Button>
        </form>

        <Box sx={{ display: 'flex', alignItems: 'center', my: '24px' }}>
          <Divider sx={{ flex: 1, borderColor: isDark ? '#333' : '#eee' }} />
          <Typography sx={{ px: '16px', fontSize: '12px', color: textSecondary, fontWeight: 500 }}>OR</Typography>
          <Divider sx={{ flex: 1, borderColor: isDark ? '#333' : '#eee' }} />
        </Box>

        <Button variant="outlined" fullWidth startIcon={<Google sx={{ color: '#DB4437' }} />} sx={{
          height: '50px', borderRadius: '10px',
          borderColor: isDark ? '#444' : '#e5e7eb',
          color: textPrimary, fontSize: '14px', fontWeight: 600, textTransform: 'none',
          backgroundColor: isDark ? '#334d3d' : '#fafafa',
          '&:hover': { backgroundColor: isDark ? '#333' : '#ffffff', borderColor: isDark ? '#666' : '#ccc' }
        }}>
          Continue with Google
        </Button>

        <Typography sx={{ textAlign: 'center', mt: '32px', fontSize: '14px', color: textSecondary }}>
>>>>>>> Stashed changes
          New to SmartAgri?{' '}
          <Link component={RouterLink} to="/register" sx={{ color: '#2E7D32', fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s ease', '&:hover': { textDecoration: 'underline', color: '#1B5E20' } }}>
            Create Account
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;
