import express from 'express';
import {
  logProgress,
  getProgress,
  getProgressById,
  updateProgress,
  deleteProgress,
  getStats
} from '../controllers/progressController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', logProgress);
router.get('/', getProgress);
router.get('/stats', getStats);
router.get('/:id', getProgressById);
router.put('/:id', updateProgress);
router.delete('/:id', deleteProgress);

export default router;
