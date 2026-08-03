import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Container, TextField, InputAdornment, Chip, Button } from '@mui/material';
import { MenuBook, Search, Article, Calculate, LocalOffer, ArrowForward } from '@mui/icons-material';

const KnowledgeCenterPage = () => {
  const [search, setSearch] = useState('');

  const articles = [
    { title: 'Optimal NPK Ratio for Paddy Tillering', category: 'Fertilizers', readTime: '5 min read', desc: 'Learn how split application of Nitrogen and Zinc increases effective tiller count by 18%.' },
    { title: 'PM-KISAN Scheme Benefits & Application', category: 'Govt Schemes', readTime: '4 min read', desc: 'Complete step-by-step guide to register for annual financial assistance of ₹6,000.' },
    { title: 'Integrated Pest Management for Cotton', category: 'Pest Control', readTime: '7 min read', desc: 'Biological traps and chemical spray schedules to counter pink bollworm outbreaks.' },
    { title: 'Drip Irrigation Setup for Water Savings', category: 'Irrigation', readTime: '6 min read', desc: 'How precision drip lines reduce groundwater consumption by up to 40% per acre.' },
  ];

  return (
    <Container maxWidth="xl" sx={{ pt: 4, pb: 10, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', fontSize: { xs: '26px', md: '32px' } }}>
          Agronomic Knowledge Center
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', fontSize: '14px', mt: 0.5 }}>
          Expert guides, government scheme updates, and agronomy best practices.
        </Typography>
      </Box>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 4, borderRadius: '20px', bgcolor: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <TextField
          fullWidth
          placeholder="Search crop guides, fertilizer ratios, or government schemes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: '#059669' }} />
              </InputAdornment>
            ),
            sx: { borderRadius: '14px', bgcolor: '#F8FAFC' }
          }}
          variant="outlined"
          size="small"
        />
      </Paper>

      {/* Articles Grid */}
      <Grid container spacing={3}>
        {articles.map((art, idx) => (
          <Grid item xs={12} md={6} key={idx}>
            <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: '#fff', border: '1px solid #E2E8F0', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip label={art.category} size="small" sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 800 }} />
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>{art.readTime}</Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', mb: 1 }}>
                  {art.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.5, mb: 2 }}>
                  {art.desc}
                </Typography>
              </Box>
              <Button
                variant="text"
                endIcon={<ArrowForward />}
                sx={{ color: '#059669', fontWeight: 800, textTransform: 'none', justifyContent: 'flex-start', p: 0 }}
              >
                Read Full Guide
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

    </Container>
  );
};

export default KnowledgeCenterPage;
