import api from './api.js';

export const markAttendance = async (payload = {}) => {
  const response = await api.post('/attendance/mark', payload);
  return response.data?.data;
};

export const getMyAttendance = async (params = {}) => {
  const response = await api.get('/attendance/me', { params });
  return response.data?.data ?? [];
};

export const getAllAttendance = async () => {
  const response = await api.get('/attendance/all');
  return response.data?.data ?? [];
};
