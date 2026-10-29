import { getCart } from './cart.service.js'; export async function getCartController(req, res) { res.json({ success: true, data: await getCart(req.user.id) }); }
