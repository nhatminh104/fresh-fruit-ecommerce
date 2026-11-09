import api from './api';
export const getOrders = () => api.get('/orders');
export const getOrder = (id) => api.get(`/orders/${id}`);
export const createOrder = (payload) => api.post('/orders', payload);
