import Address from './address.model.js';
export const listAddresses = (userId) => Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 }).lean();
export async function createAddress(data) { if (data.isDefault) await Address.updateMany({ user: data.user }, { $set: { isDefault: false } }); return Address.create(data); }
export async function updateAddress(userId, addressId, data) { const address = await Address.findOne({ _id: addressId, user: userId }); if (!address) return null; if (data.isDefault) await Address.updateMany({ user: userId, _id: { $ne: addressId } }, { $set: { isDefault: false } }); Object.assign(address, data); await address.save(); return address; }
export const deleteAddress = (userId, addressId) => Address.findOneAndDelete({ user: userId, _id: addressId });
