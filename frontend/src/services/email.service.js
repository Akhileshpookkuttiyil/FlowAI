import { api } from '../api/axiosInstance';

export const sendEmail = async (data) => {
  const response = await api.post('/send-email', data, {
    timeout: 9500
  });
  return response.data;
};
