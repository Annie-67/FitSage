import express from 'express';
import {
  logWorkout,
  getWorkoutLogs,
  getWorkoutLogByDate,
  deleteWorkoutLog,
  getWorkoutLogStats
} from '../controllers/workoutLogController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', logWorkout);
router.get('/stats', getWorkoutLogStats);
router.get('/', getWorkoutLogs);
router.get('/date/:date', getWorkoutLogByDate);
router.delete('/:id', deleteWorkoutLog);

export default router;
