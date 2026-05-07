import api from './api.js';

export const getDepartments = async () => {
  const response = await api.get('/departments');
  return response.data?.data ?? [];
};

export const createDepartment = async (payload) => {
  const response = await api.post('/departments', payload);
  return response.data;
};

export const updateDepartment = async (id, payload) => {
  const response = await api.put(`/departments/${id}`, payload);
  return response.data;
};

export const deleteDepartment = async (id) => {
  const response = await api.delete(`/departments/${id}`);
  return response.data;
};
