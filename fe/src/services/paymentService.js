import api from './api';
export const createPayment = (payload) => api.post('/payments', payload);
