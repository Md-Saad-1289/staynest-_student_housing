import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    // Recommended mongoose settings
    mongoose.set('strictQuery', false);

    await mongoose.connect(process.env.MONGODB_URI, {
      // Mongoose 7+ doesn't require these, but providing sensible defaults
      // ensures compatibility with older MongoDB drivers/environments.
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    console.log('MongoDB connected successfully');

    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });
  } catch (error) {
    console.error('MongoDB connection error:', error.message || error);
    // Don't exit immediately when running in test environments; propagate error
    if (process.env.NODE_ENV === 'test') throw error;
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting MongoDB:', error.message);
  }
};

export { connectDB, disconnectDB };
