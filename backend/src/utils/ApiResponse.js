class ApiResponse {
  constructor(success, message, data = null, pagination = null) {
    this.success = success;
    this.message = message;
    if (data !== null) {
      this.data = data;
    }
    if (pagination !== null) {
      this.pagination = pagination;
    }
  }

  static success(res, statusCode, message, data = null) {
    return res.status(statusCode).json(new ApiResponse(true, message, data));
  }

  static paginated(res, statusCode, message, data, page, limit, total) {
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
    return res.status(statusCode).json(new ApiResponse(true, message, data, pagination));
  }
}

module.exports = ApiResponse;
