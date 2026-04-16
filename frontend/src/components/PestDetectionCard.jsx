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
        background: 'linear-gradient(135deg, rgba(20, 30, 20, 0.9) 0%, rgba(30, 20, 20, 0.9) 100%)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        mb: '24px',
        position: 'relative',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: 'rgba(57, 255, 106, 0.5)', 
          boxShadow: '0 10px 30px rgba(57, 255, 106, 0.08)'
        }
      }}
    >
      <style>
        {`
          @keyframes scanMove {
            0% { top: 5%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 95%; opacity: 0; }
          }
        `}
      </style>

      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ p: 1, bgcolor: 'rgba(57, 255, 106, 0.15)', borderRadius: '10px', display: 'flex', border: '1px solid rgba(57, 255, 106, 0.3)', boxShadow: '0 0 10px rgba(57,255,106,0.2)' }}>
            <DocumentScanner sx={{ color: 'var(--neon-green)', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              🐛 AI Disease & Pest Detection
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--text-sub)' }}>
              Instant leaf health scan powered by AI
            </Typography>
          </Box>
        </Box>
        {previewUrl && (
          <IconButton size="small" onClick={reset} sx={{ color: 'var(--text-sub)' }}>
            <Close fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Box sx={{ p: 3 }}>
        {!previewUrl ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box 
              onClick={() => fileInputRef.current.click()}
              sx={{ 
                border: '1.5px dashed rgba(57, 255, 106, 0.3)', 
                borderRadius: '20px', 
                p: { xs: 3, sm: 4 }, 
                textAlign: 'center', 
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(180deg, rgba(57, 255, 106, 0.02) 0%, rgba(57, 255, 106, 0.06) 100%)',
                transition: 'all 0.3s ease',
                '&:hover': { 
                  transform: 'scale(1.02)',
                  borderColor: 'rgba(57, 255, 106, 0.8)',
                  boxShadow: '0 0 25px rgba(57, 255, 106, 0.15)' 
                }
              }}
            >
              {/* Animated AI Scan Line */}
              <Box sx={{
                position: 'absolute',
                left: '10%',
                width: '80%',
                height: '2px',
                background: 'linear-gradient(90deg, transparent, var(--neon-green), transparent)',
                animation: 'scanMove 2.5s infinite linear',
                boxShadow: '0 0 10px rgba(57, 255, 106, 0.8)',
                zIndex: 1,
              }} />

              {/* Watermark leaf icon for premium feel */}
              <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.03, pointerEvents: 'none' }}>
                 <EnergySavingsLeaf sx={{ fontSize: 180 }} />
              </Box>

              <CenterFocusWeak sx={{ fontSize: 48, color: 'var(--neon-green)', mb: 1.5, opacity: 0.9 }} />
              <Typography variant="body1" sx={{ fontWeight: 800, color: 'var(--text-main)', mb: 0.5 }}>
                Upload leaf image to scan
              </Typography>
              <Typography variant="caption" sx={{ color: 'var(--text-sub)', display: 'block', mb: 3 }}>
                Click to browse or drag and drop
              </Typography>

              <Stack direction="row" spacing={2} justifyContent="center" sx={{ position: 'relative', zIndex: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
                  sx={{ 
                    borderColor: 'rgba(57, 255, 106, 0.5)', 
                    color: 'var(--neon-green)',
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: '10px',
                    '&:hover': { borderColor: 'var(--neon-green)', bgcolor: 'rgba(57,255,106,0.1)' }
                  }}
                >
                  Gallery
                </Button>
                <Button
                  variant="contained"
                  startIcon={<CameraAlt />}
                  onClick={(e) => { e.stopPropagation(); cameraInputRef.current.click(); }}
                  sx={{ 
                    bgcolor: 'var(--neon-green)', 
                    color: '#000',
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: '10px',
                    boxShadow: '0 4px 14px rgba(57,255,106,0.3)',
                    '&:hover': { bgcolor: '#2fe058' }
                  }}
                >
                  Use Camera
                </Button>
              </Stack>
            </Box>

            {/* Possible Output Preview */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'var(--text-sub)', fontWeight: 600, display: 'block', mb: 1, letterSpacing: 0.5 }}>
                CAPABLE OF DETECTING
              </Typography>
              <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                <Chip size="small" label="Leaf Spot" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Chip size="small" label="Pest Attacks" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Chip size="small" label="Nutrient Deficiency" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </Stack>
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
