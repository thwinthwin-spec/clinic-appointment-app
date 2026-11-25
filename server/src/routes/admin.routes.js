/** Admin-only routes. Every route in this file requires an admin token. */
const express = require('express');
const body = require('express-validator').body;
const param = require('express-validator').param;
const query = require('express-validator').query;

const adminController = require('../controllers/admin.controller');
const roleMiddleware = require('../middleware/role');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const slots = require('../utils/slots');

const router = express.Router();

router.use(auth);
router.use(roleMiddleware.role('admin'));

function validDate(value) {
  if (!slots.isValidDateString(value)) {
    throw new Error('date must be a real calendar date in YYYY-MM-DD format');
  }
  return true;
}

/** GET /api/admin/appointments */
router.get(
  '/appointments',
  validate([
    query('doctor').optional().isMongoId().withMessage('doctor must be a valid id'),
    query('patient').optional().isMongoId().withMessage('patient must be a valid id'),
    query('date').optional().custom(validDate),
    query('status')
      .optional()
      .isIn(['pending', 'confirmed', 'cancelled', 'completed'])
      .withMessage('Invalid appointment status'),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ]),
  adminController.getAppointments
);

/** PATCH /api/admin/appointments/:id/status */
router.patch(
  '/appointments/:id/status',
  validate([
    param('id').isMongoId().withMessage('Invalid appointment id'),
    body('status')
      .isIn(['confirmed', 'cancelled', 'completed'])
      .withMessage('status must be confirmed, cancelled or completed'),
    body('cancellationReason')
      .optional()
      .trim()
      .isLength({ max: 300 })
      .withMessage('Cancellation reason cannot exceed 300 characters'),
  ]),
  adminController.updateAppointmentStatus
);

/** GET /api/admin/dashboard */
router.get('/dashboard', adminController.dashboard);

module.exports = router;
