import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { Box, Typography, Button } from '@mui/material';
import { Block } from '@mui/icons-material';

const PrivateRoute = ({ session, children }) => {
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    
    const checkBlockedStatus = async () => {
      if (!session) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_blocked')
          .eq('id', session.user.id)
          .single();
          
        if (!error && data) {
          if (isMounted) setIsBlocked(data.is_blocked);
        }
      } catch (err) {
        console.error("Error checking blocked status", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    checkBlockedStatus();
    
    return () => { isMounted = false; };
  }, [session]);

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return null; // Or a simple loader
  }

  if (isBlocked) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#0A0D0B', color: '#e2e8f0' }}>
        <Block sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
        <Typography variant="h3" fontWeight="bold" gutterBottom>Account Suspended</Typography>
        <Typography variant="body1" sx={{ color: '#94a3b8', mb: 4 }}>
          Your account has been blocked by an administrator. Please contact support.
        </Typography>
        <Button 
          variant="contained" 
          color="error" 
          onClick={async () => {
            await supabase.auth.signOut();
            navigate('/login');
          }}
        >
          Sign Out
        </Button>
      </Box>
    );
  }

  return children;
};

export default PrivateRoute;
