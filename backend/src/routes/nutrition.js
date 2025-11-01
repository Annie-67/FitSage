import express from 'express';
import {
  generateNutritionPlan,
  getNutritionPlans,
  getNutritionPlan,
  getActiveNutritionPlan,
  updateNutritionPlan,
  deleteNutritionPlan,
  setActiveNutritionPlan
} from '../controllers/nutritionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/generate', generateNutritionPlan);
router.get('/', getNutritionPlans);
router.get('/active', getActiveNutritionPlan);
router.get('/:id', getNutritionPlan);
router.put('/:id', updateNutritionPlan);
router.delete('/:id', deleteNutritionPlan);
router.post('/:id/activate', setActiveNutritionPlan);

export default router;
