import express from 'express';
import { getUsageStats } from '../controllers/usageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getUsageStats);

export default router;
