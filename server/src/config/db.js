const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const connectDB = async () => {
  try {
    const nodeEnv = process.env.NODE_ENV || 'development';
    console.log(`NODE_ENV in connectDB: ${nodeEnv}`);
    const uri = process.env.NODE_ENV === 'test' ? process.env.MONGO_URI_TEST : process.env.MONGO_URI_DEV;
    console.log(`Connecting to MongoDB with URI: ${uri}`); // Debug log
    await mongoose.connect(uri);
    console.log('MongoDB connected and ready to go!');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
