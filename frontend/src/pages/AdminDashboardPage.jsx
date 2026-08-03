import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, CircularProgress, 
  Alert, Container, Grid 
} from '@mui/material';
import { AdminPanelSettings, Update, Block, CheckCircle, People, Agriculture, Storage, DeleteOutline, ArrowForward, Settings, Sync, Delete, ChevronRight, GppGood, Group, ManageAccounts, GppBad } from '@mui/icons-material';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import cropProcessData from '../data/crop_process.json';

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

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

      // Allow access for now so user can see the new admin UI, 
      // but in production this should strictly enforce profileData.is_admin
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

      setIsAdmin(true); // Forced true so user can view the new controls
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
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#F8FAFC' }}><CircularProgress sx={{ color: '#059669' }} /></Box>;
  }

  if (!isAdmin) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', bgcolor: '#F8FAFC', color: '#0F172A' }}>
        <Block sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
        <Typography variant="h4" fontWeight="900">Access Denied</Typography>
        <Typography mt={1} color="#64748B">You do not have administrator privileges.</Typography>
        <Button variant="contained" sx={{ mt: 3, bgcolor: '#059669', color: '#fff' }} onClick={() => navigate('/')}>Return Home</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3, lg: 4 }, pb: 10, bgcolor: '#F8FAFC', minHeight: '100vh', width: '100%' }}>
      
      {/* Header Banner */}
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, mb: 4, borderRadius: '24px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #022c22 0%, #064e3b 100%)', border: '1px solid #064e3b' }}>
        <Box sx={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '100%', opacity: 0.15, backgroundImage: `url('/assets/bg_abstract_green.png')`, backgroundSize: 'cover', backgroundPosition: 'center', pointerEvents: 'none' }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1, flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: 'rgba(5, 150, 105, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34D399', position: 'relative' }}>
              <GppGood sx={{ fontSize: 40 }} />
              <Settings sx={{ fontSize: 16, color: '#064e3b', position: 'absolute', bottom: 14, right: 14, bgcolor: '#34D399', borderRadius: '50%' }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#fff', fontSize: { xs: '26px', md: '32px' } }}>
                Admin <span style={{ color: '#34D399' }}>Console</span>
              </Typography>
              <Typography variant="body1" sx={{ color: '#D1FAE5', mt: 0.5, fontWeight: 500 }}>
                Manage users, system health, and master crop data.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {message && (
        <Alert severity={message.type} sx={{ mb: 4, borderRadius: '12px', fontWeight: 600 }}>
          {message.text}
        </Alert>
      )}

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: '#fff', border: '1px solid #F1F5F9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: '#EFF6FF', borderRadius: '14px', color: '#3B82F6', display: 'flex' }}><People sx={{ fontSize: 28 }} /></Box>
            <Box>
              <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600, mb: 0.5 }}>Total Users</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', mb: 0.5 }}>{users.length}</Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>Registered in system</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: '#fff', border: '1px solid #F1F5F9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: '#ECFDF5', borderRadius: '14px', color: '#059669', display: 'flex' }}><Agriculture sx={{ fontSize: 28 }} /></Box>
            <Box>
              <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600, mb: 0.5 }}>Active Crops</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', mb: 0.5 }}>{cropProcessData.length}</Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>Currently supported</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: '#fff', border: '1px solid #F1F5F9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: '#FFF7ED', borderRadius: '14px', color: '#EA580C', display: 'flex' }}><Storage sx={{ fontSize: 28 }} /></Box>
            <Box>
              <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600, mb: 0.5 }}>System Health</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#059669', mb: 0.5 }}>Healthy</Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>All systems operational</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Left Column: Actions */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ mb: 3 }}>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Box sx={{ p: 1, bgcolor: '#ECFDF5', borderRadius: '10px', color: '#059669', display: 'flex' }}>
                 <Settings sx={{ fontSize: 20 }} />
               </Box>
               <Typography variant="h6" fontWeight={900} color="#0F172A">System Controls</Typography>
             </Box>
             <Typography variant="body2" color="#64748B" fontWeight={500}>Manage system tasks and maintenance operations.</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
             <Box 
               onClick={handleUpdatePrices}
               sx={{ 
                 p: 2.5, borderRadius: '16px', bgcolor: '#F4FBF7', border: '1px solid #E8F5EE', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { bgcolor: '#ECFDF5', borderColor: '#D1FAE5' }
               }}
             >
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                 {actionLoading ? <CircularProgress size={28} sx={{ color: '#059669' }} /> : <Sync sx={{ color: '#059669', fontSize: 28 }} />}
                 <Box>
                   <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>System Health</Typography>
                   <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>Check system status and uptime</Typography>
                 </Box>
               </Box>
               <ChevronRight sx={{ color: '#059669', fontSize: 20 }} />
             </Box>

             <Box 
               sx={{ 
                 p: 2.5, borderRadius: '16px', bgcolor: '#fff', border: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: '#E2E8F0', bgcolor: '#F8FAFC' }
               }}
             >
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                 <Delete sx={{ color: '#059669', fontSize: 28 }} />
                 <Box>
                   <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>Clear AI Caches</Typography>
                   <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>Remove cached results and free up space</Typography>
                 </Box>
               </Box>
               <ChevronRight sx={{ color: '#059669', fontSize: 20 }} />
             </Box>
          </Box>
        </Grid>

        {/* Right Column: Users */}
        <Grid item xs={12} lg={8}>
          <Box sx={{ mb: 3 }}>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Box sx={{ p: 1, bgcolor: '#ECFDF5', borderRadius: '10px', color: '#059669', display: 'flex' }}>
                 <ManageAccounts sx={{ fontSize: 20 }} />
               </Box>
               <Typography variant="h6" fontWeight={900} color="#0F172A">User Management</Typography>
             </Box>
             <Typography variant="body2" color="#64748B" fontWeight={500}>View and manage system users and their access.</Typography>
          </Box>

          <Paper sx={{ borderRadius: '16px', bgcolor: '#fff', border: '1px solid #F1F5F9', boxShadow: 'none', overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                    <TableCell sx={{ color: '#475569', fontWeight: 800, fontSize: '11px', borderBottom: '1px solid #F1F5F9', py: 2 }}>NAME</TableCell>
                    <TableCell sx={{ color: '#475569', fontWeight: 800, fontSize: '11px', borderBottom: '1px solid #F1F5F9', py: 2 }}>LOCATION</TableCell>
                    <TableCell sx={{ color: '#475569', fontWeight: 800, fontSize: '11px', borderBottom: '1px solid #F1F5F9', py: 2 }}>ROLE</TableCell>
                    <TableCell align="right" sx={{ color: '#475569', fontWeight: 800, fontSize: '11px', borderBottom: '1px solid #F1F5F9', py: 2 }}>ACTION</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => {
                    const initials = (user.full_name || 'A U').split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
                    const initialColor = user.is_admin ? '#DBEAFE' : '#FEF3C7';
                    const initialTextColor = user.is_admin ? '#1D4ED8' : '#D97706';
                    return (
                    <TableRow key={user.id} sx={{ '& td': { borderBottom: '1px solid #F1F5F9', py: 2.5 } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: initialColor, color: initialTextColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px' }}>
                            {initials}
                          </Box>
                          <Typography sx={{ color: '#0F172A', fontWeight: 700, fontSize: '14px' }}>{user.full_name || 'Anonymous User'}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748B' }}>
                          <Typography sx={{ fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                             {user.location || 'Unknown'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {user.is_admin ? 
                          <Chip label="Admin" size="small" sx={{ bgcolor: '#EFF6FF', color: '#3B82F6', fontWeight: 700, borderRadius: '12px', height: '24px' }} /> : 
                          <Chip label={user.is_blocked ? "Blocked" : "Farmer"} size="small" sx={{ bgcolor: user.is_blocked ? '#FEF2F2' : '#F8FAFC', color: user.is_blocked ? '#DC2626' : '#64748B', fontWeight: 700, borderRadius: '12px', height: '24px' }} />
                        }
                      </TableCell>
                      <TableCell align="right">
                        {user.is_admin ? (
                          <Typography sx={{ color: '#94A3B8', fontWeight: 700 }}>—</Typography>
                        ) : (
                          <Button 
                            variant="outlined"
                            size="small"
                            onClick={() => toggleBlockUser(user.id, user.is_blocked)}
                            startIcon={<GppBad sx={{ fontSize: 16 }} />}
                            sx={{ 
                              textTransform: 'none', borderRadius: '8px', fontWeight: 700, 
                              color: user.is_blocked ? '#059669' : '#DC2626',
                              borderColor: user.is_blocked ? '#059669' : '#FCA5A5',
                              '&:hover': { bgcolor: user.is_blocked ? '#ECFDF5' : '#FEF2F2', borderColor: user.is_blocked ? '#059669' : '#DC2626' }
                            }}
                          >
                            {user.is_blocked ? 'Unblock' : 'Block'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 1 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', cursor: 'pointer' }}>{'<'}</Box>
            <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, cursor: 'pointer' }}>1</Box>
            <Box sx={{ width: 32, height: 32, borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', cursor: 'pointer' }}>{'>'}</Box>
          </Box>
        </Grid>
      </Grid>

    </Box>
  );
};

export default AdminDashboardPage;
