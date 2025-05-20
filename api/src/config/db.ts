import mongoose, { connect } from 'mongoose';
import { MONGODB_URI } from '../util/secrets';
import logger from '../util/logger';

// const mongoUrl = MONGODB_URI || '"mongodb://127.0.0.1:27017/final-ts"';
const mongoUrl = MONGODB_URI;
const connectDB = async () => {
  try {
    await connect(mongoUrl);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.log(error);
    console.log('Database broken');
    process.exit(1);
  }
};

export default connectDB;
