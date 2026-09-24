const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas / Local MongoDB instance
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/learnhub_ai';
    
    const conn = await mongoose.connect(mongoUri, {
      // Modern mongoose options are enabled by default in v6+
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host} [DB: ${conn.connection.name}]`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB connection lost. Retrying...');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination.');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
