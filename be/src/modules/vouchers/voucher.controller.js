import { listVouchers } from './voucher.service.js'; export async function listController(req, res) { res.json({ success: true, data: await listVouchers() }); }
