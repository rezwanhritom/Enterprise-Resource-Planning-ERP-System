import api from './api.js';

export const getAllUsers = async () => {
  const response = await api.get('/admin/all-users');
  return response.data?.data ?? [];
};

export const createUser = async (payload) => {
  const response = await api.post('/admin/create-user', payload);
  return response.data?.data;
};

export const updateCompanyUser = async (userId, payload) => {
  const response = await api.patch(`/admin/users/${userId}`, payload);
  return response.data?.data;
};

export const getCompanySettings = async () => {
  const response = await api.get('/admin/company');
  return response.data?.data;
};

export const updateCompanySettings = async (payload) => {
  const response = await api.patch('/admin/company', payload);
  return response.data?.data;
};
