import Cart from './cart.model.js'; export const getCart = (userId) => Cart.findOne({ user: userId }).populate('items.product').lean();
