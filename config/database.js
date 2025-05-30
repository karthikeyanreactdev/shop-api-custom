
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    let mongoUri;
    
    if (process.env.NODE_ENV === 'production' && process.env.DB_URI) {
      mongoUri = process.env.DB_URI;
    } else {
      // Use MongoDB Memory Server for development and test environments
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log('Using MongoDB Memory Server for development');
    }

    const conn = await mongoose.connect(mongoUri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error('Database disconnection error:', error);
  }
};

module.exports = { connectDB, disconnectDB };
