import { getProfile } from './user.service.js'; export async function profileController(req, res) { res.json({ success: true, data: await getProfile(req.user) }); }
