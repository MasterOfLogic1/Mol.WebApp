import { API_BASE_URL } from '../config/api';

/**
 * Get authentication token from localStorage
 * @returns {string|null} Access token or null
 */
const getAuthToken = () => {
  return localStorage.getItem('accessToken');
};

/**
 * Fetches the authenticated user's profile.
 * Requires authentication.
 * @returns {Promise<Object>} User profile data.
 */
export const getUserProfile = async () => {
  const token = getAuthToken();
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/user-profile/user/profile/`, {
    method: 'GET',
    headers: headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch profile' }));
    throw new Error(error.message || error.detail || 'Failed to fetch profile');
  }

  return await response.json();
};

/**
 * Creates the authenticated user's profile.
 * Requires authentication.
 * @param {Object} profileData - Profile data
 * @param {string} profileData.firstname - First name (required)
 * @param {string} profileData.lastname - Last name (required)
 * @param {string} [profileData.middlename] - Middle name (optional)
 * @param {string} [profileData.phonenumber] - Phone number (optional)
 * @param {string} [profileData.occupation] - Occupation (optional)
 * @param {string} [profileData.bio] - Bio (optional)
 * @param {File} [profileData.thumbnail] - Profile picture file (optional)
 * @returns {Promise<Object>} Created profile data.
 */
export const createUserProfile = async (profileData) => {
  const formData = new FormData();
  formData.append('firstname', profileData.firstname);
  formData.append('lastname', profileData.lastname);
  
  if (profileData.middlename) {
    formData.append('middlename', profileData.middlename);
  }
  
  if (profileData.phonenumber) {
    formData.append('phonenumber', profileData.phonenumber);
  }
  
  if (profileData.occupation) {
    formData.append('occupation', profileData.occupation);
  }
  
  if (profileData.bio) {
    formData.append('bio', profileData.bio);
  }
  
  if (profileData.thumbnail) {
    formData.append('thumbnail', profileData.thumbnail);
  }

  const token = getAuthToken();
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/user-profile/user/profile/`, {
    method: 'POST',
    headers: headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create profile' }));
    throw new Error(error.message || error.detail || 'Failed to create profile');
  }

  return await response.json();
};

/**
 * Updates the authenticated user's profile.
 * Requires authentication.
 * @param {Object} profileData - Profile data
 * @param {string} profileData.firstname - First name (required)
 * @param {string} profileData.lastname - Last name (required)
 * @param {string} [profileData.middlename] - Middle name (optional)
 * @param {string} [profileData.phonenumber] - Phone number (optional)
 * @param {string} [profileData.occupation] - Occupation (optional)
 * @param {string} [profileData.bio] - Bio (optional)
 * @param {File} [profileData.thumbnail] - Profile picture file (optional)
 * @returns {Promise<Object>} Updated profile data.
 */
export const updateUserProfile = async (profileData) => {
  const formData = new FormData();
  formData.append('firstname', profileData.firstname);
  formData.append('lastname', profileData.lastname);
  
  if (profileData.middlename !== undefined) {
    formData.append('middlename', profileData.middlename || '');
  }
  
  if (profileData.phonenumber !== undefined) {
    formData.append('phonenumber', profileData.phonenumber || '');
  }
  
  if (profileData.occupation !== undefined) {
    formData.append('occupation', profileData.occupation || '');
  }
  
  if (profileData.bio !== undefined) {
    formData.append('bio', profileData.bio || '');
  }
  
  if (profileData.thumbnail) {
    formData.append('thumbnail', profileData.thumbnail);
  }

  const token = getAuthToken();
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/user-profile/user/profile/`, {
    method: 'PUT',
    headers: headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update profile' }));
    throw new Error(error.message || error.detail || 'Failed to update profile');
  }

  return await response.json();
};

/**
 * Changes the authenticated user's password.
 * Requires authentication.
 * @param {Object} passwordData - Password change data
 * @param {string} passwordData.current_password - Current password
 * @param {string} passwordData.new_password - New password
 * @param {string} passwordData.confirm_new_password - Confirm new password
 * @returns {Promise<Object>} Success message.
 */
export const changePassword = async (passwordData) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/accounts/user/change-password/`, {
    method: 'PUT',
    headers: headers,
    body: JSON.stringify(passwordData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to change password' }));
    throw new Error(error.message || error.detail || 'Failed to change password');
  }

  return await response.json();
};

