import express from 'express';
import {
  updateProfile,
  updateUser,
  getStreak,
  updateStreak,
  addAchievement,
  getAchievements
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.put('/profile', updateProfile);
router.put('/', updateUser);
router.get('/streak', getStreak);
router.post('/streak', updateStreak);
router.post('/achievements', addAchievement);
router.get('/achievements', getAchievements);

export default router;
