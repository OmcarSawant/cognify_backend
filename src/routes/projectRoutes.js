import express from 'express';
import { createProject, getProjects, updatePrompt, deleteProject, searchProjects } from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createProject);
router.get('/', getProjects);
router.get('/search', searchProjects);
router.put('/:id/prompt', updatePrompt);
router.delete('/:id', deleteProject);

export default router;
