import api from './api.js';

export const addExpense = async (payload) => {
  const response = await api.post('/finance/expense', payload);
  return response.data?.data;
};

export const addRevenue = async (payload) => {
  const response = await api.post('/finance/revenue', payload);
  return response.data?.data;
};

export const getReports = async (params = {}) => {
  const response = await api.get('/finance/reports', { params });
  return response.data?.data;
};

export const getTransactions = async (params = {}) => {
  const response = await api.get('/finance/transactions', { params });
  return response.data?.data ?? [];
};
