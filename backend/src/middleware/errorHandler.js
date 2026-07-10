const HTTP = require('../constants/http');
const ERROR_CODES = require('../constants/errorCodes');
const ApiError = require('../utils/ApiError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return ApiError.badRequest(message);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)?.[0] || 'Unknown value';
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return ApiError.badRequest(message);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => ({
    field: el.path,
    message: el.message,
  }));
  return ApiError.validation(errors);
};

const sendErrorDev = (err, req, res) => {
  return res.status(err.statusCode || HTTP.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: err.message,
    code: err.code || ERROR_CODES.INTERNAL_ERROR,
    errors: err.errors || [],
    ...(err.data && { data: err.data }),
    stack: err.stack,
  });
};

const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      errors: err.errors || [],
      ...(err.data && { data: err.data }),
    });
  }

  // Programming or other unknown error: don't leak details to user
  console.error('💥 UNEXPECTED SYSTEM ERROR:', err);
  return res.status(HTTP.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'An unexpected error occurred. Our team has been notified.',
    code: ERROR_CODES.INTERNAL_ERROR,
  });
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || HTTP.INTERNAL_SERVER_ERROR;
  err.code = err.code || ERROR_CODES.INTERNAL_ERROR;

  if (process.env.NODE_ENV === 'development') {
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;
    error.errors = err.errors;
    error.data = err.data;

    // Handle database-specific errors
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);

    sendErrorDev(error, req, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    error.errors = err.errors;
    error.data = err.data;

    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);

    sendErrorProd(error, req, res);
  }
};

module.exports = errorHandler;
