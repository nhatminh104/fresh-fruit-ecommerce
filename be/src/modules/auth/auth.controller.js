import { login } from './auth.service.js';
export async function loginController(req, res) { res.json({ success: true, data: await login(req.body) }); }
