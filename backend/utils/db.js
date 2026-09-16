// backend/utils/db.js
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  const localFallbackUri = 'mongodb://127.0.0.1:27017/vidyapath';

  // 1. Try Primary URI
  if (primaryUri) {
    try {
      const conn = await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (err) {
      console.warn(`⚠️ Primary MongoDB connection failed (${err.message}).`);
      
      // If primary was already local, log and exit
      if (primaryUri.includes('127.0.0.1') || primaryUri.includes('localhost')) {
        console.error('❌ Local MongoDB Connection Error:', err.message);
        return;
      }
      
      console.log('🔄 Attempting fallback to local MongoDB service (mongodb://127.0.0.1:27017/vidyapath)...');
    }
  }

  // 2. Fallback to Local MongoDB
  try {
    const fallbackConn = await mongoose.connect(localFallbackUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ MongoDB Connected Successfully (Local Fallback): ${fallbackConn.connection.host}/${fallbackConn.connection.name}`);
    return fallbackConn;
  } catch (fallbackErr) {
    console.error('❌ MongoDB Connection Error:', fallbackErr.message);
    console.warn('⚠️ Server will remain running. Reconnecting when database becomes available...');
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB connection lost. Attempting reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected successfully.');
});

module.exports = connectDB;