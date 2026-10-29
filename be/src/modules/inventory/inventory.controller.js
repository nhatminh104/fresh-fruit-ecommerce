import { listInventory } from './inventory.service.js'; export async function listController(req, res) { res.json({ success: true, data: await listInventory() }); }
