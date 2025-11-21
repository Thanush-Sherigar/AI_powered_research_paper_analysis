import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import {
    uploadPaper,
    uploadMiddleware,
    addByDOI,
    getPaper,
    deletePaper,
} from '../controllers/paperController.js';

const router = express.Router();

/**
 * Paper Routes
 * All routes require authentication
 */

// POST /api/papers/upload - Upload PDF
router.post('/upload', authenticate, uploadMiddleware, uploadPaper);

// POST /api/papers/add-by-doi - Add paper by DOI/arXiv (stub)
router.post('/add-by-doi', authenticate, addByDOI);

// GET /api/papers/:id - Get paper details
router.get('/:id', authenticate, getPaper);

// DELETE /api/papers/:id - Delete paper
router.delete('/:id', authenticate, deletePaper);

export default router;
