import React from 'react';
import { Box, Typography, Container, Card, Button } from '@mui/material';
import { 
  Grass as SproutIcon, 
  Timeline as TrendingUpIcon, 
  MonetizationOn as AttachMoneyIcon, 
  Cloud as CloudIcon, 
  Science as ScienceIcon, 
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const FeaturesPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Crop Recommendation',
      description: 'Suggests optimal crops using soil & climate datasets',
      icon: <SproutIcon sx={{ fontSize: 20, color: '#2E7D32' }} />,
      color: '#E8F5E9'
    },
    {
      title: 'Yield Prediction',
      description: 'Forecast expected production volume',
      icon: <TrendingUpIcon sx={{ fontSize: 20, color: '#1565C0' }} />,
      color: '#E3F2FD'
    },
    {
      title: 'Profit Estimation',
      description: 'Estimate revenue based on trends & analytics',
      icon: <AttachMoneyIcon sx={{ fontSize: 20, color: '#F9A825' }} />,
      color: '#FFFDE7'
    },
    {
      title: 'Climate Pattern Analysis',
      description: 'Analyze rainfall & temperature variability',
      icon: <CloudIcon sx={{ fontSize: 20, color: '#0277BD' }} />,
      color: '#E1F5FE'
    },
    {
      title: 'Fertilizer Optimization',
      description: 'Provide nutrient recommendations',
      icon: <ScienceIcon sx={{ fontSize: 20, color: '#6A1B9A' }} />,
      color: '#F3E5F5'
    },
    {
      title: 'Smart Analytics Dashboard',
      description: 'Visual insights through charts & comparisons',
      icon: <DashboardIcon sx={{ fontSize: 20, color: '#C62828' }} />,
      color: '#FFEBEE'
    }
  ];

  return (
    <Box sx={{ width: '100%', backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      
      {/* 1️⃣ Compact Page Header (Minimal Hero) */}
      <Box sx={{ 
        pt: { xs: '110px', md: '130px' }, 
        pb: '40px', 
        backgroundColor: '#f7faf8',
        textAlign: 'center',
        borderBottom: '1px solid #e8ecea'
      }}>
        <Container maxWidth="md">
          <Typography variant="h1" sx={{ fontSize: { xs: '32px', md: '40px' }, fontWeight: 700, color: '#111', mb: '16px', letterSpacing: '-0.5px' }}>
            Powerful AI Features for Smart Farming
          </Typography>
          <Typography sx={{ fontSize: '16px', color: '#555', maxWidth: '700px', mx: 'auto', lineHeight: 1.6 }}>
            SmartAgri provides intelligent tools to optimize crop planning, improve productivity, and enable data-driven agricultural decisions.
          </Typography>
        </Container>
      </Box>

      {/* 2️⃣ Core Features Grid */}
      <Box sx={{ py: '50px' }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, 
            gap: '28px' 
          }}>
            {features.map((feature, i) => (
              <Card 
                key={i}
                elevation={0}
                sx={{ 
                  p: '24px', 
                  borderRadius: '14px', 
                  backgroundColor: '#fff',
                  border: '1px solid #e8ecea',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.06)'
                  }
                }}
              >
                <Box sx={{ 
                  width: '44px', height: '44px', borderRadius: '50%', backgroundColor: feature.color, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', mb: '20px' 
                }}>
                  {feature.icon}
                </Box>
                <Typography variant="h3" sx={{ fontSize: '17px', fontWeight: 600, color: '#111', mb: '8px' }}>
                  {feature.title}
                </Typography>
                <Typography sx={{ fontSize: '14px', color: '#666', lineHeight: 1.5 }}>
                  {feature.description}
                </Typography>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* 4️⃣ Minimal Bottom CTA */}
      <Box sx={{ 
        py: '50px', 
        textAlign: 'center',
        borderTop: '1px solid #e8ecea'
      }}>
        <Container maxWidth="sm">
          <Typography variant="h2" sx={{ fontSize: '24px', fontWeight: 700, color: '#111', mb: '24px' }}>
            Start optimizing your farm decisions today
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/register')}
            sx={{ 
              backgroundColor: '#2E7D32', color: '#fff', height: '48px', px: '32px', borderRadius: '10px',
              fontSize: '15px', fontWeight: 600, textTransform: 'none',
              boxShadow: 'none', transition: 'all 0.2s ease',
              '&:hover': { backgroundColor: '#1B5E20', transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)' }
            }}
          >
            Get Recommendation
          </Button>
        </Container>
      </Box>

    </Box>
  );
};

export default FeaturesPage;
