import api from './api';
export const getCart = () => api.get('/carts');
export const updateCart = (payload) => api.patch('/carts', payload);
