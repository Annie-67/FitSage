import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  TrendingUp,
  CheckCircle,
  PauseCircle,
  Cancel,
  ChevronLeft,
  ChevronRight,
  Hotel,
  Restaurant,
  Check,
  Pause,
  Close,
  WarningAmber,
  Fastfood
} from '@mui/icons-material';
import { workoutAPI, workoutLogAPI, nutritionAPI, nutritionLogAPI } from '../services/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths, getDay } from 'date-fns';

export default function Progress() {
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [workoutLogs, setWorkoutLogs] = useState({});
  const [nutritionLogs, setNutritionLogs] = useState({});
  const [activePlan, setActivePlan] = useState(null);
  const [activeNutritionPlan, setActiveNutritionPlan] = useState(null);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [openWorkoutDialog, setOpenWorkoutDialog] = useState(false);
  const [selectedNutrition, setSelectedNutrition] = useState(null);
  const [openNutritionDialog, setOpenNutritionDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0 = Workout, 1 = Nutrition

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activePlan) {
      fetchWorkoutLogs();
    }
  }, [currentMonth, activePlan]);

  useEffect(() => {
    if (activeNutritionPlan) {
      fetchNutritionLogs();
    }
  }, [currentMonth, activeNutritionPlan]);

  const fetchData = async () => {
    try {
      const [workoutRes, nutritionRes] = await Promise.allSettled([
        workoutAPI.getActive(),
        nutritionAPI.getActive()
      ]);

      if (workoutRes.status === 'fulfilled') {
        setActivePlan(workoutRes.value.data.workoutPlan);
      }

      if (nutritionRes.status === 'fulfilled') {
        setActiveNutritionPlan(nutritionRes.value.data.nutritionPlan);
      }
    } catch (error) {
      console.error('Error fetching active plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkoutLogs = async () => {
    try {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);

      const response = await workoutLogAPI.getAll({
        startDate: format(start, 'yyyy-MM-dd'),
        endDate: format(end, 'yyyy-MM-dd')
      });

      // Convert array to object keyed by date for easy lookup
      const logsMap = {};
      response.data.workoutLogs.forEach(log => {
        const dateKey = format(new Date(log.date), 'yyyy-MM-dd');
        logsMap[dateKey] = log;
      });

      setWorkoutLogs(logsMap);
    } catch (error) {
      console.error('Error fetching workout logs:', error);
    }
  };

  const fetchNutritionLogs = async () => {
    try {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);

      const response = await nutritionLogAPI.getAll({
        startDate: format(start, 'yyyy-MM-dd'),
        endDate: format(end, 'yyyy-MM-dd')
      });

      // Convert array to object keyed by date for easy lookup
      const logsMap = {};
      response.data.nutritionLogs.forEach(log => {
        const dateKey = format(new Date(log.date), 'yyyy-MM-dd');
        logsMap[dateKey] = log;
      });

      setNutritionLogs(logsMap);
    } catch (error) {
      console.error('Error fetching nutrition logs:', error);
    }
  };

  const handleLogWorkout = async (date, status) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const workout = getWorkoutForDate(date);

    try {
      const response = await workoutLogAPI.log({
        date: dateKey,
        status,
        dayOfWeek: workout?.dayOfWeek,
        workoutPlan: activePlan?._id
      });

      // Update local state
      setWorkoutLogs({
        ...workoutLogs,
        [dateKey]: response.data.workoutLog
      });
    } catch (error) {
      console.error('Error logging workout:', error);
    }
  };

  const handleLogNutrition = async (date, status) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayPlan = getNutritionForDate(date);

    try {
      const response = await nutritionLogAPI.log({
        date: dateKey,
        status,
        mealsFollowed: status === 'followed-completely' ? dayPlan?.meals?.length : 0,
        totalMeals: dayPlan?.meals?.length || 0,
        nutritionPlan: activeNutritionPlan?._id
      });

      // Update local state
      setNutritionLogs({
        ...nutritionLogs,
        [dateKey]: response.data.nutritionLog
      });
    } catch (error) {
      console.error('Error logging nutrition:', error);
    }
  };

  const getWorkoutLog = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return workoutLogs[dateKey];
  };

  const getNutritionLog = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return nutritionLogs[dateKey];
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  const getWorkoutForDate = (date) => {
    if (!activePlan || !activePlan.weeklySchedule) return null;

    const dayOfWeek = format(date, 'EEEE'); // Monday, Tuesday, etc.
    return activePlan.weeklySchedule.find(day => day.dayOfWeek === dayOfWeek);
  };

  const getNutritionForDate = (date) => {
    if (!activeNutritionPlan || !activeNutritionPlan.weeklyPlan) return null;

    const dayOfWeek = format(date, 'EEEE'); // Monday, Tuesday, etc.
    return activeNutritionPlan.weeklyPlan.find(day => day.dayOfWeek === dayOfWeek);
  };

  const handleViewWorkout = (date) => {
    const workout = getWorkoutForDate(date);
    if (workout) {
      setSelectedWorkout(workout);
      setOpenWorkoutDialog(true);
    }
  };

  const handleViewNutrition = (date) => {
    const nutrition = getNutritionForDate(date);
    if (nutrition) {
      setSelectedNutrition(nutrition);
      setOpenNutritionDialog(true);
    }
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          Progress Tracker
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your daily workout and nutrition progress
        </Typography>
      </Box>

      {/* Tabs for switching between Workout and Nutrition */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Workout Progress" />
          <Tab label="Nutrition Progress" />
        </Tabs>
      </Box>

      {/* Active Plan Info */}
      {activeTab === 0 && activePlan && (
        <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
          Active Plan: {activePlan.title}
        </Typography>
      )}
      {activeTab === 1 && activeNutritionPlan && (
        <Typography variant="body2" color="secondary" sx={{ mb: 2 }}>
          Active Plan: {activeNutritionPlan.title}
        </Typography>
      )}

      {/* Workout Calendar */}
      {activeTab === 0 && !activePlan ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <TrendingUp sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Active Workout Plan
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Create and activate a workout plan to start tracking your progress
            </Typography>
          </CardContent>
        </Card>
      ) : activeTab === 0 && activePlan ? (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <IconButton onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft />
              </IconButton>
              <Typography variant="h6" fontWeight={600}>
                {format(currentMonth, 'MMMM yyyy')}
              </Typography>
              <IconButton onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight />
              </IconButton>
            </Box>

            <Grid container spacing={1}>
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <Grid item xs={12 / 7} key={day}>
                  <Typography variant="caption" fontWeight={600} align="center" display="block">
                    {day}
                  </Typography>
                </Grid>
              ))}

              {/* Empty cells for days before month starts */}
              {Array.from({ length: getDay(startOfMonth(currentMonth)) }).map((_, index) => (
                <Grid item xs={12 / 7} key={`empty-${index}`}>
                  <Box sx={{ minHeight: 140 }} />
                </Grid>
              ))}

              {/* Calendar days */}
              {getDaysInMonth().map((date, index) => {
                const workout = getWorkoutForDate(date);
                const log = getWorkoutLog(date);
                const statusConfig = {
                  'goal-achieved': { color: '#4caf50', icon: CheckCircle, label: 'Completed' },
                  'stopped-midway': { color: '#ff9800', icon: PauseCircle, label: 'Partial' },
                  'too-busy': { color: '#f44336', icon: Cancel, label: 'Skipped' }
                };

                return (
                  <Grid item xs={12 / 7} key={index}>
                    <Card
                      variant="outlined"
                      sx={{
                        minHeight: 140,
                        bgcolor: isToday(date) ? 'action.selected' : 'background.paper',
                        border: isToday(date) ? 2 : 1,
                        borderColor: isToday(date) ? 'primary.main' : 'divider',
                        cursor: workout ? 'pointer' : 'default',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                      onClick={() => workout && handleViewWorkout(date)}
                    >
                      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 }, display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <Box>
                          <Typography variant="body2" fontWeight={isToday(date) ? 700 : 400}>
                            {format(date, 'd')}
                          </Typography>

                          {workout ? (
                            <>
                              <Typography variant="caption" fontWeight={600} color="primary" sx={{ display: 'block', mt: 0.5 }}>
                                {workout.focus}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
                                {workout.totalDuration} min
                              </Typography>
                            </>
                          ) : (
                            <Box sx={{ textAlign: 'center', mt: 1 }}>
                              <Hotel sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.6 }} />
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                Rest Day
                              </Typography>
                            </Box>
                          )}

                          {log && (
                            <Box sx={{ textAlign: 'center', my: 0.5 }}>
                              {React.createElement(statusConfig[log.status]?.icon, {
                                sx: { fontSize: 18, color: statusConfig[log.status]?.color }
                              })}
                            </Box>
                          )}
                        </Box>

                        {/* Push buttons to bottom */}
                        {workout && (
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 'auto', pt: 1 }}>
                            <Button
                              size="small"
                              variant={log?.status === 'goal-achieved' ? 'contained' : 'outlined'}
                              color="success"
                              onClick={(e) => { e.stopPropagation(); handleLogWorkout(date, 'goal-achieved'); }}
                              sx={{ fontSize: '0.7rem', py: 0.5, px: 0.5, minWidth: 'auto', flex: 1 }}
                              title="Completed"
                            >
                              <Check sx={{ fontSize: 16 }} />
                            </Button>
                            <Button
                              size="small"
                              variant={log?.status === 'stopped-midway' ? 'contained' : 'outlined'}
                              color="warning"
                              onClick={(e) => { e.stopPropagation(); handleLogWorkout(date, 'stopped-midway'); }}
                              sx={{ fontSize: '0.7rem', py: 0.5, px: 0.5, minWidth: 'auto', flex: 1 }}
                              title="Partial"
                            >
                              <Pause sx={{ fontSize: 16 }} />
                            </Button>
                            <Button
                              size="small"
                              variant={log?.status === 'too-busy' ? 'contained' : 'outlined'}
                              color="error"
                              onClick={(e) => { e.stopPropagation(); handleLogWorkout(date, 'too-busy'); }}
                              sx={{ fontSize: '0.7rem', py: 0.5, px: 0.5, minWidth: 'auto', flex: 1 }}
                              title="Skipped"
                            >
                              <Close sx={{ fontSize: 16 }} />
                            </Button>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {/* Legend */}
            <Box sx={{ mt: 3, display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
                <Typography variant="caption">Completed</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PauseCircle sx={{ color: '#ff9800', fontSize: 20 }} />
                <Typography variant="caption">Partial</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Cancel sx={{ color: '#f44336', fontSize: 20 }} />
                <Typography variant="caption">Skipped</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ) : null}

      {/* Nutrition Calendar */}
      {activeTab === 1 && !activeNutritionPlan ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Restaurant sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Active Nutrition Plan
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Create and activate a nutrition plan to start tracking your progress
            </Typography>
          </CardContent>
        </Card>
      ) : activeTab === 1 && activeNutritionPlan ? (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <IconButton onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft />
              </IconButton>
              <Typography variant="h6" fontWeight={600}>
                {format(currentMonth, 'MMMM yyyy')}
              </Typography>
              <IconButton onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight />
              </IconButton>
            </Box>

            <Grid container spacing={1}>
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <Grid item xs={12 / 7} key={day}>
                  <Typography variant="caption" fontWeight={600} align="center" display="block">
                    {day}
                  </Typography>
                </Grid>
              ))}

              {/* Empty cells for days before month starts */}
              {Array.from({ length: getDay(startOfMonth(currentMonth)) }).map((_, index) => (
                <Grid item xs={12 / 7} key={`empty-${index}`}>
                  <Box sx={{ minHeight: 140 }} />
                </Grid>
              ))}

              {/* Calendar days */}
              {getDaysInMonth().map((date, index) => {
                const nutrition = getNutritionForDate(date);
                const log = getNutritionLog(date);
                const statusConfig = {
                  'followed-completely': { color: '#4caf50', icon: CheckCircle, label: 'Nailed the Meal' },
                  'followed-partially': { color: '#ff9800', icon: WarningAmber, label: 'Had Some Temptations!' },
                  'did-not-follow': { color: '#f44336', icon: Fastfood, label: 'Whoops, Cheat Day' }
                };

                return (
                  <Grid item xs={12 / 7} key={index}>
                    <Card
                      variant="outlined"
                      sx={{
                        minHeight: 140,
                        bgcolor: isToday(date) ? 'action.selected' : 'background.paper',
                        border: isToday(date) ? 2 : 1,
                        borderColor: isToday(date) ? 'secondary.main' : 'divider',
                        cursor: nutrition ? 'pointer' : 'default',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                      onClick={() => nutrition && handleViewNutrition(date)}
                    >
                      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 }, display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <Box>
                          <Typography variant="body2" fontWeight={isToday(date) ? 700 : 400}>
                            {format(date, 'd')}
                          </Typography>

                          {nutrition ? (
                            <>
                              {nutrition.meals && nutrition.meals.length > 0 && (
                                <Box sx={{ mt: 0.5 }}>
                                  {nutrition.meals.slice(0, 3).map((meal, idx) => (
                                    <Typography
                                      key={idx}
                                      variant="caption"
                                      fontWeight={500}
                                      color="secondary"
                                      sx={{
                                        display: 'block',
                                        fontSize: '0.65rem',
                                        lineHeight: 1.2,
                                        mb: 0.3,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      {meal.name}
                                    </Typography>
                                  ))}
                                  {nutrition.meals.length > 3 && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{ fontSize: '0.6rem' }}
                                    >
                                      +{nutrition.meals.length - 3} more
                                    </Typography>
                                  )}
                                </Box>
                              )}
                            </>
                          ) : (
                            <Box sx={{ textAlign: 'center', mt: 1 }}>
                              <Restaurant sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.6 }} />
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                Off Day
                              </Typography>
                            </Box>
                          )}

                          {log && (
                            <Box sx={{ textAlign: 'center', my: 0.5 }}>
                              {React.createElement(statusConfig[log.status]?.icon, {
                                sx: { fontSize: 18, color: statusConfig[log.status]?.color }
                              })}
                            </Box>
                          )}
                        </Box>

                        {/* Push buttons to bottom */}
                        {nutrition && (
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 'auto', pt: 1 }}>
                            <Button
                              size="small"
                              variant={log?.status === 'followed-completely' ? 'contained' : 'outlined'}
                              color="success"
                              onClick={(e) => { e.stopPropagation(); handleLogNutrition(date, 'followed-completely'); }}
                              sx={{ fontSize: '0.65rem', py: 0.5, px: 0.5, minWidth: 'auto', flex: 1 }}
                              title="Nailed the Meal"
                            >
                              <Check sx={{ fontSize: 16 }} />
                            </Button>
                            <Button
                              size="small"
                              variant={log?.status === 'followed-partially' ? 'contained' : 'outlined'}
                              color="warning"
                              onClick={(e) => { e.stopPropagation(); handleLogNutrition(date, 'followed-partially'); }}
                              sx={{ fontSize: '0.65rem', py: 0.5, px: 0.5, minWidth: 'auto', flex: 1 }}
                              title="Had Some Temptations!"
                            >
                              <WarningAmber sx={{ fontSize: 16 }} />
                            </Button>
                            <Button
                              size="small"
                              variant={log?.status === 'did-not-follow' ? 'contained' : 'outlined'}
                              color="error"
                              onClick={(e) => { e.stopPropagation(); handleLogNutrition(date, 'did-not-follow'); }}
                              sx={{ fontSize: '0.65rem', py: 0.5, px: 0.5, minWidth: 'auto', flex: 1 }}
                              title="Whoops, Cheat Day"
                            >
                              <Fastfood sx={{ fontSize: 16 }} />
                            </Button>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {/* Legend */}
            <Box sx={{ mt: 3, display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
                <Typography variant="caption">Nailed the Meal</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningAmber sx={{ color: '#ff9800', fontSize: 20 }} />
                <Typography variant="caption">Had Some Temptations!</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Fastfood sx={{ color: '#f44336', fontSize: 20 }} />
                <Typography variant="caption">Whoops, Cheat Day</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ) : null}

      {/* Workout Details Dialog */}
      <Dialog open={openWorkoutDialog} onClose={() => setOpenWorkoutDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedWorkout?.dayOfWeek} - {selectedWorkout?.focus}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Duration: {selectedWorkout?.totalDuration} minutes • Difficulty: {selectedWorkout?.difficulty}
          </Typography>

          <Grid container spacing={2}>
            {selectedWorkout?.exercises?.map((exercise, index) => (
              <Grid item xs={12} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {exercise.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <Typography variant="body2">Sets: {exercise.sets || '-'}</Typography>
                      <Typography variant="body2">Reps: {exercise.reps || '-'}</Typography>
                      <Typography variant="body2">Duration: {exercise.duration ? `${exercise.duration} min` : '-'}</Typography>
                    </Box>
                    {exercise.instructions && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {exercise.instructions}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenWorkoutDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Nutrition Details Dialog */}
      <Dialog open={openNutritionDialog} onClose={() => setOpenNutritionDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedNutrition?.dayOfWeek} - Meal Plan
        </DialogTitle>
        <DialogContent>
          {activeNutritionPlan?.dailyTargets && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Daily Targets:
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip label={`Calories: ${activeNutritionPlan.dailyTargets.calories}`} size="small" />
                <Chip label={`Protein: ${activeNutritionPlan.dailyTargets.protein}g`} size="small" />
                <Chip label={`Carbs: ${activeNutritionPlan.dailyTargets.carbs}g`} size="small" />
                <Chip label={`Fat: ${activeNutritionPlan.dailyTargets.fat}g`} size="small" />
              </Box>
            </Box>
          )}

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Meal</strong></TableCell>
                  <TableCell align="center"><strong>Type</strong></TableCell>
                  <TableCell align="center"><strong>Calories</strong></TableCell>
                  <TableCell align="center"><strong>Protein</strong></TableCell>
                  <TableCell align="center"><strong>Carbs</strong></TableCell>
                  <TableCell align="center"><strong>Fat</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedNutrition?.meals?.map((meal, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {meal.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={meal.type} size="small" />
                    </TableCell>
                    <TableCell align="center">{meal.nutrition?.calories || meal.calories || '-'}</TableCell>
                    <TableCell align="center">{meal.nutrition?.protein || meal.protein || '-'}g</TableCell>
                    <TableCell align="center">{meal.nutrition?.carbs || meal.carbs || '-'}g</TableCell>
                    <TableCell align="center">{meal.nutrition?.fat || meal.fat || '-'}g</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNutritionDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
