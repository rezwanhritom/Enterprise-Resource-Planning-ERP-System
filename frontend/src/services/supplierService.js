import api from './api.js';

export const createSupplier = async (payload) => {
  const response = await api.post('/suppliers', payload);
  return response.data?.data;
};

export const getSuppliers = async () => {
  const response = await api.get('/suppliers');
  return response.data?.data ?? [];
};
