import { listAddresses, createAddress, updateAddress, deleteAddress } from './address.service.js';
export async function listController(req, res) { res.json({ success: true, data: await listAddresses(req.user.id) }); }
export async function createController(req, res) { res.status(201).json({ success: true, data: await createAddress({ ...req.body, user: req.user.id }) }); }
export async function updateController(req, res) { const address = await updateAddress(req.user.id, req.params.id, req.body); if (!address) return res.status(404).json({ success: false, message: 'Address not found' }); res.json({ success: true, data: address }); }
export async function deleteController(req, res) { const address = await deleteAddress(req.user.id, req.params.id); if (!address) return res.status(404).json({ success: false, message: 'Address not found' }); res.json({ success: true, data: { deleted: true } }); }
