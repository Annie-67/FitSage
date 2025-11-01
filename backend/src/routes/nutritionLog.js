import express from 'express';
import {
  logNutrition,
  getNutritionLogs,
  getNutritionLogByDate,
  deleteNutritionLog,
  getNutritionLogStats
} from '../controllers/nutritionLogController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', logNutrition);
router.get('/stats', getNutritionLogStats);
router.get('/', getNutritionLogs);
router.get('/date/:date', getNutritionLogByDate);
router.delete('/:id', deleteNutritionLog);

export default router;
