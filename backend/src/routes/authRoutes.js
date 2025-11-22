import express from 'express';
import passport from 'passport';
import { register, login, refresh, githubCallback, getMe } from '../controllers/authController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

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

// GET /api/auth/github
router.get('/github', (req, res, next) => {
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
        return res.status(503).json({ message: 'GitHub authentication is not configured on the server.' });
    }
    passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
});

// GET /api/auth/github/callback
router.get(
    '/github/callback',
    (req, res, next) => {
        if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
            return res.redirect('/login?error=GitHub auth not configured');
        }
        next();
    },
    passport.authenticate('github', { session: false, failureRedirect: '/login' }),
    githubCallback
);

// GET /api/auth/me
router.get('/me', authenticate, getMe);

export default router;
