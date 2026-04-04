import { api } from '../api/axiosInstance';

/**
 * Sends an email via the backend SMTP service.
 * @param {Object} data - { to, subject, message }
 * @returns {Promise}
 */
export const sendEmail = async (data) => {
  const response = await api.post('/send-email', data, {
    timeout: 9500 // Cut off slightly before Vercel kills it for better feedback
  });
  return response.data;
};
