import express from 'express';
import { register, login, refresh } from '../controllers/authController.js';

const router = express.Router();

/**
 * Auth Routes
 * All routes are public (no authentication required)
 */

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/refresh
router.post('/refresh', refresh);

export default router;
