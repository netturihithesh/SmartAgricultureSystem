import React, { useState, useRef } from 'react';
import { 
  Box, Typography, Button, Paper, CircularProgress, 
  Fade, Alert, IconButton, Divider, Tooltip
} from '@mui/material';
import { 
  CloudUpload, BugReport, TipsAndUpdates, 
  AutoFixHigh, CheckCircleOutline, ErrorOutline,
  Close, Image as ImageIcon
} from '@mui/icons-material';
import { analyzePestImage } from '../services/aiService';

const PestDetectionCard = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef();

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
        border: '1px solid rgba(239, 68, 68, 0.2)', // Subtle warning red border
        background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.95) 0%, rgba(30, 20, 20, 0.95) 100%)', // Very dark red tint
        mb: '24px',
        position: 'relative'
      }}
    >
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ p: 1, bgcolor: 'rgba(239, 68, 68, 0.1)', borderRadius: '10px', display: 'flex' }}>
            <BugReport sx={{ color: '#fca5a5', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
              Disease & Pest Detection
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--text-sub)' }}>
              Check crop leaves for pests and diseases instantly
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
          <Box 
            onClick={() => fileInputRef.current.click()}
            sx={{ 
              border: '1px dashed rgba(255,255,255,0.1)', 
              borderRadius: '16px', 
              p: 4, 
              textAlign: 'center', 
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.2)' }
            }}
          >
            <CloudUpload sx={{ fontSize: 40, color: 'var(--text-sub)', mb: 1, opacity: 0.5 }} />
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--text-main)' }}>
              Upload leaf image to scan
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--text-sub)' }}>
              Drag and drop or click to browse
            </Typography>
          </Box>
        ) : (
          <Box>
            {!result ? (
              <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                <Box 
                  component="img" 
                  src={previewUrl} 
                  sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: '12px', border: '2px solid var(--card-border)' }} 
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ color: 'var(--text-main)', fontWeight: 600, mb: 1.5 }}>
                    Image ready for analysis
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
                        fontWeight: 700,
                        textTransform: 'none',
                        borderRadius: '10px',
                        '&:hover': { bgcolor: '#2fe058' }
                      }}
                    >
                      {isAnalyzing ? 'Analyzing...' : 'Scan Now'}
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
                        <Box sx={{ px: 1, py: 0.2, bgcolor: 'rgba(57, 255, 106, 0.1)', borderRadius: '4px', color: 'var(--neon-green)', fontSize: '10px', fontWeight: 800 }}>
                          {result.confidence}% MATCH
                        </Box>
                      </Box>
                      <Typography variant="caption" sx={{ color: 'var(--text-sub)', display: 'block', lineHeight: 1.4 }}>
                        {result.description}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ p: 2, bgcolor: 'rgba(57, 255, 106, 0.03)', border: '1px solid rgba(57, 255, 106, 0.1)', borderRadius: '12px' }}>
                    <Typography variant="caption" sx={{ color: 'var(--neon-green)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <AutoFixHigh sx={{ fontSize: 14 }} /> TREATMENT ADVICE
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-main)', fontSize: '12px', lineHeight: 1.5 }}>
                      {result.treatment}
                    </Typography>
                  </Box>
                  
                  <Button 
                    fullWidth 
                    size="small" 
                    onClick={reset}
                    sx={{ mt: 2, color: 'var(--text-sub)', textTransform: 'none', fontSize: '12px' }}
                  >
                    Scan another leaf
                  </Button>
                </Box>
              </Fade>
            )}
          </Box>
        )}
      </Box>

      <input 
        type="file" 
        ref={fileInputRef} 
        hidden 
        accept="image/*" 
        onChange={handleFileChange} 
      />

      {error && (
        <Alert severity="error" sx={{ m: 2, borderRadius: '8px', bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', fontSize: '12px' }}>
          {error}
        </Alert>
      )}
    </Paper>
  );
};

export default PestDetectionCard;
