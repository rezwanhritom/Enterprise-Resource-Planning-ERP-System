import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const envUri = process.env.MONGO_URI || process.env.MONGODB_URI;
const MONGO_URI =
  envUri && envUri !== 'your_mongodb_connection'
    ? envUri
    : 'mongodb://localhost:27017/erp';

/**
 * Connect to MongoDB via Mongoose.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      dbName: process.env.MONGO_DB || 'erp',
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
};

export default connectDB;
