/**
 * JSON response helpers used by every controller.
 *
 * Success single : { success: true, message: '...', data: { ... } }
 * Success list   : { success: true, data: { items, page, pages, total } }
 * Error          : { success: false, message: '...', errors: [...] }
 */

class ApiError extends Error {
  constructor(status, message, errors) {
    super(message);

    this.name = 'ApiError';
    this.status = status;
    this.success = false;

    if (Array.isArray(errors)) {
      this.errors = errors;
    } else {
      this.errors = [];
    }
  }
}

/** Send one resource. */
function sendSuccess(res, options) {
  let status = options.status;
  let message = options.message;
  let data = options.data;

  if (status === undefined) status = 200;
  if (message === undefined) message = 'OK';
  if (data === undefined) data = {};

  return res.status(status).json({
    success: true,
    message: message,
    data: data,
  });
}

/** Send a paginated list. The contract has no message for list responses. */
function sendList(res, options) {
  let items = options.items;
  let page = options.page;
  let pages = options.pages;
  let total = options.total;

  if (items === undefined) items = [];
  if (page === undefined) page = 1;
  if (pages === undefined) pages = 0;
  if (total === undefined) total = 0;

  return res.status(200).json({
    success: true,
    data: {
      items: items,
      page: page,
      pages: pages,
      total: total,
    },
  });
}

/** Send the canonical error body. `errors` is omitted when empty. */
function sendError(res, status, message, errors) {
  const body = {
    success: false,
    message: message,
  };

  if (Array.isArray(errors) && errors.length > 0) {
    body.errors = errors;
  }

  return res.status(status).json(body);
}

/** Pass rejected async promises to the central error handler. */
function asyncHandler(handler) {
  return function wrappedHandler(req, res, next) {
    try {
      const result = handler(req, res, next);
      return Promise.resolve(result).catch(next);
    } catch (error) {
      return next(error);
    }
  };
}

/** Read page and limit from the query string with safe bounds. */
function getPagination(query, defaultLimit, maxLimit) {
  if (!query) query = {};
  if (defaultLimit === undefined) defaultLimit = 10;
  if (maxLimit === undefined) maxLimit = 100;

  let page = Number.parseInt(query.page, 10);
  let requestedLimit = Number.parseInt(query.limit, 10);

  if (Number.isNaN(page) || page < 1) page = 1;
  if (Number.isNaN(requestedLimit) || requestedLimit < 1) {
    requestedLimit = defaultLimit;
  }

  let limit = requestedLimit;
  if (limit > maxLimit) limit = maxLimit;

  const skip = (page - 1) * limit;

  return { page: page, limit: limit, skip: skip };
}

module.exports = {
  ApiError,
  sendSuccess,
  sendList,
  sendError,
  asyncHandler,
  getPagination,
};
