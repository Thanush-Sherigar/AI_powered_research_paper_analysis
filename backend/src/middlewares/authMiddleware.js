import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'UNAUTHORIZED',
                message: 'No token provided',
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = verifyAccessToken(token);

        // Get user from database (optional, for fresh data)
        const user = await User.findById(decoded.id).select('-passwordHash');

        if (!user) {
            return res.status(401).json({
                error: 'UNAUTHORIZED',
                message: 'User not found',
            });
        }

        // Attach user to request
        req.user = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
        };

        next();
    } catch (error) {
        return res.status(401).json({
            error: 'UNAUTHORIZED',
            message: error.message || 'Invalid token',
        });
    }
};

/**
 * Role-based authorization middleware
 * @param {Array<string>} roles - Allowed roles
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'UNAUTHORIZED',
                message: 'Authentication required',
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'FORBIDDEN',
                message: 'Insufficient permissions',
            });
        }

        next();
    };
};
