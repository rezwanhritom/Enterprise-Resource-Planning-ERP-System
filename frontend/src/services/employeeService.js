import api from './api.js';

export const getProfile = async () => {
  const response = await api.get('/employees/profile');
  return response.data?.data;
};

export const updateProfile = async (payload) => {
  const response = await api.put('/employees/profile', payload);
  return response.data?.data;
};

export const getAllEmployees = async () => {
  const response = await api.get('/employees/all');
  return response.data?.data ?? [];
};
