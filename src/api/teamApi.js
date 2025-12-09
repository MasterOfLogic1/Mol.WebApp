import { API_BASE_URL } from '../config/api';

/**
 * Get authentication token from localStorage
 * @returns {string|null} Access token or null
 */
const getAuthToken = () => {
  return localStorage.getItem('accessToken');
};

/**
 * Get headers with authentication if token is available
 * @returns {Object} Headers object
 */
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Get list of team members (public endpoint)
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.page_size - Items per page (default: 10)
 * @returns {Promise<Object>} Response with team members
 */
export const getTeamMembers = async (params = {}) => {
  const { page = 1, page_size = 10 } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    page_size: page_size.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/team/?${queryParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch team members' }));
    throw new Error(error.message || error.detail || 'Failed to fetch team members');
  }

  return await response.json();
};

/**
 * Create a new team member
 * Requires authentication and admin role.
 * @param {Object} memberData - Team member data
 * @param {string} memberData.full_name - Full name (required)
 * @param {string} [memberData.occupation] - Occupation (optional)
 * @param {string} [memberData.bio] - Bio (optional)
 * @param {string} [memberData.avatar_url] - Avatar URL (optional)
 * @param {string} [memberData.email_url] - Email URL (optional)
 * @param {string} [memberData.linkedin_url] - LinkedIn URL (optional)
 * @returns {Promise<Object>} Response data
 */
export const createTeamMember = async (memberData) => {
  const response = await fetch(`${API_BASE_URL}/team/create/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(memberData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create team member' }));
    throw new Error(error.message || error.detail || 'Failed to create team member');
  }

  return await response.json();
};

/**
 * Update an existing team member
 * Requires authentication and admin role.
 * @param {number} memberId - Team member ID
 * @param {Object} memberData - Team member data
 * @param {string} [memberData.full_name] - Full name
 * @param {string} [memberData.occupation] - Occupation
 * @param {string} [memberData.bio] - Bio
 * @param {string} [memberData.avatar_url] - Avatar URL
 * @param {string} [memberData.email_url] - Email URL
 * @param {string} [memberData.linkedin_url] - LinkedIn URL
 * @returns {Promise<Object>} Response data
 */
export const updateTeamMember = async (memberId, memberData) => {
  const response = await fetch(`${API_BASE_URL}/team/${memberId}/update/`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(memberData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update team member' }));
    throw new Error(error.message || error.detail || 'Failed to update team member');
  }

  return await response.json();
};

/**
 * Delete a team member
 * Requires authentication and admin role.
 * @param {number} memberId - Team member ID
 * @returns {Promise<Object>} Response data
 */
export const deleteTeamMember = async (memberId) => {
  const response = await fetch(`${API_BASE_URL}/team/${memberId}/delete/`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete team member' }));
    throw new Error(error.message || error.detail || 'Failed to delete team member');
  }

  return await response.json().catch(() => ({ success: true }));
};

