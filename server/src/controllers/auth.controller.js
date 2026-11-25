/** Authentication and profile controllers. */
const User = require('../models/User');
const tokens = require('../utils/generateToken');
const api = require('../utils/apiResponse');

/**
 * POST /api/auth/register
 * Registers a patient. A role sent by the client is ignored.
 */
async function register(req, res, next) {
  try {
    const body = req.body;
    const email = String(body.email).trim().toLowerCase();

    // Step 1: stop duplicate emails before trying to insert.
    const existing = await User.findOne({ email: email }).lean();
    if (existing) {
      throw new api.ApiError(409, 'Email is already registered');
    }

    // Step 2: create the patient. The model hashes the password on save.
    const user = await User.create({
      name: body.name,
      email: email,
      password: body.password,
      phone: body.phone || '',
      role: 'patient',
    });

    const token = tokens.generateToken(user);

    return api.sendSuccess(res, {
      status: 201,
      message: 'Registration successful',
      data: { user: user, token: token },
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new api.ApiError(409, 'Email is already registered'));
    }
    return next(error);
  }
}

/** POST /api/auth/login */
async function login(req, res, next) {
  try {
    const body = req.body;
    const email = String(body.email).trim().toLowerCase();
    const password = body.password;

    // The password field is select:false, so ask for it on this one query.
    const user = await User.findOne({ email: email }).select('+password');

    let matches = false;
    if (user) {
      matches = await user.comparePassword(password);
    }

    if (!user || !matches) {
      throw new api.ApiError(401, 'Invalid email or password');
    }

    const token = tokens.generateToken(user);

    return api.sendSuccess(res, {
      message: 'Login successful',
      data: { user: user, token: token },
    });
  } catch (error) {
    return next(error);
  }
}

/** GET /api/auth/me */
async function getMe(req, res, next) {
  try {
    return api.sendSuccess(res, {
      message: 'Current user retrieved',
      data: { user: req.user },
    });
  } catch (error) {
    return next(error);
  }
}

/** PUT /api/auth/profile */
async function updateProfile(req, res, next) {
  try {
    const body = req.body;
    const updates = {};

    if (body.name !== undefined) {
      updates.name = body.name;
    }
    if (body.phone !== undefined) {
      updates.phone = body.phone;
    }

    if (body.email !== undefined) {
      const email = String(body.email).trim().toLowerCase();
      updates.email = email;

      // Ignore the user's own record when looking for a duplicate.
      const duplicate = await User.findOne({
        email: email,
        _id: { $ne: req.user._id },
      }).lean();

      if (duplicate) {
        throw new api.ApiError(409, 'Email is already registered');
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new api.ApiError(404, 'User not found');
    }

    return api.sendSuccess(res, {
      message: 'Profile updated successfully',
      data: { user: user },
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new api.ApiError(409, 'Email is already registered'));
    }
    return next(error);
  }
}

module.exports = { register, login, getMe, updateProfile };
