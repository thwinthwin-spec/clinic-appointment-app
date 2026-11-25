/**
 * Bearer-token authentication.
 * On success the User document is attached to req.user.
 */
const User = require('../models/User');
const tokens = require('../utils/generateToken');
const api = require('../utils/apiResponse');

const auth = api.asyncHandler(async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const parts = header.split(' ');

    const scheme = parts[0];
    const token = parts[1];

    // We expect exactly: Authorization: Bearer <token>
    if (scheme !== 'Bearer' || !token || parts.length > 2) {
      throw new api.ApiError(401, 'Authorization bearer token is required');
    }

    const decoded = tokens.verifyToken(token);
    if (!decoded || !decoded.id) {
      throw new api.ApiError(401, 'Invalid or expired token');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new api.ApiError(401, 'Account no longer exists');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = auth;
