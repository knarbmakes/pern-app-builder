import mongoose from 'mongoose';
import { MONGODB_URI } from './envConfig';

try {
      export const connectDB = async () => {
    await mongoose.connect(MONGODB_URI!, {
      maxPoolSize: 100,
    });
    console.log('Database connected');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};
