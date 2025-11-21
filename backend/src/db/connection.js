import mongoose from 'mongoose';
import config from '../config/index.js';
import logger from '../utils/logger.js';

/**
 * Connect to MongoDB database
 * Includes retry logic and error handling
 */
const connectDB = async () => {
    try {

        const conn = await mongoose.connect(config.mongodb.uri);

        logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            logger.error(`MongoDB connection error: ${err}`);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            logger.info('MongoDB reconnected');
        });

        return conn;
    } catch (error) {
        logger.error(`❌ MongoDB connection failed: ${error.message}`);
        // Exit process with failure
        process.exit(1);
    }
};

export default connectDB;
