import api from './api.js';

export const listAnnouncements = async () => {
  const response = await api.get('/announcements');
  return response.data?.data ?? [];
};

export const createAnnouncement = async (payload) => {
  const response = await api.post('/announcements', payload);
  return response.data?.data;
};

export const deleteAnnouncement = async (id) => {
  const response = await api.delete(`/announcements/${id}`);
  return response.data?.data;
};
