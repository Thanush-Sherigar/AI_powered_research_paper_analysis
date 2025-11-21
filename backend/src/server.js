import app from './app.js';
import connectDB from './db/connection.js';
import config from './config/index.js';
import logger from './utils/logger.js';

/**
 * Server Bootstrap
 * Connects to database and starts Express server
 */

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Start Express server
        const server = app.listen(config.port, () => {
            logger.success(`🚀 Server running on port ${config.port}`);
            logger.info(`📝 Environment: ${config.nodeEnv}`);
            logger.info(`🔗 Health check: http://localhost:${config.port}/health`);
        });

        // Graceful shutdown
        const gracefulShutdown = async (signal) => {
            logger.warn(`\n${signal} received. Starting graceful shutdown...`);

            server.close(async () => {
                logger.info('HTTP server closed');

                try {
                    await mongoose.connection.close();
                    logger.info('MongoDB connection closed');
                    process.exit(0);
                } catch (error) {
                    logger.error(`Error during shutdown: ${error.message}`);
                    process.exit(1);
                }
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                logger.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        // Handle shutdown signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
        logger.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
};

// Start the server
startServer();
