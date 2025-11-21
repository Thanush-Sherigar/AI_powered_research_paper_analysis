import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
    generateAINote,
} from '../controllers/notesController.js';

const router = express.Router();

/**
 * Notes Routes
 * All routes require authentication
 */

// GET /api/papers/:id/notes - Get all notes for a paper
router.get('/papers/:id/notes', authenticate, getNotes);

// POST /api/papers/:id/notes - Create note
router.post('/papers/:id/notes', authenticate, createNote);

// POST /api/papers/:id/ai-notes - Generate AI note
router.post('/papers/:id/ai-notes', authenticate, generateAINote);

// PUT /api/notes/:id - Update note
router.put('/notes/:id', authenticate, updateNote);

// DELETE /api/notes/:id - Delete note
router.delete('/notes/:id', authenticate, deleteNote);

export default router;
