const ERROR_CODES = require('../constants/errorCodes');
const HTTP = require('../constants/http');

class ApiError extends Error {
  constructor(statusCode, message, code = ERROR_CODES.INTERNAL_ERROR, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, errors = []) {
    return new ApiError(HTTP.BAD_REQUEST, message, ERROR_CODES.VALIDATION_ERROR, errors);
  }

  static unauthorized(message) {
    return new ApiError(HTTP.UNAUTHORIZED, message, ERROR_CODES.UNAUTHORIZED);
  }

  static forbidden(message) {
    return new ApiError(HTTP.FORBIDDEN, message, ERROR_CODES.FORBIDDEN);
  }

  static notFound(message) {
    return new ApiError(HTTP.NOT_FOUND, message, ERROR_CODES.NOT_FOUND);
  }

  static conflict(message, data = null) {
    const error = new ApiError(HTTP.CONFLICT, message, ERROR_CODES.DUPLICATE_ENTRY);
    if (data) error.data = data;
    return error;
  }

  static validation(errors) {
    return new ApiError(HTTP.UNPROCESSABLE_ENTITY, 'Validation failed', ERROR_CODES.VALIDATION_ERROR, errors);
  }

  static rateLimited(message) {
    return new ApiError(HTTP.TOO_MANY_REQUESTS, message, ERROR_CODES.RATE_LIMITED);
  }

  static gemini(message, data = null) {
    const error = new ApiError(HTTP.BAD_GATEWAY, message, ERROR_CODES.GEMINI_ERROR);
    if (data) error.data = data;
    return error;
  }
}

module.exports = ApiError;
