import logger from '../utils/logger.js';

/**
 * Centralized error handling middleware
 * Catches all errors and returns consistent JSON responses
 */
export const errorHandler = (err, req, res, next) => {
    // Log the error
    logger.error(`${err.name}: ${err.message}`);
    logger.debug(err.stack);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({
            error: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: errors,
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(409).json({
            error: 'DUPLICATE_ERROR',
            message: `${field} already exists`,
        });
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({
            error: 'INVALID_ID',
            message: 'Invalid ID format',
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'INVALID_TOKEN',
            message: 'Invalid token',
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'TOKEN_EXPIRED',
            message: 'Token expired',
        });
    }

    // Custom application errors
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            error: err.code || 'APPLICATION_ERROR',
            message: err.message,
        });
    }

    // Default server error
    return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: process.env.NODE_ENV === 'development'
            ? err.message
            : 'An unexpected error occurred',
    });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        error: 'NOT_FOUND',
        message: `Route ${req.method} ${req.path} not found`,
    });
};

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
    constructor(message, statusCode, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'AppError';
    }
}
