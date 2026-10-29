import api from './api';
export const getReviews = (productId) => api.get(`/products/${productId}/reviews`);
export const createReview = (payload) => api.post('/reviews', payload);
