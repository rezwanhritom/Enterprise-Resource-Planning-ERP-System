import api from './api.js';

export const createLeaveRequest = async (payload) => {
  const response = await api.post('/leave', payload);
  return response.data?.data;
};

export const getMyLeaveRequests = async () => {
  const response = await api.get('/leave/me');
  return response.data?.data ?? [];
};

export const getCompanyLeaveRequests = async (params = {}) => {
  const response = await api.get('/leave/company', { params });
  return response.data?.data ?? [];
};

export const reviewLeaveRequest = async (id, payload) => {
  const response = await api.patch(`/leave/${id}/review`, payload);
  return response.data?.data;
};
