import api from './api.js';

export const getAuditLogs = async (filters = {}) => {
  const params = {};

  if (filters.action?.trim()) params.action = filters.action.trim();
  if (filters.module?.trim()) params.module = filters.module.trim();
  if (filters.userId?.trim()) params.userId = filters.userId.trim();

  const response = await api.get('/audit', { params });
  return response.data?.data ?? [];
};
