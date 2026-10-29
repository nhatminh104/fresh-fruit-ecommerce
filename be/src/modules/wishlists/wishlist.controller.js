import { getWishlist } from './wishlist.service.js'; export async function listController(req, res) { res.json({ success: true, data: await getWishlist(req.user.id) }); }
