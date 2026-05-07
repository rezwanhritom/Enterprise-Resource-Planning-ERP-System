import api from './api.js';

export const getDashboardSummary = async () => {
  const response = await api.get('/dashboard/summary');
  return response.data?.data;
};
