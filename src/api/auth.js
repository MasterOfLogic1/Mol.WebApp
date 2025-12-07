import { API_BASE_URL } from '../config/api';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.firstname - User first name
 * @param {string} userData.lastname - User last name
 * @param {string} userData.middlename - User middle name (optional)
 * @param {string} userData.phonenumber - User phone number
 * @returns {Promise<Object>} Response data
 */
export const register = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/accounts/auth/register/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Registration failed' }));
    throw new Error(error.message || error.detail || 'Registration failed');
  }

  return await response.json();
};

/**
 * Login user and get access token
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Response with accessToken
 */
export const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/accounts/auth/token/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(error.message || error.detail || 'Login failed');
  }

  return await response.json();
};

/**
 * Verify user account with verification token
 * @param {string} verificationToken - Verification token from email
 * @returns {Promise<Object>} Response data
 */
export const verifyAccount = async (verificationToken) => {
  const response = await fetch(`${API_BASE_URL}/accounts/verify/${verificationToken}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Verification failed' }));
    throw new Error(error.message || error.detail || 'Verification failed');
  }

  return await response.json();
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise<Object>} Response data
 */
export const sendPasswordResetEmail = async (email) => {
  const response = await fetch(`${API_BASE_URL}/accounts/send-password-reset-email/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to send reset email' }));
    throw new Error(error.message || error.detail || 'Failed to send reset email');
  }

  return await response.json();
};

/**
 * Reset password with reset token
 * @param {string} resetToken - Reset token from email
 * @param {string} password - New password
 * @param {string} confirmPassword - Confirm new password
 * @returns {Promise<Object>} Response data
 */
export const resetPassword = async (resetToken, password, confirmPassword) => {
  const response = await fetch(`${API_BASE_URL}/accounts/reset-password/${resetToken}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password, confirm_password: confirmPassword }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Password reset failed' }));
    throw new Error(error.message || error.detail || 'Password reset failed');
  }

  return await response.json();
};

