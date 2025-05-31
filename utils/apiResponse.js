/**
 * Utility class for standardizing API responses
 */
class ApiResponse {
  /**
   * Create a structured API response
   * @param {number} statusCode - HTTP status code
   * @param {string} status - Status of the response (success, fail, error)
   * @param {string} message - Response message
   * @param {Object|null} data - Response data
   * @param {Object|null} errors - Error details (if any)
   * @param {string|null} stack - Error stack trace (only in development mode)
   */
  constructor(statusCode, status, message, data = null, errors = null, stack = null) {
    this.statusCode = statusCode;
    this.status = status;
    this.message = message;
    
    if (data) this.data = data;
    if (errors) this.errors = errors;
    if (stack && process.env.NODE_ENV === 'development') this.stack = stack;
    
    this.timestamp = new Date().toISOString();
  }
  
  /**
   * Create a success response
   * @param {string} message - Success message
   * @param {Object} data - Response data
   * @param {number} statusCode - HTTP status code (default: 200)
   */
  static success(message, data, statusCode = 200) {
    return new ApiResponse(statusCode, 'success', message, data);
  }
  
  /**
   * Create an error response
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default: 500)
   * @param {Object|null} errors - Error details
   * @param {string|null} stack - Error stack trace
   */
  static error(message, statusCode = 500, errors = null, stack = null) {
    return new ApiResponse(statusCode, 'error', message, errors, stack);
  }
  
  /**
   * Create a failed validation response
   * @param {string} message - Failure message
   * @param {Object|null} errors - Validation error details
   * @param {number} statusCode - HTTP status code (default: 400)
   */
  static fail(message, errors = null, statusCode = 400) {
    return new ApiResponse(statusCode, 'fail', message, null, errors);
  }
}

/**
 * Helper function for consistent API responses
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Response message
 * @param {Object} data - Optional data to include in response
 * @returns {Object} Express response
 */
const apiResponse = (res, statusCode, message, data = null) => {
  const success = statusCode >= 200 && statusCode < 400;
  
  const response = {
    success,
    message
  };
  
  if (data) {
    response.data = data;
  }
  
  return res.status(statusCode).json(response);
};

module.exports = { ApiResponse, apiResponse };
