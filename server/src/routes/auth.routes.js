/** Public auth routes plus the protected profile routes. */
const express = require('express');
const body = require('express-validator').body;

const authController = require('../controllers/auth.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

/** POST /api/auth/register — always creates a patient. */
router.post(
  '/register',
  validate([
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ max: 80 })
      .withMessage('Name cannot exceed 80 characters'),
    body('email')
      .trim()
      .toLowerCase()
      .isEmail()
      .withMessage('Enter a valid email address'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('phone')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 30 })
      .withMessage('Phone cannot exceed 30 characters'),
  ]),
  authController.register
);

/** POST /api/auth/login */
router.post(
  '/login',
  validate([
    body('email')
      .trim()
      .toLowerCase()
      .isEmail()
      .withMessage('Enter a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  authController.login
);

/** GET /api/auth/me */
router.get('/me', auth, authController.getMe);

/** PUT /api/auth/profile */
router.put(
  '/profile',
  auth,
  validate([
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ max: 80 })
      .withMessage('Name cannot exceed 80 characters'),
    body('email')
      .optional()
      .trim()
      .toLowerCase()
      .isEmail()
      .withMessage('Enter a valid email address'),
    body('phone')
      .optional()
      .trim()
      .isLength({ max: 30 })
      .withMessage('Phone cannot exceed 30 characters'),
  ]),
  authController.updateProfile
);

module.exports = router;
