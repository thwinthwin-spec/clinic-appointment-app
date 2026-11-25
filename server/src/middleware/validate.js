/**
 * express-validator glue.
 * Routes pass validation chains; this returns the middleware array that runs
 * them and then turns any failure into the standard 400 error body.
 */
const validator = require('express-validator');
const api = require('../utils/apiResponse');

function validate(rules) {
  const chains = [];

  if (Array.isArray(rules)) {
    for (let i = 0; i < rules.length; i += 1) {
      chains.push(rules[i]);
    }
  } else {
    chains.push(rules);
  }

  function checkResult(req, res, next) {
    try {
      const result = validator.validationResult(req);

      if (result.isEmpty()) {
        next();
        return;
      }

      const rawErrors = result.array({ onlyFirstError: true });
      const errors = [];

      for (let i = 0; i < rawErrors.length; i += 1) {
        const item = rawErrors[i];

        errors.push({
          field: item.path || item.param || item.location,
          message: item.msg,
        });
      }

      next(new api.ApiError(400, 'Validation failed', errors));
    } catch (error) {
      next(error);
    }
  }

  chains.push(checkResult);
  return chains;
}

module.exports = validate;
