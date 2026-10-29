import { createPayment } from './payment.service.js'; export async function createController(req, res) { res.status(201).json({ success: true, data: await createPayment(req.body) }); }
