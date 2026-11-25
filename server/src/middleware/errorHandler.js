/**
 * Central error handler.
 * Converts database and parser errors into the standard error JSON shape.
 */
const api = require('../utils/apiResponse');

function errorHandler(err, req, res, next) {
  // Let Express keep handling the response if headers were already sent.
  if (res.headersSent) return next(err);

  let status = 500;
  if (err.status) status = err.status;
  else if (err.statusCode) status = err.statusCode;

  let message = err.message || 'Something went wrong';
  let errors = [];

  if (Array.isArray(err.errors)) {
    errors = err.errors;
  }

  // Duplicate key, for example a second account with the same email.
  if (err.code === 11000) {
    status = 409;
    errors = [];

    const pattern = err.keyPattern || {};

    // This is the partial unique index for appointments.
    if (pattern.doctor && pattern.date && pattern.time) {
      message = 'This appointment slot is already booked';
    } else {
      const keys = err.keyValue || pattern;
      let fields = '';

      if (keys.email) fields = 'email';
      else if (keys.name) fields = 'name';

      if (fields) message = `A record with this ${fields} already exists`;
      else message = 'Duplicate record';
    }
  }

  // A bad ObjectId in a route without its own validator.
  if (err.name === 'CastError') {
    status = 404;
    message = `Invalid ${err.path || 'id'}`;
    errors = [];
  }

  // Mongoose schema validation errors have an object of field errors.
  if (err.name === 'ValidationError' && err.errors && !Array.isArray(err.errors)) {
    status = 400;
    message = 'Validation failed';
    errors = [];

    const fields = Object.keys(err.errors);
    for (let i = 0; i < fields.length; i += 1) {
      const fieldName = fields[i];
      errors.push({
        field: fieldName,
        message: err.errors[fieldName].message,
      });
    }
  }

  // Malformed JSON from express.json().
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    status = 400;
    message = 'Malformed JSON request body';
    errors = [];
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Invalid or expired token';
    errors = [];
  }

  if (status >= 500) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);
  }

  return api.sendError(res, status, message, errors);
}

module.exports = errorHandler;
