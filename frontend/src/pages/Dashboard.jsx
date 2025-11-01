import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  FitnessCenter,
  Restaurant,
  LocalFireDepartment,
  TrendingUp,
  EmojiEvents,
} from '@mui/icons-material';
import { useAuth } from '../utils/AuthContext';
import { workoutAPI, nutritionAPI, workoutLogAPI, nutritionLogAPI } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [workoutStats, setWorkoutStats] = useState(null);
  const [nutritionStats, setNutritionStats] = useState(null);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [activeNutrition, setActiveNutrition] = useState(null);

  useEffect(() => {
    // Check if user needs to complete profile
    const isProfileIncomplete = !user?.profile?.age || !user?.profile?.gender || !user?.profile?.height || !user?.profile?.weight;

    if (isProfileIncomplete) {
      // Redirect to profile page for first-time users
      navigate('/profile', { state: { firstTime: true } });
      return;
    }

    const fetchData = async () => {
      try {
        const [workoutRes, nutritionRes, workoutStatsRes, nutritionStatsRes] = await Promise.allSettled([
          workoutAPI.getActive(),
          nutritionAPI.getActive(),
          workoutLogAPI.getStats('week'),
          nutritionLogAPI.getStats('week'),
        ]);

        if (workoutRes.status === 'fulfilled') {
          setActiveWorkout(workoutRes.value.data.workoutPlan);
        }

        if (nutritionRes.status === 'fulfilled') {
          setActiveNutrition(nutritionRes.value.data.nutritionPlan);
        }

        if (workoutStatsRes.status === 'fulfilled') {
          setWorkoutStats(workoutStatsRes.value.data.stats);
        }

        if (nutritionStatsRes.status === 'fulfilled') {
          setNutritionStats(nutritionStatsRes.value.data.stats);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          Welcome back, {user?.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's your fitness overview for this week
        </Typography>
      </Box>

      {/* Stats Cards - 2 Workout + 2 Nutrition Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Workout Streak */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalFireDepartment sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="h6" fontWeight={600}>
                  Workout Streak
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700}>
                {workoutStats?.currentStreak || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                days in a row
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Workout Completion Rate */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmojiEvents sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="h6" fontWeight={600}>
                  Completion
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700}>
                {workoutStats?.completionRate || 0}%
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                workout success
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Nutrition Streak */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Restaurant sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="h6" fontWeight={600}>
                  Nutrition Streak
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700}>
                {nutritionStats?.currentStreak || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                days on track
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Nutrition Adherence */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="h6" fontWeight={600}>
                  Adherence
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700}>
                {nutritionStats?.adherenceRate || 0}%
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                nutrition success
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Active Plans */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FitnessCenter sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" fontWeight={600}>
                  Active Workout Plan
                </Typography>
              </Box>
              {activeWorkout ? (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {activeWorkout.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {activeWorkout.description}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={activeWorkout.fitnessLevel}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={`${activeWorkout.duration} weeks`}
                      size="small"
                    />
                  </Box>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/workouts')}
                  >
                    View Details
                  </Button>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    No active workout plan
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/workouts')}
                    sx={{ mt: 2 }}
                  >
                    Create Plan
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Restaurant sx={{ color: 'secondary.main', mr: 1 }} />
                <Typography variant="h6" fontWeight={600}>
                  Active Nutrition Plan
                </Typography>
              </Box>
              {activeNutrition ? (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {activeNutrition.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {activeNutrition.description}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={`${activeNutrition.dailyTargets.calories} cal/day`}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={`${activeNutrition.duration} weeks`}
                      size="small"
                    />
                  </Box>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/nutrition')}
                  >
                    View Details
                  </Button>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    No active nutrition plan
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/nutrition')}
                    sx={{ mt: 2 }}
                  >
                    Create Plan
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<TrendingUp />}
              onClick={() => navigate('/progress')}
            >
              View Workout Calendar
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<FitnessCenter />}
              onClick={() => navigate('/workouts')}
            >
              View Workouts
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<Restaurant />}
              onClick={() => navigate('/nutrition')}
            >
              View Nutrition
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
