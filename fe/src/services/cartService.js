import api from './api';
export const getCart = () => api.get('/carts');
export const addCartItem = (payload) => api.post('/carts/items', payload);
export const updateCartItem = (payload) => api.patch('/carts/items', payload);
export const removeCartItem = (productId) => api.delete(`/carts/items/${productId}`);
export const clearCart = () => api.delete('/carts');
