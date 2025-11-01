import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Chip,
  Alert,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Divider,
} from '@mui/material';
import { Add, FitnessCenter, ExpandMore, Delete, CalendarToday } from '@mui/icons-material';
import { workoutAPI } from '../services/api';
import { useAuth } from '../utils/AuthContext';

export default function WorkoutPlans() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    gender: user?.profile?.gender || '',
    age: user?.profile?.age || '',
    workoutType: 'gym-weights', // gym-weights, gym-bodyweight, home, yoga, pilates
    reason: '', // weight-loss, muscle-gain, fitness, strength, flexibility, endurance
    fitnessLevel: user?.profile?.fitnessLevel || 'beginner',
    availableHoursPerDay: 1, // hours per day
    duration: 4,
  });
  const [step, setStep] = useState(1);
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await workoutAPI.getAll();
      setPlans(response.data.workoutPlans);
    } catch (error) {
      console.error('Error fetching workout plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    setGenerating(true);
    setError('');

    try {
      await workoutAPI.generate(formData);
      setOpenDialog(false);
      setStep(1); // Reset to first step
      fetchPlans();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to generate workout plan');
    } finally {
      setGenerating(false);
    }
  };

  const handleNext = () => {
    if (step < 6) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCloseDialog = () => {
    if (!generating) {
      setOpenDialog(false);
      setStep(1);
      setError('');
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.gender && formData.age;
      case 2:
        return formData.workoutType;
      case 3:
        return formData.reason;
      case 4:
        return formData.fitnessLevel;
      case 5:
        return formData.availableHoursPerDay > 0;
      case 6:
        return formData.duration > 0;
      default:
        return false;
    }
  };

  const handleActivate = async (id) => {
    try {
      await workoutAPI.activate(id);
      fetchPlans();
    } catch (error) {
      console.error('Error activating plan:', error);
    }
  };

  const handleDeleteClick = (plan) => {
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await workoutAPI.delete(planToDelete._id);
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
      fetchPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPlanToDelete(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight={700}>
            Workout Plans
          </Typography>
          <Typography variant="body1" color="text.secondary">
            AI-powered personalized workout plans
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Generate New Plan
        </Button>
      </Box>

      {plans.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <FitnessCenter sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No workout plans yet
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Generate your first AI-powered workout plan to get started
            </Typography>
            <Button
              variant="contained"
              onClick={() => setOpenDialog(true)}
              sx={{ mt: 2 }}
            >
              Generate Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {plans.map((plan) => (
            <Grid item xs={12} key={plan._id}>
              <Card sx={{ position: 'relative' }}>
                <CardContent>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteClick(plan)}
                    title="Delete Plan"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                    }}
                  >
                    <Delete />
                  </IconButton>
                  <Box sx={{ pr: 6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <FitnessCenter sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
                      <Typography variant="h5" fontWeight={700}>
                        {plan.title}
                      </Typography>
                      {plan.isActive && (
                        <Chip
                          label="Active"
                          color="primary"
                          size="small"
                          sx={{ ml: 2 }}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {plan.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        icon={<CalendarToday />}
                        label={`${plan.duration} weeks`}
                        size="small"
                      />
                      <Chip
                        label={plan.fitnessLevel}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                      <Chip
                        label={`${plan.weeklySchedule?.length || 0} days/week`}
                        size="small"
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                    Weekly Schedule
                  </Typography>

                    {plan.weeklySchedule && plan.weeklySchedule.length > 0 ? (
                      <Grid container spacing={2}>
                        {plan.weeklySchedule.map((day, dayIndex) => (
                          <Grid item xs={12} key={dayIndex}>
                            <Accordion
                              sx={{
                                bgcolor: 'success.light',
                                '&:before': { display: 'none' },
                                boxShadow: 1,
                              }}
                            >
                              <AccordionSummary expandIcon={<ExpandMore />}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                                  <Typography fontWeight={600} variant="subtitle1">
                                    {day.dayOfWeek}
                                  </Typography>
                                  {day.focus && (
                                    <Chip
                                      label={day.focus}
                                      size="small"
                                      sx={{
                                        bgcolor: 'white',
                                        fontWeight: 600,
                                        boxShadow: 1
                                      }}
                                    />
                                  )}
                                </Box>
                              </AccordionSummary>
                              <AccordionDetails>
                                <TableContainer component={Paper} variant="outlined">
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow sx={{ bgcolor: 'primary.light' }}>
                                        <TableCell><strong>Exercise</strong></TableCell>
                                        <TableCell align="center"><strong>Reps</strong></TableCell>
                                        <TableCell align="center"><strong>Sets</strong></TableCell>
                                        <TableCell align="center"><strong>Time</strong></TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {day.exercises?.map((exercise, exerciseIndex) => (
                                        <TableRow key={exerciseIndex} hover>
                                          <TableCell>
                                            <Typography variant="body2" fontWeight={500}>
                                              {exercise.name}
                                            </Typography>
                                            {exercise.instructions && (
                                              <Typography variant="caption" color="text.secondary">
                                                {exercise.instructions}
                                              </Typography>
                                            )}
                                          </TableCell>
                                          <TableCell align="center">
                                            <Chip label={exercise.reps || '-'} size="small" variant="outlined" />
                                          </TableCell>
                                          <TableCell align="center">
                                            <Chip label={exercise.sets || '-'} size="small" variant="outlined" />
                                          </TableCell>
                                          <TableCell align="center">
                                            {exercise.duration ? `${exercise.duration} min` : '-'}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              </AccordionDetails>
                            </Accordion>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Typography color="text.secondary">No schedule available</Typography>
                    )}

                  {!plan.isActive && (
                    <Button
                      variant="contained"
                      onClick={() => handleActivate(plan._id)}
                      fullWidth
                      size="large"
                      sx={{ mt: 3 }}
                    >
                      Activate Plan
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Generate Plan Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Generate Workout Plan - Step {step} of 6
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Tell us about yourself
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  label="Gender"
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                margin="normal"
                inputProps={{ min: 13, max: 100 }}
              />
            </Box>
          )}

          {/* Step 2: Workout Type */}
          {step === 2 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                What type of workouts do you prefer?
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Workout Type</InputLabel>
                <Select
                  value={formData.workoutType}
                  onChange={(e) => setFormData({ ...formData, workoutType: e.target.value })}
                  label="Workout Type"
                >
                  <MenuItem value="gym-weights">Gym Workouts (With Weights)</MenuItem>
                  <MenuItem value="gym-bodyweight">Gym Workouts (Bodyweight Only)</MenuItem>
                  <MenuItem value="home">Home Workouts</MenuItem>
                  <MenuItem value="yoga">Yoga</MenuItem>
                  <MenuItem value="pilates">Pilates</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Choose the workout style that best fits your preferences and available equipment.
              </Typography>
            </Box>
          )}

          {/* Step 3: Goals/Reason */}
          {step === 3 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                What is your main reason for working out?
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Primary Goal</InputLabel>
                <Select
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  label="Primary Goal"
                >
                  <MenuItem value="weight-loss">Weight Loss</MenuItem>
                  <MenuItem value="muscle-gain">Muscle Gain</MenuItem>
                  <MenuItem value="general-fitness">General Fitness</MenuItem>
                  <MenuItem value="strength">Build Strength</MenuItem>
                  <MenuItem value="flexibility">Improve Flexibility</MenuItem>
                  <MenuItem value="endurance">Build Endurance</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                This helps us tailor your workout plan to your specific goals.
              </Typography>
            </Box>
          )}

          {/* Step 4: Experience Level */}
          {step === 4 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                What is your experience level?
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Experience Level</InputLabel>
                <Select
                  value={formData.fitnessLevel}
                  onChange={(e) => setFormData({ ...formData, fitnessLevel: e.target.value })}
                  label="Experience Level"
                >
                  <MenuItem value="beginner">Beginner - New to fitness</MenuItem>
                  <MenuItem value="intermediate">Intermediate - Regular exercise routine</MenuItem>
                  <MenuItem value="advanced">Advanced - Experienced athlete</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                This helps us set the right intensity and complexity for your workouts.
              </Typography>
            </Box>
          )}

          {/* Step 5: Available Hours */}
          {step === 5 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                How many hours per day can you dedicate to working out?
              </Typography>
              <TextField
                fullWidth
                label="Available Hours per Day"
                type="number"
                value={formData.availableHoursPerDay}
                onChange={(e) => setFormData({ ...formData, availableHoursPerDay: parseFloat(e.target.value) })}
                margin="normal"
                inputProps={{ min: 0.5, max: 8, step: 0.5 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                This helps us design a realistic workout schedule that fits your lifestyle.
              </Typography>
            </Box>
          )}

          {/* Step 6: Duration */}
          {step === 6 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                How long should your program last?
              </Typography>
              <TextField
                fullWidth
                label="Duration (weeks)"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                margin="normal"
                inputProps={{ min: 1, max: 52 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                The AI will generate a personalized workout plan based on all your preferences.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={generating}>
            Cancel
          </Button>
          {step > 1 && (
            <Button onClick={handleBack} disabled={generating}>
              Back
            </Button>
          )}
          {step < 6 ? (
            <Button onClick={handleNext} variant="contained" disabled={!isStepValid()}>
              Next
            </Button>
          ) : (
            <Button onClick={handleGeneratePlan} variant="contained" disabled={generating || !isStepValid()}>
              {generating ? 'Generating...' : 'Generate Plan'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Workout Plan</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{planToDelete?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
