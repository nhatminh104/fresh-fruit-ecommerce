import api from './api';
export const getReviews = (productId) => api.get(`/reviews/product/${productId}`);
export const createReview = (payload) => api.post('/reviews', payload);
export const getMyReviews = () => api.get('/reviews/mine');
