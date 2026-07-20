/**
 * API Error Handling Utilities
 *
 * Provides standardized error handling patterns for API calls
 * Ensures consistency with BASELINE.md API Response Contract
 *
 * @module helpers/apiUtils
 */

/**
 * Normalizes error message from various error sources
 * Follows the standard API response contract where message is always a string
 *
 * @param {Error|Object|string} error - Error object from catch block
 * @param {string} [fallbackMessage="An error occurred"] - Default message if extraction fails
 * @returns {string} - Normalized error message
 *
 * @example
 * try {
 *   await apiCall();
 * } catch (err) {
 *   const message = normalizeErrorMessage(err, "Failed to load data");
 *   setError(message);
 * }
 */
export const normalizeErrorMessage = (error, fallbackMessage = "An error occurred") => {
  // Already a string message
  if (typeof error === "string") {
    return error || fallbackMessage;
  }

  // Axios error with response data
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // Standard Error with message property
  if (error?.message) {
    return error.message;
  }

  // Object with message property
  if (error?.data?.message) {
    return error.data.message;
  }

  // Fallback to default
  return fallbackMessage;
};

/**
 * Validates API response following BASELINE.md response contract
 * Checks for required fields: success and message
 *
 * @param {Object} response - Response object from API
 * @returns {Object} - { isValid: boolean, message: string, data: any }
 *
 * @example
 * const { isValid, message, data } = validateApiResponse(response.data);
 * if (!isValid) {
 *   console.error(message); // Use API's error message
 * }
 */
export const validateApiResponse = (response) => {
  if (!response) {
    return {
      isValid: false,
      message: "No response received from server",
      data: null,
    };
  }

  // Check required fields per BASELINE response contract
  if (typeof response.success !== "boolean") {
    return {
      isValid: false,
      message: "Invalid response format: missing 'success' field",
      data: null,
    };
  }

  if (typeof response.message !== "string") {
    return {
      isValid: false,
      message: "Invalid response format: missing 'message' field",
      data: null,
    };
  }

  return {
    isValid: true,
    message: response.message,
    data: response.result || null,
  };
};

/**
 * Handles API response following BASELINE pattern
 * Use this in hooks to consistently handle success/error responses
 *
 * @param {Object} response - API response data (response.data)
 * @returns {Object} - { success: boolean, message: string, data: any }
 *
 * @example
 * // In a hook
 * const response = await getCompanies();
 * const { success, message, data } = handleApiResponse(response);
 *
 * if (!success) {
 *   setError(message);
 *   return;
 * }
 *
 * setCompanies(data);
 */
export const handleApiResponse = (response) => {
  const validation = validateApiResponse(response);

  if (!validation.isValid) {
    return {
      success: false,
      message: validation.message,
      data: null,
    };
  }

  return {
    success: response.success,
    message: response.message,
    data: response.result || null,
  };
};

/**
 * Extracts HTTP status code from various error types
 * Useful for distinguishing error types (401, 404, 500, etc.)
 *
 * @param {Error|Object} error - Error object
 * @returns {number|null} - HTTP status code or null if not available
 *
 * @example
 * try {
 *   await apiCall();
 * } catch (err) {
 *   const statusCode = getErrorStatusCode(err);
 *   if (statusCode === 401) {
 *     // Handle unauthorized
 *   }
 * }
 */
export const getErrorStatusCode = (error) => {
  return error?.response?.status ?? null;
};

/**
 * Checks if error is an authentication error (401)
 * Useful for triggering logout or redirect to login
 *
 * @param {Error|Object} error - Error object
 * @returns {boolean}
 *
 * @example
 * if (isAuthError(error)) {
 *   // Redirect to login or clear auth state
 * }
 */
export const isAuthError = (error) => {
  return getErrorStatusCode(error) === 401;
};

/**
 * Checks if error is a validation error (400)
 * Useful for showing field-specific validation messages
 *
 * @param {Error|Object} error - Error object
 * @returns {boolean}
 */
export const isValidationError = (error) => {
  return getErrorStatusCode(error) === 400;
};

/**
 * Checks if error is a server error (5xx)
 * Useful for showing generic "try again later" messages
 *
 * @param {Error|Object} error - Error object
 * @returns {boolean}
 */
export const isServerError = (error) => {
  const statusCode = getErrorStatusCode(error);
  return statusCode !== null && statusCode >= 500;
};
