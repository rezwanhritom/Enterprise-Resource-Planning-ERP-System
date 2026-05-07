import api from './api.js';

export const addNote = async (payload) => {
  const response = await api.post('/performance', payload);
  return response.data?.data;
};

export const getEmployeeNotes = async (params = {}) => {
  const response = await api.get('/performance', { params });
  return response.data?.data ?? [];
};
