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
  CircularProgress,
  Chip,
  Alert,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  Checkbox,
  FormGroup,
  Slider,
  Stepper,
  Step,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Add,
  Restaurant,
  ExpandMore,
  Delete,
  LocalFireDepartment,
  Fastfood,
} from '@mui/icons-material';
import { nutritionAPI } from '../services/api';
import { useAuth } from '../utils/AuthContext';

export default function NutritionPlans() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [formData, setFormData] = useState({
    age: user?.profile?.age || '',
    gender: user?.profile?.gender || '',
    weight: user?.profile?.weight || '',
    height: user?.profile?.height || '',
    dietType: 'non-vegetarian',
    cuisines: [],
    allergies: '',
    mealsPerDay: 3,
    duration: 1,
  });

  const steps = ['Body Metrics', 'Diet Type', 'Cuisines', 'Allergies', 'Meals', 'Duration'];

  const cuisineOptions = [
    'Indian',
    'Italian',
    'Chinese',
    'Mexican',
    'Japanese',
    'Mediterranean',
    'Thai',
    'American',
    'French',
    'Korean',
  ];

  useEffect(() => {
    fetchPlans();
  }, []);

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.age > 0 && formData.gender && formData.weight > 0 && formData.height > 0;
      case 2:
        return formData.dietType !== '';
      case 3:
        return formData.cuisines.length > 0;
      case 4:
        return true; // Allergies are optional
      case 5:
        return formData.mealsPerDay >= 2 && formData.mealsPerDay <= 6;
      case 6:
        return formData.duration >= 1;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (isStepValid()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleCuisineToggle = (cuisine) => {
    setFormData((prev) => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter((c) => c !== cuisine)
        : [...prev.cuisines, cuisine],
    }));
  };

  const fetchPlans = async () => {
    try {
      const response = await nutritionAPI.getAll();
      setPlans(response.data.nutritionPlans);
    } catch (error) {
      console.error('Error fetching nutrition plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    setGenerating(true);
    setError('');

    try {
      await nutritionAPI.generate(formData);
      setOpenDialog(false);
      fetchPlans();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to generate nutrition plan');
    } finally {
      setGenerating(false);
    }
  };

  const handleActivate = async (id) => {
    try {
      await nutritionAPI.activate(id);
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
      await nutritionAPI.delete(planToDelete._id);
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
            Nutrition Plans
          </Typography>
          <Typography variant="body1" color="text.secondary">
            AI-powered personalized meal plans
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setStep(1);
            setError('');
            setOpenDialog(true);
          }}
        >
          Generate New Plan
        </Button>
      </Box>

      {plans.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Restaurant sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No nutrition plans yet
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Generate your first AI-powered nutrition plan to get started
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                setStep(1);
                setError('');
                setOpenDialog(true);
              }}
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
                      <Restaurant sx={{ mr: 2, fontSize: 32, color: 'secondary.main' }} />
                      <Typography variant="h5" fontWeight={700}>
                        {plan.title}
                      </Typography>
                      {plan.isActive && (
                        <Chip
                          label="Active"
                          color="secondary"
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
                        icon={<LocalFireDepartment />}
                        label={`${plan.dailyTargets?.calories} cal/day`}
                        size="small"
                      />
                      <Chip
                        label={`Protein: ${plan.dailyTargets?.protein}g`}
                        size="small"
                      />
                      <Chip
                        label={`Carbs: ${plan.dailyTargets?.carbs}g`}
                        size="small"
                      />
                      <Chip
                        label={`Fat: ${plan.dailyTargets?.fat}g`}
                        size="small"
                      />
                      <Chip
                        label={`${plan.duration} weeks`}
                        size="small"
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                    Weekly Meal Schedule
                  </Typography>

                  {plan.weeklyPlan && plan.weeklyPlan.length > 0 && (
                    <Box>
                      {plan.weeklyPlan.map((day, dayIndex) => (
                        <Accordion
                          key={dayIndex}
                          sx={{
                            mb: 1.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            '&:before': { display: 'none' },
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                          }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMore />}
                            sx={{
                              bgcolor: '#EA9337',
                              color: 'white',
                              borderRadius: 1,
                              '&:hover': {
                                bgcolor: '#d98330',
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                              <Typography variant="body1" fontWeight={600} sx={{ color: 'white' }}>
                                {day.dayOfWeek}
                              </Typography>
                              <Chip
                                label={`${day.meals?.length || 0} meals`}
                                size="small"
                                sx={{ ml: 'auto', fontWeight: 600, bgcolor: 'white', color: '#EA9337' }}
                              />
                            </Box>
                          </AccordionSummary>
                            <AccordionDetails sx={{ p: 0 }}>
                              <TableContainer>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                                      <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>
                                        Meal
                                      </TableCell>
                                      <TableCell align="center" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                        Type
                                      </TableCell>
                                      <TableCell align="center" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                        Calories
                                      </TableCell>
                                      <TableCell align="center" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                        Protein
                                      </TableCell>
                                      <TableCell align="center" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                        Carbs
                                      </TableCell>
                                      <TableCell align="center" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                        Fat
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {day.meals?.map((meal, mealIndex) => (
                                      <TableRow
                                        key={mealIndex}
                                        sx={{
                                          '&:hover': {
                                            bgcolor: 'action.hover',
                                          },
                                        }}
                                      >
                                        <TableCell>
                                          <Typography variant="body2" fontWeight={600}>
                                            {meal.name}
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                          <Chip
                                            label={meal.type}
                                            size="small"
                                            color="success"
                                            variant="outlined"
                                          />
                                        </TableCell>
                                        <TableCell align="center">
                                          <Chip
                                            label={meal.nutrition?.calories || meal.calories || '-'}
                                            size="small"
                                            variant="outlined"
                                          />
                                        </TableCell>
                                        <TableCell align="center">
                                          <Chip
                                            label={`${meal.nutrition?.protein || meal.protein || '-'}g`}
                                            size="small"
                                            variant="outlined"
                                          />
                                        </TableCell>
                                        <TableCell align="center">
                                          <Chip
                                            label={`${meal.nutrition?.carbs || meal.carbs || '-'}g`}
                                            size="small"
                                            variant="outlined"
                                          />
                                        </TableCell>
                                        <TableCell align="center">
                                          <Chip
                                            label={`${meal.nutrition?.fat || meal.fat || '-'}g`}
                                            size="small"
                                            variant="outlined"
                                          />
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </AccordionDetails>
                          </Accordion>
                        ))}
                    </Box>
                  )}

                  {!plan.isActive && (
                    <Button
                      variant="contained"
                      color="secondary"
                      size="large"
                      onClick={() => handleActivate(plan._id)}
                      fullWidth
                      sx={{
                        mt: 3,
                        py: 1.5,
                        fontWeight: 600,
                        fontSize: '1rem',
                      }}
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
      <Dialog open={openDialog} onClose={() => !generating && setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Generate Nutrition Plan
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Step {step} of {steps.length}: {steps[step - 1]}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Stepper activeStep={step - 1} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Step 1: Body Metrics */}
            {step === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  What are your body metrics?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  This helps us calculate your daily caloric needs
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                      margin="normal"
                      inputProps={{ min: 10, max: 100 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Gender</InputLabel>
                      <Select
                        value={formData.gender}
                        label="Gender"
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      >
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Weight (kg)"
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                      margin="normal"
                      inputProps={{ min: 20, max: 300, step: 0.1 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Height (cm)"
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) })}
                      margin="normal"
                      inputProps={{ min: 100, max: 250 }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Step 2: Diet Type */}
            {step === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  What is your diet preference?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Choose the type that best matches your lifestyle
                </Typography>
                <FormControl fullWidth>
                  <RadioGroup
                    value={formData.dietType}
                    onChange={(e) => setFormData({ ...formData, dietType: e.target.value })}
                  >
                    <FormControlLabel value="vegetarian" control={<Radio />} label="Vegetarian (No meat, fish, or poultry)" />
                    <FormControlLabel value="non-vegetarian" control={<Radio />} label="Non-Vegetarian (Includes all foods)" />
                    <FormControlLabel value="vegan" control={<Radio />} label="Vegan (No animal products)" />
                    <FormControlLabel value="pescatarian" control={<Radio />} label="Pescatarian (No meat, but includes fish)" />
                    <FormControlLabel value="eggetarian" control={<Radio />} label="Eggetarian (Vegetarian + Eggs)" />
                  </RadioGroup>
                </FormControl>
              </Box>
            )}

            {/* Step 3: Cuisines */}
            {step === 3 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  What cuisines do you enjoy?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Select all that apply - we'll create meals from these cuisines
                </Typography>
                <FormGroup>
                  <Grid container spacing={1}>
                    {cuisineOptions.map((cuisine) => (
                      <Grid item xs={6} key={cuisine}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.cuisines.includes(cuisine)}
                              onChange={() => handleCuisineToggle(cuisine)}
                            />
                          }
                          label={cuisine}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </FormGroup>
              </Box>
            )}

            {/* Step 4: Allergies */}
            {step === 4 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Do you have any food allergies or intolerances?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  List any foods you need to avoid (optional)
                </Typography>
                <TextField
                  fullWidth
                  label="Food Allergies"
                  multiline
                  rows={4}
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="e.g., peanuts, shellfish, gluten, lactose..."
                  helperText="Separate multiple allergies with commas"
                />
              </Box>
            )}

            {/* Step 5: Meals Per Day */}
            {step === 5 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  How many meals do you prefer per day?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  We'll plan your daily nutrition across this many meals
                </Typography>
                <Box sx={{ px: 2 }}>
                  <Typography variant="h3" color="primary" align="center" sx={{ my: 3 }}>
                    {formData.mealsPerDay}
                  </Typography>
                  <Slider
                    value={formData.mealsPerDay}
                    onChange={(e, value) => setFormData({ ...formData, mealsPerDay: value })}
                    min={2}
                    max={6}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                  />
                  <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 1 }}>
                    Typical: 3 meals (breakfast, lunch, dinner)
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Step 6: Duration */}
            {step === 6 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  How long should this nutrition plan last?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Choose the duration in weeks
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
                <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Summary of Your Preferences:
                  </Typography>
                  <Typography variant="body2">• Age: {formData.age} years, Gender: {formData.gender}</Typography>
                  <Typography variant="body2">• Weight: {formData.weight} kg, Height: {formData.height} cm</Typography>
                  <Typography variant="body2">• Diet: {formData.dietType}</Typography>
                  <Typography variant="body2">• Cuisines: {formData.cuisines.join(', ')}</Typography>
                  {formData.allergies && <Typography variant="body2">• Allergies: {formData.allergies}</Typography>}
                  <Typography variant="body2">• Meals per day: {formData.mealsPerDay}</Typography>
                  <Typography variant="body2">• Duration: {formData.duration} weeks</Typography>
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={generating}>
            Cancel
          </Button>
          {step > 1 && (
            <Button onClick={handleBack} disabled={generating}>
              Back
            </Button>
          )}
          {step < steps.length ? (
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
        <DialogTitle>Delete Nutrition Plan</DialogTitle>
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
