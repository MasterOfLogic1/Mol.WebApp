import { API_BASE_URL } from '../config/api';

/**
 * Register an email address for the newsletter.
 * A verification email will be sent.
 * @param {string} email - The email address to register (required).
 * @returns {Promise<Object>} Response with success message or error.
 */
export const registerNewsletter = async (email) => {
  const response = await fetch(`${API_BASE_URL}/newsletter/register/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json().catch(() => ({ message: 'Failed to register for newsletter' }));

  if (!response.ok) {
    const error = new Error(data.error || data.message || 'Failed to register for newsletter');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

