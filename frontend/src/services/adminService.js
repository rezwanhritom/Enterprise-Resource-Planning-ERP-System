import api from './api.js';

export const getAllUsers = async () => {
  const response = await api.get('/admin/all-users');
  return response.data?.data ?? [];
};
