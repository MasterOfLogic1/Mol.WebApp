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
 * Create a new blog post
 * @param {Object} postData - Blog post data
 * @param {string} postData.title - Post title
 * @param {string} postData.description - Post description
 * @param {string} postData.body - Post body/content
 * @param {string[]} postData.tag_names - Array of tag names
 * @param {File} postData.thumbnail - Thumbnail image file (optional)
 * @returns {Promise<Object>} Response data
 */
export const createBlogPost = async (postData) => {
  const formData = new FormData();
  formData.append('title', postData.title);
  formData.append('description', postData.description);
  formData.append('body', postData.body);
  
  // Append tag_names as JSON string or individual items
  if (postData.tag_names && Array.isArray(postData.tag_names)) {
    postData.tag_names.forEach((tag, index) => {
      formData.append(`tag_names`, tag);
    });
  }
  
  // Append thumbnail file if provided
  if (postData.thumbnail) {
    formData.append('thumbnail', postData.thumbnail);
  }

  const token = getAuthToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  // Don't set Content-Type for FormData, browser will set it with boundary

  const response = await fetch(`${API_BASE_URL}/blog/create/`, {
    method: 'POST',
    headers: headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create blog post' }));
    throw new Error(error.message || error.detail || 'Failed to create blog post');
  }

  return await response.json();
};

/**
 * Update an existing blog post
 * @param {number} postId - Blog post ID
 * @param {Object} postData - Blog post data
 * @param {string} postData.title - Post title
 * @param {string} postData.description - Post description
 * @param {string} postData.body - Post body/content
 * @param {string[]} postData.tag_names - Array of tag names
 * @param {File} postData.thumbnail - Thumbnail image file (optional)
 * @returns {Promise<Object>} Response data
 */
export const updateBlogPost = async (postId, postData) => {
  const formData = new FormData();
  formData.append('title', postData.title);
  formData.append('description', postData.description);
  formData.append('body', postData.body);
  
  // Append tag_names as JSON string or individual items
  if (postData.tag_names && Array.isArray(postData.tag_names)) {
    postData.tag_names.forEach((tag, index) => {
      formData.append(`tag_names`, tag);
    });
  }
  
  // Append thumbnail file if provided
  if (postData.thumbnail) {
    formData.append('thumbnail', postData.thumbnail);
  }

  const token = getAuthToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  // Don't set Content-Type for FormData, browser will set it with boundary

  const response = await fetch(`${API_BASE_URL}/blog/${postId}/update/`, {
    method: 'PUT',
    headers: headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update blog post' }));
    throw new Error(error.message || error.detail || 'Failed to update blog post');
  }

  return await response.json();
};

/**
 * Delete a blog post
 * @param {number} postId - Blog post ID
 * @returns {Promise<Object>} Response data
 */
export const deleteBlogPost = async (postId) => {
  const response = await fetch(`${API_BASE_URL}/blog/${postId}/delete/`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete blog post' }));
    throw new Error(error.message || error.detail || 'Failed to delete blog post');
  }

  // DELETE requests might not return JSON
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return { success: true };
  }

  return await response.json().catch(() => ({ success: true }));
};

/**
 * Get list of blog posts (public endpoint)
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.page_size - Items per page (default: 10)
 * @returns {Promise<Object>} Response with blog posts
 */
export const getBlogPosts = async (params = {}) => {
  const { page = 1, page_size = 10 } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    page_size: page_size.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/blog/?${queryParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch blog posts' }));
    throw new Error(error.message || error.detail || 'Failed to fetch blog posts');
  }

  return await response.json();
};

/**
 * Get a single blog post by ID (if endpoint exists)
 * @param {number} postId - Blog post ID
 * @returns {Promise<Object>} Blog post data
 */
export const getBlogPost = async (postId) => {
  const response = await fetch(`${API_BASE_URL}/blog/${postId}/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch blog post' }));
    throw new Error(error.message || error.detail || 'Failed to fetch blog post');
  }

  return await response.json();
};

