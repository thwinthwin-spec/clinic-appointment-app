/** Appointment routes. All endpoints require authentication. */
const express = require('express');
const body = require('express-validator').body;
const param = require('express-validator').param;
const query = require('express-validator').query;

const appointmentController = require('../controllers/appointment.controller');
const appointmentActions = require('../controllers/appointment.actions.controller');
const roleMiddleware = require('../middleware/role');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const slots = require('../utils/slots');

const router = express.Router();

/** Reusable custom validators for date and time fields. */
function validDate(value) {
  if (!slots.isValidDateString(value)) {
    throw new Error('date must be a real calendar date in YYYY-MM-DD format');
  }
  return true;
}

function validTime(value) {
  if (!slots.isValidTimeString(value)) {
    throw new Error('time must be in HH:mm format');
  }
  return true;
}

/** POST /api/appointments — patient only */
router.post(
  '/',
  auth,
  roleMiddleware.role('patient'),
  validate([
    body('doctor').isMongoId().withMessage('doctor must be a valid id'),
    body('date').custom(validDate),
    body('time').custom(validTime),
    body('reason')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Reason cannot exceed 500 characters'),
  ]),
  appointmentController.createAppointment
);

/** GET /api/appointments/my — patient only */
router.get(
  '/my',
  auth,
  roleMiddleware.role('patient'),
  validate([
    query('scope')
      .optional()
      .isIn(['upcoming', 'past', 'cancelled', 'all'])
      .withMessage('scope must be upcoming, past, cancelled or all'),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  ]),
  appointmentController.getMyAppointments
);

/** PATCH /api/appointments/:id/cancel — patient owner or admin */
router.patch(
  '/:id/cancel',
  auth,
  roleMiddleware.patientOrAdmin,
  validate([
    param('id').isMongoId().withMessage('Invalid appointment id'),
    body('cancellationReason')
      .optional()
      .trim()
      .isLength({ max: 300 })
      .withMessage('Cancellation reason cannot exceed 300 characters'),
  ]),
  appointmentActions.cancelAppointment
);

/** PATCH /api/appointments/:id/reschedule — patient owner only */
router.patch(
  '/:id/reschedule',
  auth,
  roleMiddleware.role('patient'),
  validate([
    param('id').isMongoId().withMessage('Invalid appointment id'),
    body('date').custom(validDate),
    body('time').custom(validTime),
  ]),
  appointmentActions.rescheduleAppointment
);

/** GET /api/appointments/:id — owner patient or admin */
router.get(
  '/:id',
  auth,
  validate([param('id').isMongoId().withMessage('Invalid appointment id')]),
  appointmentController.getAppointmentById
);

module.exports = router;
