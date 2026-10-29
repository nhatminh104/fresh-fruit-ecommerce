import Wishlist from './wishlist.model.js'; export const getWishlist = (userId) => Wishlist.findOne({ user: userId }).populate('products').lean();
