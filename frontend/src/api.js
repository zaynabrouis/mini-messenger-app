/**
 * API Utility
 * Wrapper for fetch requests with JWT token authentication
 * Automatically includes Authorization header with token from localStorage
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Get JWT token from localStorage
 * @returns {string|null} The JWT token or null if not found
 */
const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/auth/login')
 * @param {Object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<Response>} Fetch response
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
};

/**
 * GET request helper
 * @param {string} endpoint - API endpoint
 * @returns {Promise<Object>} Parsed JSON response
 */
export const get = async (endpoint) => {
  const response = await apiRequest(endpoint, { method: 'GET' });
  return response.json();
};

/**
 * POST request helper
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body data
 * @returns {Promise<Object>} Parsed JSON response
 */
export const post = async (endpoint, data) => {
  const response = await apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
};

/**
 * PUT request helper
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body data
 * @returns {Promise<Object>} Parsed JSON response
 */
export const put = async (endpoint, data) => {
  const response = await apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.json();
};

/**
 * DELETE request helper
 * @param {string} endpoint - API endpoint
 * @returns {Promise<Object>} Parsed JSON response
 */
export const del = async (endpoint) => {
  const response = await apiRequest(endpoint, { method: 'DELETE' });
  return response.json();
};

export default {
  get,
  post,
  put,
  delete: del,
  getToken,
};

