/** Doctor catalogue routes: public reads, admin-only writes. */
const express = require('express');
const param = require('express-validator').param;
const query = require('express-validator').query;

const doctorController = require('../controllers/doctor.controller');
const doctorWrite = require('../controllers/doctor.write.controller');
const roleMiddleware = require('../middleware/role');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const rules = require('./doctor.rules');
const slots = require('../utils/slots');

const router = express.Router();

/** GET /api/doctors */
router.get(
  '/',
  validate([
    query('search').optional().trim().isLength({ max: 100 }),
    query('specialty').optional().trim().isLength({ max: 100 }),
    query('isActive')
      .optional()
      .isIn(['true', 'false', 'all'])
      .withMessage('isActive must be true, false or all'),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  ]),
  doctorController.listDoctors
);

/** GET /api/doctors/:id/slots?date=YYYY-MM-DD */
router.get(
  '/:id/slots',
  validate([
    param('id').isMongoId().withMessage('Invalid doctor id'),
    query('date')
      .isString()
      .withMessage('date is required')
      .custom(function validDate(value) {
        if (!slots.isValidDateString(value)) {
          throw new Error('date must be a real calendar date in YYYY-MM-DD format');
        }
        return true;
      }),
  ]),
  doctorController.getDoctorSlots
);

/** GET /api/doctors/:id */
router.get(
  '/:id',
  validate([param('id').isMongoId().withMessage('Invalid doctor id')]),
  doctorController.getDoctorById
);

/** POST /api/doctors — admin only */
router.post(
  '/',
  auth,
  roleMiddleware.role('admin'),
  validate(rules.createRules()),
  doctorWrite.createDoctor
);

/** PUT /api/doctors/:id — admin only */
router.put(
  '/:id',
  auth,
  roleMiddleware.role('admin'),
  validate([param('id').isMongoId().withMessage('Invalid doctor id')].concat(rules.updateRules())),
  doctorWrite.updateDoctor
);

/** DELETE /api/doctors/:id — admin only */
router.delete(
  '/:id',
  auth,
  roleMiddleware.role('admin'),
  validate([param('id').isMongoId().withMessage('Invalid doctor id')]),
  doctorWrite.deleteDoctor
);

module.exports = router;
