/**
 * Environment settings for the server.
 * Every value has a safe development fallback, so a .env file is optional.
 */
require('dotenv').config();

const env = {};

// Port used by npm start and npm run dev.
env.port = Number(process.env.PORT) || 5000;

// MongoDB connection string.
env.mongoUri =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/clinic_appointment';

// Development-only fallback secret. Use a long random secret in real deployments.
env.jwtSecret = process.env.JWT_SECRET || 'dev-only-insecure-jwt-secret-change-me';
env.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

// Origin allowed by CORS (the React app).
env.clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Demo accounts created by the seed script.
env.seed = {};
env.seed.adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@clinic.test';
env.seed.adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';
env.seed.patientEmail = process.env.SEED_PATIENT_EMAIL || 'patient@clinic.test';
env.seed.patientPassword = process.env.SEED_PATIENT_PASSWORD || 'Patient@123';

module.exports = env;
