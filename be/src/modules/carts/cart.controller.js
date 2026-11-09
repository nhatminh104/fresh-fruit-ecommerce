import { addItem, clearCart, getCart, removeItem, updateItem } from './cart.service.js';

export async function getCartController(req, res) { res.json({ success: true, data: await getCart(req.user.id) }); }
export async function addItemController(req, res) { res.status(201).json({ success: true, data: await addItem(req.user.id, req.body?.product, req.body?.quantity) }); }
export async function updateItemController(req, res) { res.json({ success: true, data: await updateItem(req.user.id, req.body?.product, req.body?.quantity) }); }
export async function removeItemController(req, res) { res.json({ success: true, data: await removeItem(req.user.id, req.params.productId) }); }
export async function clearCartController(req, res) { res.json({ success: true, data: await clearCart(req.user.id) }); }
