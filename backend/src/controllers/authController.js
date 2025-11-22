import User from '../models/User.js';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt.js';
import { AppError } from '../middlewares/errorMiddleware.js';
import logger from '../utils/logger.js';

/**
 * Auth Controller
 * Handles user registration, login, and token refresh
 */

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;

        // Validate input
        if (!email || !password || !name) {
            throw new AppError('Email, password, and name are required', 400, 'MISSING_FIELDS');
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
        }

        // Create user (password will be hashed by pre-save hook)
        const user = new User({
            email,
            passwordHash: password, // Will be hashed automatically
            name,
        });

        await user.save();

        // Generate tokens
        const tokens = generateTokenPair(user);

        logger.success(`New user registered: ${email}`);

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            ...tokens,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            throw new AppError('Email and password are required', 400, 'MISSING_FIELDS');
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }

        // Generate tokens
        const tokens = generateTokenPair(user);

        logger.info(`User logged in: ${email}`);

        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            ...tokens,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw new AppError('Refresh token required', 400, 'MISSING_TOKEN');
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Get user
        const user = await User.findById(decoded.id);
        if (!user) {
            throw new AppError('User not found', 404, 'USER_NOT_FOUND');
        }

        // Generate new tokens
        const tokens = generateTokenPair(user);

        res.json({
            message: 'Token refreshed successfully',
            ...tokens,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GitHub Callback
 * GET /api/auth/github/callback
 */
export const githubCallback = async (req, res, next) => {
    try {
        // User is already authenticated by Passport
        const user = req.user;

        // Generate tokens
        const tokens = generateTokenPair(user);

        logger.info(`User logged in via GitHub: ${user.email}`);

        // Redirect to frontend with tokens in query params
        // In a production app, you might want to use cookies or a temporary code exchange
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/login?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`);
    } catch (error) {
        next(error);
    }
};

/**
 * Get current user
 * GET /api/auth/me
 */
export const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
        });
    } catch (error) {
        next(error);
    }
};
