import api from './api';
export const getOrders = () => api.get('/orders');
export const createOrder = (payload) => api.post('/orders', payload);
