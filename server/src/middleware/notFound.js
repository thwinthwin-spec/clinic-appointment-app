/** 404 handler for unknown routes. Must be placed after all real routes. */
const api = require('../utils/apiResponse');

function notFound(req, res, next) {
  const message = `Route ${req.method} ${req.originalUrl} was not found`;
  return next(new api.ApiError(404, message));
}

module.exports = notFound;
