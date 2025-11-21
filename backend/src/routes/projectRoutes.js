import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
} from '../controllers/projectController.js';

const router = express.Router();

/**
 * Project Routes
 * All routes require authentication
 */

// GET /api/projects - Get all user's projects
router.get('/', authenticate, getProjects);

// POST /api/projects - Create new project
router.post('/', authenticate, createProject);

// GET /api/projects/:id - Get single project
router.get('/:id', authenticate, getProject);

// PUT /api/projects/:id - Update project
router.put('/:id', authenticate, updateProject);

// DELETE /api/projects/:id - Delete project
router.delete('/:id', authenticate, deleteProject);

export default router;
