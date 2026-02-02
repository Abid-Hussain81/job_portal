const mongoose = require('mongoose');

/**
 * Database Connection Configuration
 * Establishes connection to MongoDB using Mongoose
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options are no longer needed in Mongoose 6+
      // but keeping them for compatibility
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Connection event listeners for better debugging
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
