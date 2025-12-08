import { API_BASE_URL } from '../config/api';

/**
 * Get authentication token from localStorage
 * @returns {string|null} Access token or null
 */
const getAuthToken = () => {
  return localStorage.getItem('accessToken');
};

/**
 * Fetches user statistics for admin dashboard.
 * Requires authentication and admin role.
 * @returns {Promise<Object>} User statistics including total_users, active_users, inactive_users, verified_users
 */
export const getUserStatistics = async () => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/admin/users/statistics/`, {
    method: 'GET',
    headers: headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch user statistics' }));
    throw new Error(error.message || error.detail || 'Failed to fetch user statistics');
  }

  return await response.json();
};

/**
 * Fetches a paginated list of all users.
 * Requires authentication and admin role.
 * @param {Object} [params] - Optional query parameters.
 * @param {number} [params.page] - The page number to fetch.
 * @param {number} [params.page_size] - The number of users per page.
 * @returns {Promise<Object>} A paginated list of users.
 */
export const getUsers = async (params = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE_URL}/admin/users/?${query}`, {
    method: 'GET',
    headers: headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch users' }));
    throw new Error(error.message || error.detail || 'Failed to fetch users');
  }

  return await response.json();
};

/**
 * Gets a user by email or user ID.
 * Requires authentication and admin role.
 * @param {Object} [params] - Query parameters.
 * @param {string} [params.email] - User email address.
 * @param {number} [params.user_id] - User ID.
 * @returns {Promise<Object>} User data.
 */
export const getUser = async (params = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE_URL}/admin/users/get/?${query}`, {
    method: 'GET',
    headers: headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch user' }));
    throw new Error(error.message || error.detail || 'Failed to fetch user');
  }

  return await response.json();
};

/**
 * Blocks or unblocks a user.
 * Requires authentication and admin role.
 * @param {number} userId - The ID of the user to block/unblock.
 * @param {boolean} isActive - Whether the user should be active (true) or blocked (false).
 * @returns {Promise<Object>} Updated user data.
 */
export const blockUser = async (userId, isActive) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/block/`, {
    method: 'PUT',
    headers: headers,
    body: JSON.stringify({ is_active: isActive }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update user status' }));
    throw new Error(error.message || error.detail || 'Failed to update user status');
  }

  return await response.json();
};

/**
 * Updates a user's password.
 * Requires authentication and admin role.
 * @param {number} userId - The ID of the user whose password to update.
 * @param {string} password - The new password.
 * @returns {Promise<Object>} Success message or updated user data.
 */
export const updateUserPassword = async (userId, password) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/password/`, {
    method: 'PUT',
    headers: headers,
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update password' }));
    throw new Error(error.message || error.detail || 'Failed to update password');
  }

  return await response.json();
};

