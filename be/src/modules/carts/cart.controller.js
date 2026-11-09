import { addItem, clearCart, getCart, removeItem, updateItem } from './cart.service.js'; import { asyncHandler } from '../../utils/asyncHandler.js';

export const getCartController = asyncHandler(async (req, res) => res.json({ success: true, data: await getCart(req.user.id) }));
export const addItemController = asyncHandler(async (req, res) => res.status(201).json({ success: true, data: await addItem(req.user.id, req.body?.product, req.body?.quantity) }));
export const updateItemController = asyncHandler(async (req, res) => res.json({ success: true, data: await updateItem(req.user.id, req.body?.product, req.body?.quantity) }));
export const removeItemController = asyncHandler(async (req, res) => res.json({ success: true, data: await removeItem(req.user.id, req.params.productId) }));
export const clearCartController = asyncHandler(async (req, res) => res.json({ success: true, data: await clearCart(req.user.id) }));
