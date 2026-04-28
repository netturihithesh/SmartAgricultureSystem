import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, CircularProgress, 
  Alert, Container 
} from '@mui/material';
import { AdminPanelSettings, Update, Block, CheckCircle } from '@mui/icons-material';
import { supabase } from '../supabase';
import { useColorMode } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const { mode } = useColorMode();
  const isDark = mode === 'dark';
  const navigate = useNavigate();

  const bgPaper = isDark ? 'rgba(255,255,255,0.02)' : '#ffffff';
  const textPrimary = isDark ? '#e2e8f0' : '#1e293b';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e0e0e0';
  const accentColor = isDark ? '#39FF6A' : '#2E7D32';

  useEffect(() => {
    checkAdminAndFetchData();
  }, []);

  const checkAdminAndFetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      // Check if current user is admin
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profileData?.is_admin) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      fetchUsers();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, location, is_blocked, is_admin');
      
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to fetch users: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrices = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      // Assuming backend is running locally on port 8000 or using full URL
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/prices/update`, {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Prices updated successfully!' });
      } else {
        throw new Error(data.detail || 'Failed to update prices');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const toggleBlockUser = async (userId, currentBlockedStatus) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_blocked: !currentBlockedStatus })
        .eq('id', userId);

      if (error) throw error;
      
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, is_blocked: !currentBlockedStatus } : u));
      setMessage({ type: 'success', text: `User has been ${!currentBlockedStatus ? 'blocked' : 'unblocked'}.` });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update user status: ' + err.message });
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: isDark ? '#0A0D0B' : '#f5f5f5' }}><CircularProgress sx={{ color: accentColor }} /></Box>;
  }

  if (!isAdmin) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', bgcolor: isDark ? '#0A0D0B' : '#f5f5f5', color: textPrimary }}>
        <Block sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
        <Typography variant="h4" fontWeight="bold">Access Denied</Typography>
        <Typography mt={1}>You do not have administrator privileges.</Typography>
        <Button variant="contained" sx={{ mt: 3, bgcolor: accentColor, color: isDark ? '#000' : '#fff' }} onClick={() => navigate('/')}>Return Home</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: isDark ? '#0A0D0B' : '#f8fafc', pt: { xs: 10, md: 12 }, pb: 8 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <AdminPanelSettings sx={{ fontSize: 40, color: accentColor }} />
          <Typography variant="h3" fontWeight={800} color={textPrimary}>
            Admin Dashboard
          </Typography>
        </Box>

        {message && (
          <Alert severity={message.type} sx={{ mb: 4, borderRadius: '12px' }}>
            {message.text}
          </Alert>
        )}

        <Paper sx={{ p: 4, mb: 4, borderRadius: '20px', bgcolor: bgPaper, border: `1px solid ${borderColor}`, boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.4)' : '0 10px 40px rgba(0,0,0,0.05)' }}>
          <Typography variant="h6" fontWeight={700} color={textPrimary} mb={2}>Market Actions</Typography>
          <Typography color="text.secondary" mb={3}>Trigger the backend script to fetch the latest state-level crop prices and update the recommendation engine's knowledge base.</Typography>
          <Button 
            variant="contained" 
            onClick={handleUpdatePrices}
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : <Update />}
            sx={{ 
              bgcolor: accentColor, color: isDark ? '#000' : '#fff', fontWeight: 700, px: 4, py: 1.5, borderRadius: '12px',
              '&:hover': { bgcolor: isDark ? '#2fe058' : '#1B5E20' }
            }}
          >
            {actionLoading ? 'Updating Prices...' : 'Fetch Latest Market Prices'}
          </Button>
        </Paper>

        <Paper sx={{ overflow: 'hidden', borderRadius: '20px', bgcolor: bgPaper, border: `1px solid ${borderColor}`, boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.4)' : '0 10px 40px rgba(0,0,0,0.05)' }}>
          <Box sx={{ p: 3, borderBottom: `1px solid ${borderColor}` }}>
            <Typography variant="h6" fontWeight={700} color={textPrimary}>User Management</Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}>
                  <TableCell sx={{ color: textPrimary, fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ color: textPrimary, fontWeight: 700 }}>Location</TableCell>
                  <TableCell sx={{ color: textPrimary, fontWeight: 700 }}>Role</TableCell>
                  <TableCell sx={{ color: textPrimary, fontWeight: 700 }}>Status</TableCell>
                  <TableCell align="right" sx={{ color: textPrimary, fontWeight: 700 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ color: textPrimary }}>{user.full_name || 'N/A'}</TableCell>
                    <TableCell sx={{ color: textPrimary }}>{user.location || 'N/A'}</TableCell>
                    <TableCell>
                      {user.is_admin ? 
                        <Chip label="Admin" color="primary" size="small" sx={{ fontWeight: 600 }} /> : 
                        <Chip label="User" size="small" variant="outlined" sx={{ color: textPrimary }} />
                      }
                    </TableCell>
                    <TableCell>
                      {user.is_blocked ? 
                        <Chip label="Blocked" color="error" size="small" icon={<Block />} /> : 
                        <Chip label="Active" color="success" size="small" icon={<CheckCircle />} />
                      }
                    </TableCell>
                    <TableCell align="right">
                      {!user.is_admin && (
                        <Button 
                          variant={user.is_blocked ? "outlined" : "contained"} 
                          color={user.is_blocked ? "success" : "error"}
                          size="small"
                          onClick={() => toggleBlockUser(user.id, user.is_blocked)}
                          sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 600 }}
                        >
                          {user.is_blocked ? 'Unblock User' : 'Block User'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminDashboardPage;
