import mongoose from 'mongoose';
import { MONGODB_URI } from './envConfig';
import { logger } from './core/logger';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI!, {
      maxPoolSize: 100,
    });
    logger.info('Database connected');
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
};
