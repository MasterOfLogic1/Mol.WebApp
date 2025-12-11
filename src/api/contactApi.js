import { API_BASE_URL } from '../config/api';

/**
 * Submit a general contact message.
 * Rate limited to one message per email every 7 days.
 * @param {Object} contactData - The contact form data.
 * @param {string} contactData.name - The sender's name (required).
 * @param {string} contactData.email - The sender's email (required).
 * @param {string} contactData.subject - The message subject (required).
 * @param {string} contactData.message - The message content (required).
 * @returns {Promise<Object>} Response with success message or error.
 */
export const submitContactForm = async (contactData) => {
  const response = await fetch(`${API_BASE_URL}/contact/general-contact/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contactData),
  });

  const data = await response.json().catch(() => ({ message: 'Failed to submit contact form' }));

  if (!response.ok) {
    // Handle rate limit (429) or other errors
    const error = new Error(data.error || data.message || 'Failed to submit contact form');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

