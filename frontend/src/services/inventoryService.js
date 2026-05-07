import api from './api.js';

export const addItem = async (payload) => {
  const response = await api.post('/inventory', payload);
  return response.data?.data;
};

export const updateStock = async (id, payload) => {
  const response = await api.put(`/inventory/${id}`, payload);
  return response.data?.data;
};

export const getItems = async (params = {}) => {
  const response = await api.get('/inventory', { params });
  return response.data?.data ?? [];
};

export const getInventorySummary = async () => {
  const response = await api.get('/inventory/summary');
  return response.data?.data;
};
