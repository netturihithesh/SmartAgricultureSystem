import React, { useState, useRef } from 'react';
import { 
  Box, Typography, Button, Paper, CircularProgress, 
  Fade, Alert, IconButton, Divider, Tooltip, Stack, Chip
} from '@mui/material';
import { 
  CloudUpload, BugReport, TipsAndUpdates, 
  AutoFixHigh, CheckCircleOutline, ErrorOutline,
  Close, CameraAlt, DocumentScanner, EnergySavingsLeaf,
  CenterFocusWeak
} from '@mui/icons-material';
import { analyzePestImage } from '../services/aiService';

const PestDetectionCard = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef();
  const cameraInputRef = useRef();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size too large. Please select an image under 10MB.');
        return;
      }
      setSelectedFile(file);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const diagnosis = await analyzePestImage(previewUrl);
      setResult(diagnosis);
    } catch (err) {
      setError('Failed to analyze the image.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  return (
    <Paper 
      className="neo-card" 
      sx={{ 
        p: 0, 
        overflow: 'hidden', 
        bgcolor: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
        mb: '24px',
        position: 'relative',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: 'var(--neon-green)', 
          boxShadow: '0 4px 16px rgba(34,197,94,0.08)'
        }
      }}
    >
      <Box sx={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              🐛 AI Disease & Pest Detection
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--text-sub)' }}>
              Upload leaf image for instant scan
            </Typography>
          </Box>
        </Box>
        {previewUrl && (
          <IconButton size="small" onClick={reset} sx={{ color: 'var(--text-sub)' }}>
            <Close fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Box sx={{ px: '24px', pb: '20px' }}>
        {!previewUrl ? (
          <Box 
            onClick={() => fileInputRef.current.click()}
            sx={{ 
              height: '120px', 
              border: '1px dashed var(--card-border)',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              gap: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'var(--neon-green)',
                bgcolor: 'rgba(57, 255, 106, 0.02)'
              }
            }}
          >
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ position: 'relative', zIndex: 2 }}>
              <Button
                variant="outlined"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
                sx={{ 
                  borderColor: 'var(--neon-green)', 
                  color: 'var(--neon-green)',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: '12px',
                  px: 3,
                  py: 1,
                  '&:hover': { borderColor: 'var(--neon-green)', bgcolor: 'rgba(57, 255, 106, 0.05)' }
                }}
              >
                Gallery
              </Button>
              <Button
                variant="contained"
                onClick={(e) => { e.stopPropagation(); cameraInputRef.current.click(); }}
                sx={{ 
                  bgcolor: 'var(--neon-green)', 
                  color: 'var(--card-bg)',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: '12px',
                  px: 3,
                  py: 1,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: 'var(--green-dark)', boxShadow: 'none' }
                }}
              >
                Use Camera
              </Button>
            </Stack>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ color: 'var(--text-sub)', fontWeight: 500 }}>
                Detects:
              </Typography>
              <Typography variant="caption" sx={{ color: 'var(--green-dark)', fontWeight: 600, bgcolor: 'rgba(57, 255, 106, 0.1)', px: 1, py: 0.2, borderRadius: '4px' }}>Leaf Spot</Typography>
              <Typography variant="caption" sx={{ color: 'var(--text-sub)' }}>•</Typography>
              <Typography variant="caption" sx={{ color: 'var(--green-dark)', fontWeight: 600, bgcolor: 'rgba(57, 255, 106, 0.1)', px: 1, py: 0.2, borderRadius: '4px' }}>Pest Attack</Typography>
              <Typography variant="caption" sx={{ color: 'var(--text-sub)' }}>•</Typography>
              <Typography variant="caption" sx={{ color: 'var(--green-dark)', fontWeight: 600, bgcolor: 'rgba(57, 255, 106, 0.1)', px: 1, py: 0.2, borderRadius: '4px' }}>Nutrient Deficiency</Typography>
            </Box>
          </Box>
        ) : (
          <Box>
            {!result ? (
              <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                <Box 
                  component="img" 
                  src={previewUrl} 
                  sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: '14px', border: '2px solid var(--neon-green)', boxShadow: '0 0 15px rgba(57,255,106,0.2)' }} 
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ color: 'var(--text-main)', fontWeight: 600, mb: 1.5 }}>
                    Image ready for AI analysis
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button 
                      variant="contained" 
                      fullWidth
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      startIcon={isAnalyzing ? <CircularProgress size={16} color="inherit" /> : <AutoFixHigh />}
                      sx={{ 
                        bgcolor: 'var(--neon-green)', 
                        color: '#000', 
                        fontWeight: 800,
                        textTransform: 'none',
                        borderRadius: '10px',
                        boxShadow: '0 4px 14px rgba(57,255,106,0.3)',
                        '&:hover': { bgcolor: '#2fe058' }
                      }}
                    >
                      {isAnalyzing ? 'Scanning image...' : 'Scan Now'}
                    </Button>
                  </Box>
                </Box>
              </Box>
            ) : (
              <Fade in={!!result}>
                <Box>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
                    <Box 
                      component="img" 
                      src={previewUrl} 
                      sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--card-border)' }} 
                    />
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '15px' }}>
                          {result.disease_name}
                        </Typography>
                        <Box sx={{ px: 1, py: 0.2, bgcolor: 'rgba(57, 255, 106, 0.1)', borderRadius: '4px', color: 'var(--neon-green)', fontSize: '10px', fontWeight: 800, border: '1px solid rgba(57,255,106,0.2)' }}>
                          {result.confidence}% MATCH
                        </Box>
                      </Box>
                      <Typography variant="caption" sx={{ color: 'var(--text-sub)', display: 'block', lineHeight: 1.4 }}>
                        {result.description}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ p: 2, bgcolor: 'rgba(57, 255, 106, 0.04)', border: '1px solid rgba(57, 255, 106, 0.2)', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
                    {/* Tiny accent line on left */}
                    <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', bgcolor: 'var(--neon-green)' }} />
                    <Typography variant="caption" sx={{ color: 'var(--neon-green)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <AutoFixHigh sx={{ fontSize: 14 }} /> RECOMMENDED ACTION
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-main)', fontSize: '12px', lineHeight: 1.5 }}>
                      {result.treatment}
                    </Typography>
                  </Box>
                  
                  <Button 
                    fullWidth 
                    size="small" 
                    onClick={reset}
                    sx={{ mt: 2, color: 'var(--text-sub)', textTransform: 'none', fontSize: '12px', '&:hover': { color: 'var(--text-main)' } }}
                  >
                    Scan another leaf
                  </Button>
                </Box>
              </Fade>
            )}
          </Box>
        )}
      </Box>

      {/* Hidden inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        hidden 
        accept="image/*" 
        onChange={handleFileChange} 
      />
      <input 
        type="file" 
        ref={cameraInputRef} 
        hidden 
        accept="image/*" 
        capture="environment"
        onChange={handleFileChange} 
      />

      {error && (
        <Alert severity="error" sx={{ m: 2, borderRadius: '8px', bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', fontSize: '12px', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </Alert>
      )}
    </Paper>
  );
};

export default PestDetectionCard;
