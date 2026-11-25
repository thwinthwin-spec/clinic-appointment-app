/**
 * Express app setup.
 * server.js owns the database connection and the listening port.
 */
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const env = require('./config/env');
const apiRoutes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Step 1: allow the React app to call this API.
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  })
);

// Step 2: parse JSON and form request bodies.
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Step 3: log requests during normal development.
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Simple health check used by deployment and LAN probes.
app.get('/health', function health(req, res) {
  const uptime = Number(process.uptime().toFixed(2));

  res.status(200).json({
    success: true,
    message: 'Clinic API is running',
    data: { status: 'ok', uptimeSeconds: uptime },
  });
});

// Step 4: mount every /api route.
app.use('/api', apiRoutes);

// Step 5: 404 and error handlers must come after all routes.
app.use(notFound);
app.use(errorHandler);

module.exports = app;
