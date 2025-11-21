import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import paperRoutes from './routes/paperRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';
import notesRoutes from './routes/notesRoutes.js';
import { errorHandler, notFoundHandler } from './middlewares/errorMiddleware.js';
import logger from './utils/logger.js';

/**
 * Express Application Setup
 */

const app = express();

// ===== MIDDLEWARE =====

// CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        logger.debug(`${req.method} ${req.path}`);
        next();
    });
}

// ===== ROUTES =====

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api', analysisRoutes);
app.use('/api', notesRoutes);

// ===== ERROR HANDLING =====

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
