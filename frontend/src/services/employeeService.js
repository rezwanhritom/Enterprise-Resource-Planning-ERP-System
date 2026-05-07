import api from './api.js';

export const getProfile = async () => {
  const response = await api.get('/employees/profile');
  return response.data?.data;
};

export const updateProfile = async (payload) => {
  const response = await api.put('/employees/profile', payload);
  return response.data?.data;
};

export const getAllEmployees = async (filters = {}) => {
  const params = {};

  if (filters.search?.trim()) {
    params.search = filters.search.trim();
  }

  if (filters.department?.trim()) {
    params.department = filters.department.trim();
  }

  if (filters.role?.trim()) {
    params.role = filters.role.trim();
  }

  const response = await api.get('/employees/all', { params });
  return response.data?.data ?? [];
};
