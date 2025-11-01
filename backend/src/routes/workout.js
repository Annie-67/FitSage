import express from 'express';
import {
  generateWorkoutPlan,
  getWorkoutPlans,
  getWorkoutPlan,
  getActiveWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan,
  setActiveWorkoutPlan
} from '../controllers/workoutController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/generate', generateWorkoutPlan);
router.get('/', getWorkoutPlans);
router.get('/active', getActiveWorkoutPlan);
router.get('/:id', getWorkoutPlan);
router.put('/:id', updateWorkoutPlan);
router.delete('/:id', deleteWorkoutPlan);
router.post('/:id/activate', setActiveWorkoutPlan);

export default router;
