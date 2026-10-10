const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas / Local MongoDB instance
 */
const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      if (process.env.NODE_ENV === 'production') {
        console.error('❌ CRITICAL ERROR: MONGO_URI environment variable is not defined in production!');
        console.error('👉 Please add your MongoDB Atlas connection string to your hosting provider environment variables (e.g. Render Dashboard -> Environment -> MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/learnhub_ai)');
        process.exit(1);
      }
      mongoUri = 'mongodb://localhost:27017/learnhub_ai';
      console.warn('⚠️ MONGO_URI not provided; falling back to local MongoDB: mongodb://localhost:27017/learnhub_ai');
    }
    
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000 // 10s timeout for cloud connection
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
    if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      console.error('👉 MongoDB Atlas authentication failed. Please verify your database username and password in MONGO_URI.');
    } else if (error.message.includes('getaddrinfo ENOTFOUND') || error.message.includes('querySrv ENOTFOUND')) {
      console.error('👉 MongoDB Atlas host could not be resolved. Please verify the cluster domain in MONGO_URI.');
    } else if (error.message.includes('Server selection timed out')) {
      console.error('👉 MongoDB Atlas connection timed out. Make sure "0.0.0.0/0" (allow access from anywhere) is configured in your MongoDB Atlas Network Access IP Access List.');
    }
    process.exit(1);
  }
};

module.exports = connectDB;
