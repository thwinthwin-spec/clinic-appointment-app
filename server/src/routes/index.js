/** Top-level API router mounted at /api in app.js. */
const express = require('express');

const authRoutes = require('./auth.routes');
const doctorRoutes = require('./doctor.routes');
const appointmentRoutes = require('./appointment.routes');
const adminRoutes = require('./admin.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
