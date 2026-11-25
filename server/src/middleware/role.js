/**
 * Role checks. Place these after the auth middleware.
 * role('admin') allows only admins; role('patient') allows only patients.
 */
const api = require('../utils/apiResponse');

function role(allowedRole) {
  return function checkRole(req, res, next) {
    try {
      if (!req.user) {
        throw new api.ApiError(401, 'Authentication required');
      }

      if (req.user.role !== allowedRole) {
        const message = `Access denied. Required role: ${allowedRole}`;
        throw new api.ApiError(403, message);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/** Used by routes that accept both patients and admins. */
function patientOrAdmin(req, res, next) {
  try {
    if (!req.user) {
      throw new api.ApiError(401, 'Authentication required');
    }

    if (req.user.role !== 'patient' && req.user.role !== 'admin') {
      throw new api.ApiError(
        403,
        'Access denied. Required role: patient or admin'
      );
    }

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { role, patientOrAdmin };
