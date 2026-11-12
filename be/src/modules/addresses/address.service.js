import Address from './address.model.js';

const WRITABLE_FIELDS = ['recipientName', 'phone', 'province', 'district', 'ward', 'streetAddress', 'isDefault'];
const pickWritable = (data = {}) => Object.fromEntries(WRITABLE_FIELDS.filter((field) => data[field] !== undefined).map((field) => [field, data[field]]));

export const listAddresses = (userId) => Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 }).lean();
export async function createAddress(data) { const payload = pickWritable(data); if (payload.isDefault) await Address.updateMany({ user: data.user }, { $set: { isDefault: false } }); return Address.create({ ...payload, user: data.user }); }
export async function updateAddress(userId, addressId, data) { const payload = pickWritable(data); const address = await Address.findOne({ _id: addressId, user: userId }); if (!address) return null; if (payload.isDefault) await Address.updateMany({ user: userId, _id: { $ne: addressId } }, { $set: { isDefault: false } }); Object.assign(address, payload); await address.save(); return address; }
export const deleteAddress = (userId, addressId) => Address.findOneAndDelete({ user: userId, _id: addressId });
