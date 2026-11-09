import api from './api';
export const getWishlist = () => api.get('/wishlists');
export const addWishlistItem = (product) => api.post('/wishlists/items', { product });
export const removeWishlistItem = (productId) => api.delete(`/wishlists/items/${productId}`);
