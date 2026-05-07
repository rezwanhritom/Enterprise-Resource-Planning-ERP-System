import api from './api.js';

export const generatePayroll = async (payload) => {
  const response = await api.post('/payroll/generate', payload);
  return response.data?.data;
};

export const getMyPayrolls = async (params = {}) => {
  const response = await api.get('/payroll/me', { params });
  return response.data?.data ?? [];
};

export const getAllPayrolls = async (params = {}) => {
  const response = await api.get('/payroll/all', { params });
  return response.data?.data ?? [];
};
