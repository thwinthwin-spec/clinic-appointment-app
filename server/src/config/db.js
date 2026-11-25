/**
 * MongoDB connection helper.
 * Indexes are synchronised so the partial unique index that blocks double
 * bookings always exists before the server accepts requests.
 */
const mongoose = require('mongoose');
const env = require('./env');

async function connectDB() {
  try {
    mongoose.set('strictQuery', true);

    // Step 1: connect to MongoDB.
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    // Step 2: make sure every model's declared indexes exist.
    // Model files are loaded by app.js before this function is called.
    const modelNames = mongoose.modelNames();
    for (let i = 0; i < modelNames.length; i += 1) {
      const model = mongoose.model(modelNames[i]);
      await model.syncIndexes();
    }

    console.log(`MongoDB connected: ${env.mongoUri}`);
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
}

async function disconnectDB() {
  try {
    await mongoose.disconnect();
  } catch (error) {
    console.error('MongoDB disconnect failed:', error.message);
    throw error;
  }
}

module.exports = { connectDB, disconnectDB };
