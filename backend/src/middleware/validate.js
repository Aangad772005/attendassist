const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  // Map express-validator error array to our custom validation structure
  const formattedErrors = errors.array().map(err => ({
    field: err.path,
    message: err.msg,
  }));

  next(ApiError.validation(formattedErrors));
};

module.exports = validate;
