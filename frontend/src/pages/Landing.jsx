import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  FitnessCenter,
  Restaurant,
  TrendingUp,
  Chat,
  EmojiEvents,
  CalendarMonth,
} from '@mui/icons-material';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FitnessCenter sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Personalized Workouts',
      description: 'AI-powered workout plans tailored to your fitness level and goals',
    },
    {
      icon: <Restaurant sx={{ fontSize: 40, color: 'secondary.main' }} />,
      title: 'Nutrition Plans',
      description: 'Custom meal plans that match your dietary preferences and targets',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Progress Tracking',
      description: 'Visualize your improvements with detailed charts and statistics',
    },
    {
      icon: <Chat sx={{ fontSize: 40, color: 'secondary.main' }} />,
      title: 'AI Coach',
      description: 'Get instant guidance and motivation from your personal AI trainer',
    },
    {
      icon: <EmojiEvents sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Achievements',
      description: 'Track your streaks and earn badges as you reach your milestones',
    },
    {
      icon: <CalendarMonth sx={{ fontSize: 40, color: 'secondary.main' }} />,
      title: 'Smart Scheduling',
      description: 'Plan your workouts and meals with our intuitive calendar',
    },
  ];

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img src="/logo.png" alt="FitSage" style={{ height: 40, marginRight: 12 }} />
            <Typography
              variant="h5"
              sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, color: 'primary.main' }}
            >
              FitSage
            </Typography>
          </Box>
          <Button
            variant="outlined"
            sx={{ mr: 2 }}
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/register')}
          >
            Get Started
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ mt: 8, mb: 12 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontFamily: '"Playfair Display", serif',
                fontWeight: 700,
                color: 'primary.main',
                mb: 3,
              }}
            >
              Train Smart.
              <br />
              Live Wise.
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              paragraph
              sx={{ mb: 4, lineHeight: 1.8 }}
            >
              Your AI-powered fitness companion that combines intelligent workout planning
              with mindful living. Get personalized plans, track your progress, and achieve
              your goals with FitSage.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
              >
                Start Your Journey
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <img
                src="/logo.png"
                alt="FitSage Logo"
                style={{
                  width: '100%',
                  maxWidth: 400,
                  height: 'auto',
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ backgroundColor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontWeight: 700,
              mb: 6,
            }}
          >
            Everything You Need to Succeed
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 4 }}>
                    <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ my: 12, textAlign: 'center' }}>
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            fontFamily: '"Playfair Display", serif',
            fontWeight: 700,
            mb: 3,
          }}
        >
          Ready to Transform Your Life?
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 4 }}>
          Join FitSage today and start your journey to a healthier, happier you.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/register')}
          sx={{ px: 6, py: 2 }}
        >
          Get Started Free
        </Button>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          py: 4,
          textAlign: 'center',
        }}
      >
        <Typography variant="body2">
          2024 FitSage. Train Smart. Live Wise.
        </Typography>
      </Box>
    </Box>
  );
}
