import express from 'express';
import { chat, getMessages } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
// protected Routes
router.use(protect);

router.post('/', chat);
router.get('/:projectId/messages', getMessages);

export default router;
