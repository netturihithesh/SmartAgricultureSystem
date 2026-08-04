import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Button, CircularProgress, Chip } from '@mui/material';
import { CameraAlt, CloudUpload, CheckCircle, Replay, AssignmentTurnedIn, Lightbulb, MonitorHeart } from '@mui/icons-material';

const DiseaseDetectionPage = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleImageUpload = async (file) => {
    if (!file) return;
    setAnalyzing(true);
    setResult(null);
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/detect/detect`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Detection failed');
      
      const data = await response.json();
      
      setResult({
        disease: data.disease_name || 'Unknown',
        severity: data.cause || 'Biological Cause Identified',
        confidence: data.confidence_level || 'High Confidence',
        treatment: (data.treatment || 'Consult local expert').split('\n').filter(t => t.trim() !== '')
      });
    } catch (error) {
      console.error('Detection Error:', error);
      alert('AI Detection failed. Please ensure the backend is running.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3, lg: 4 }, pb: 10, bgcolor: '#FFFFFF', minHeight: '100vh', width: '100%', position: 'relative' }}>
      
      {/* Background Graphic Mockup */}
      <Box sx={{ 
        position: 'absolute', right: 0, top: 0, width: '500px', height: '200px', 
        opacity: 0.8, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `url('/assets/bg_abstract_green.png')`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 100%)', maskImage: 'linear-gradient(to right, transparent, black 100%)'
      }} />

      {/* Header */}
      <Box sx={{ mb: 5, position: 'relative', zIndex: 1, pt: 2 }}>
        <Typography variant="h3" sx={{ fontWeight: 900, color: '#0F172A', fontSize: { xs: '28px', md: '36px' }, letterSpacing: '-0.5px' }}>
          AI Disease & <span style={{ color: '#059669' }}>Pest Detection</span>
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748B', fontSize: '15px', mt: 1.5, fontWeight: 500, maxWidth: '600px' }}>
          Upload crop leaf photos for instant computer vision pest & disease diagnosis.
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ position: 'relative', zIndex: 1 }}>
        {/* Upload Zone */}
        <Grid item xs={12} md={4.5} lg={4}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: '24px',
              bgcolor: '#F8FAFC',
              border: '2px dashed #A7F3D0',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}
          >
            {analyzing ? (
              <Box sx={{ py: 6, m: 'auto' }}>
                <CircularProgress sx={{ color: '#059669', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                  Scanning Leaf Patterns...
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Analyzing cellular structure against pathology samples.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', mb: 3 }}>
                  <CameraAlt sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', mb: 1.5 }}>
                  Upload Crop Leaf Image
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', mb: 4, px: 2, fontWeight: 500 }}>
                  Take a clear photo of affected leaves or stems under good light.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 'auto' }}>
                  <Button
                    variant="contained"
                    startIcon={<CameraAlt />}
                    onClick={() => document.getElementById('camera-upload-dd').click()}
                    sx={{ bgcolor: '#059669', color: '#fff', fontWeight: 800, borderRadius: '12px', textTransform: 'none', py: 1.5, fontSize: '15px', boxShadow: '0 4px 12px rgba(5,150,105,0.2)', '&:hover': { bgcolor: '#047857' } }}
                  >
                    Take Photo
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    onClick={() => document.getElementById('gallery-upload-dd').click()}
                    sx={{ borderColor: '#059669', color: '#059669', fontWeight: 800, borderRadius: '12px', textTransform: 'none', py: 1.5, fontSize: '15px', bgcolor: '#fff', '&:hover': { bgcolor: '#F0FDF4' } }}
                  >
                    Upload File
                  </Button>
                </Box>

                <Box sx={{ mt: 4, p: 2, bgcolor: '#ECFDF5', borderRadius: '12px', display: 'flex', gap: 1.5, alignItems: 'center', textAlign: 'left' }}>
                  <Lightbulb sx={{ color: '#059669', fontSize: 24 }} />
                  <Typography variant="caption" sx={{ color: '#047857', fontWeight: 600, fontSize: '12px', lineHeight: 1.4 }}>
                    <strong style={{ color: '#064E3B' }}>Tip:</strong> For best results, capture the affected area clearly with good lighting and focus.
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Diagnosis Results Zone */}
        <Grid item xs={12} md={7.5} lg={8}>
          <Paper elevation={0} sx={{ borderRadius: '24px', bgcolor: '#fff', border: '1px solid #E2E8F0', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
            
            <Box sx={{ px: 4, pt: 4, pb: 2, borderBottom: '1px solid #F1F5F9' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ bgcolor: '#ECFDF5', p: 1, borderRadius: '8px', color: '#059669', display: 'flex' }}>
                   <MonitorHeart sx={{ fontSize: 20 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A' }}>
                  AI Pathology Diagnosis Report
                </Typography>
              </Box>
              <Box sx={{ width: '35px', height: '3px', bgcolor: '#059669', mt: 2, borderRadius: '4px' }} />
            </Box>

            <Box sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column' }}>
              {result ? (
                <Box>
                  <Chip label={result.confidence} color="success" size="small" sx={{ fontWeight: 900, mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', mb: 1, letterSpacing: '-0.5px' }}>
                    {result.disease}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#EF4444', fontWeight: 800, mb: 4 }}>
                    {result.severity}
                  </Typography>

                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', mb: 2 }}>
                    Recommended Agronomic Treatments:
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                    {result.treatment.map((t, idx) => (
                      <Box key={idx} sx={{ p: 2.5, bgcolor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <CheckCircle sx={{ color: '#059669', fontSize: 22 }} />
                        <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600, fontSize: '14px', lineHeight: 1.5 }}>
                          {t}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Button
                    variant="outlined"
                    startIcon={<Replay />}
                    onClick={() => setResult(null)}
                    sx={{ borderColor: '#CBD5E1', color: '#64748B', fontWeight: 800, borderRadius: '12px', textTransform: 'none', py: 1.5, px: 3, '&:hover': { bgcolor: '#F8FAFC' } }}
                  >
                    Diagnose Another Sample
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, bgcolor: '#F8FAFC', borderRadius: '16px', p: 4, my: 'auto', minHeight: '350px' }}>
                  <Box sx={{ width: 100, height: 100, borderRadius: '50%', bgcolor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                    <AssignmentTurnedIn sx={{ fontSize: 50, color: '#34D399' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', mb: 1 }}>
                    No active scan yet
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, textAlign: 'center', maxWidth: '300px' }}>
                    Upload or capture a leaf photo on the left to view AI pathology diagnosis.
                  </Typography>
                </Box>
              )}
            </Box>

          </Paper>
        </Grid>
      </Grid>
      
      {/* Hidden file inputs */}
      <input type="file" id="camera-upload-dd" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e.target.files[0])} />
      <input type="file" id="gallery-upload-dd" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e.target.files[0])} />
    </Box>
  );
};

export default DiseaseDetectionPage;

