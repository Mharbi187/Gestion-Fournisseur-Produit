// src/config/db.js (updated)
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect with URI:', process.env.MONGODB_URI);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Remove deprecated options (no longer needed in mongoose 6+)
      serverSelectionTimeoutMS: 5000,  // Optional: timeout after 5s
      socketTimeoutMS: 45000          // Optional: socket timeout
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;