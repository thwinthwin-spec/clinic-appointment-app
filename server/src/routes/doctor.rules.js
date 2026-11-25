/** express-validator rules for doctor create and update requests. */
const body = require('express-validator').body;
const slots = require('../utils/slots');

/** A day may be a name such as Mon or a number written as a string. */
function validDay(value) {
  const text = String(value);
  if (slots.ALLOWED_DAYS.indexOf(text) !== -1) return true;
  throw new Error('Day must be Mon..Sun or 0..6');
}

/** POST /api/doctors: the four main fields are required. */
function createRules() {
  return [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Doctor name is required')
      .isLength({ max: 100 })
      .withMessage('Name cannot exceed 100 characters'),
    body('specialty')
      .trim()
      .notEmpty()
      .withMessage('Specialty is required')
      .isLength({ max: 100 })
      .withMessage('Specialty cannot exceed 100 characters'),
    body('qualification')
      .trim()
      .notEmpty()
      .withMessage('Qualification is required')
      .isLength({ max: 150 })
      .withMessage('Qualification cannot exceed 150 characters'),
    body('experienceYears')
      .isInt({ min: 0, max: 80 })
      .withMessage('Experience years must be a whole number between 0 and 80')
      .toInt(),
    body('workingHours.days')
      .optional()
      .isArray({ min: 1 })
      .withMessage('workingHours.days must be a non-empty array'),
    body('workingHours.days.*').optional().custom(validDay),
    body('workingHours.start')
      .optional()
      .matches(slots.TIME_PATTERN)
      .withMessage('workingHours.start must be HH:mm'),
    body('workingHours.end')
      .optional()
      .matches(slots.TIME_PATTERN)
      .withMessage('workingHours.end must be HH:mm'),
    body('slotDurationMinutes')
      .optional()
      .isInt({ min: 5, max: 480 })
      .withMessage('slotDurationMinutes must be between 5 and 480')
      .toInt(),
    body('availableSlots')
      .optional()
      .isArray({ min: 1 })
      .withMessage('availableSlots must be a non-empty array'),
    body('availableSlots.*')
      .optional()
      .matches(slots.TIME_PATTERN)
      .withMessage('Each available slot must be HH:mm'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean')
      .toBoolean(),
  ];
}

/** PUT /api/doctors/:id: every field is optional. */
function updateRules() {
  return [
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Doctor name is required')
      .isLength({ max: 100 })
      .withMessage('Name cannot exceed 100 characters'),
    body('specialty')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Specialty is required')
      .isLength({ max: 100 })
      .withMessage('Specialty cannot exceed 100 characters'),
    body('qualification')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Qualification is required')
      .isLength({ max: 150 })
      .withMessage('Qualification cannot exceed 150 characters'),
    body('experienceYears')
      .optional()
      .isInt({ min: 0, max: 80 })
      .withMessage('Experience years must be a whole number between 0 and 80')
      .toInt(),
    body('workingHours.days')
      .optional()
      .isArray({ min: 1 })
      .withMessage('workingHours.days must be a non-empty array'),
    body('workingHours.days.*').optional().custom(validDay),
    body('workingHours.start')
      .optional()
      .matches(slots.TIME_PATTERN)
      .withMessage('workingHours.start must be HH:mm'),
    body('workingHours.end')
      .optional()
      .matches(slots.TIME_PATTERN)
      .withMessage('workingHours.end must be HH:mm'),
    body('slotDurationMinutes')
      .optional()
      .isInt({ min: 5, max: 480 })
      .withMessage('slotDurationMinutes must be between 5 and 480')
      .toInt(),
    body('availableSlots')
      .optional()
      .isArray({ min: 1 })
      .withMessage('availableSlots must be a non-empty array'),
    body('availableSlots.*')
      .optional()
      .matches(slots.TIME_PATTERN)
      .withMessage('Each available slot must be HH:mm'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean')
      .toBoolean(),
  ];
}

module.exports = { createRules, updateRules };
