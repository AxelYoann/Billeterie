/**
 * Standardized response sender
 * Ensures consistent API response format across the application
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {boolean} success - Success flag
 * @param {string} message - Response message
 * @param {Object} data - Response data (optional)
 * @param {Array} errors - Validation errors (optional)
 */
const sendResponse = (res, statusCode, success, message, data = null, errors = null) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString()
  };

  if (data) {
    response.data = data;
  }

  if (errors) {
    response.errors = errors;
  }

  // Add pagination info if present in data
  if (data && data.pagination) {
    response.pagination = data.pagination;
    delete data.pagination;
  }

  return res.status(statusCode).json(response);
};

module.exports = sendResponse;