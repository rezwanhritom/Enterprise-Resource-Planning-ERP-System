import api from './api.js';

export const sendMessage = async (payload) => {
  const response = await api.post('/messages', payload);
  return response.data?.data;
};

export const getMessages = async (userId) => {
  const response = await api.get('/messages', {
    params: { userId },
  });
  return response.data?.data ?? [];
};

export const getInbox = async () => {
  const response = await api.get('/messages/inbox');
  return response.data?.data ?? [];
};
