import { API_BASE_URL } from '../config/api';

/**
 * Get authentication token from localStorage
 * @returns {string|null} Access token or null
 */
const getAuthToken = () => {
  return localStorage.getItem('accessToken');
};

/**
 * Creates a new course.
 * Requires authentication.
 * @param {Object} courseData - The data for the new course.
 * @param {string} courseData.title - The title of the course (required).
 * @param {string} [courseData.description] - A brief description of the course.
 * @param {string} [courseData.url] - The URL of the course (e.g., YouTube playlist link).
 * @param {File} [courseData.thumbnail] - Thumbnail image file for the course.
 * @returns {Promise<Object>} The created course data.
 */
export const createCourse = async (courseData) => {
  const formData = new FormData();
  formData.append('title', courseData.title);
  
  if (courseData.description) {
    formData.append('description', courseData.description);
  }
  
  if (courseData.url) {
    formData.append('url', courseData.url);
  }
  
  // Append thumbnail file if provided
  if (courseData.thumbnail) {
    formData.append('thumbnail', courseData.thumbnail);
  }

  const token = getAuthToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  // Don't set Content-Type for FormData, browser will set it with boundary

  const response = await fetch(`${API_BASE_URL}/course/create/`, {
    method: 'POST',
    headers: headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create course' }));
    throw new Error(error.message || error.detail || 'Failed to create course');
  }

  return await response.json();
};

/**
 * Updates an existing course.
 * Requires authentication.
 * @param {number} courseId - The ID of the course to update.
 * @param {Object} courseData - The updated data for the course.
 * @param {string} [courseData.title] - The new title of the course.
 * @param {string} [courseData.description] - The new description of the course.
 * @param {string} [courseData.url] - The new URL of the course.
 * @param {File} [courseData.thumbnail] - The new thumbnail image file for the course.
 * @returns {Promise<Object>} The updated course data.
 */
export const updateCourse = async (courseId, courseData) => {
  const formData = new FormData();
  
  if (courseData.title) {
    formData.append('title', courseData.title);
  }
  
  if (courseData.description !== undefined) {
    formData.append('description', courseData.description || '');
  }
  
  if (courseData.url !== undefined) {
    formData.append('url', courseData.url || '');
  }
  
  // Append thumbnail file if provided
  if (courseData.thumbnail) {
    formData.append('thumbnail', courseData.thumbnail);
  }

  const token = getAuthToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  // Don't set Content-Type for FormData, browser will set it with boundary

  const response = await fetch(`${API_BASE_URL}/course/${courseId}/update/`, {
    method: 'PUT',
    headers: headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update course' }));
    throw new Error(error.message || error.detail || 'Failed to update course');
  }

  return await response.json();
};

/**
 * Deletes a course.
 * Requires authentication.
 * @param {number} courseId - The ID of the course to delete.
 * @returns {Promise<Object>} A success message or confirmation.
 */
export const deleteCourse = async (courseId) => {
  const token = getAuthToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/course/${courseId}/delete/`, {
    method: 'DELETE',
    headers: headers,
  });

  // DELETE might not return JSON, check status
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to delete course' }));
    throw new Error(errorData.detail || errorData.message || 'Failed to delete course');
  }
  
  // Try to parse JSON, but if it's empty, return success message
  try {
    return await response.json();
  } catch {
    return { message: 'Course deleted successfully' };
  }
};

/**
 * Fetches a list of courses.
 * Public access.
 * @param {Object} [params] - Optional query parameters.
 * @param {number} [params.page] - The page number to fetch.
 * @param {number} [params.page_size] - The number of courses per page.
 * @returns {Promise<Object>} A paginated list of courses.
 */
export const getCourses = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE_URL}/course/?${query}`);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch courses' }));
    throw new Error(error.message || error.detail || 'Failed to fetch courses');
  }
  
  return await response.json();
};

/**
 * Fetches a single course by ID.
 * Public access.
 * @param {number} courseId - The ID of the course to fetch.
 * @returns {Promise<Object>} The course data.
 */
export const getCourse = async (courseId) => {
  const response = await fetch(`${API_BASE_URL}/course/${courseId}/`);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch course' }));
    throw new Error(error.message || error.detail || 'Failed to fetch course');
  }
  
  return await response.json();
};

