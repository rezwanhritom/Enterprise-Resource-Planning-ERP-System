import api from './api.js';

export const createRequest = async (payload) => {
  const response = await api.post('/procurement', payload);
  return response.data?.data;
};

export const getRequests = async (params = {}) => {
  const response = await api.get('/procurement', { params });
  return response.data?.data ?? [];
};

export const approveRequest = async (id) => {
  const response = await api.put(`/procurement/${id}/approve`);
  return response.data?.data;
};

export const rejectRequest = async (id, payload = {}) => {
  const response = await api.put(`/procurement/${id}/reject`, payload);
  return response.data?.data;
};
