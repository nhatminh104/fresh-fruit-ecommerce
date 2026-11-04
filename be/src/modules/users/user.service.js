import User from './user.model.js';
import { ApiError } from '../../utils/ApiError.js';

export function toPublicUser(user) {
  if (!user) return null;
  const source = typeof user.toObject === 'function' ? user.toObject() : user;
  const id = source._id ?? source.id;
  return {
    id: id ? String(id) : undefined,
    fullName: source.fullName,
    name: source.fullName,
    email: source.email,
    phone: source.phone || '',
    avatar: source.avatar || '',
    role: source.role,
    status: source.status,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt
  };
}

export async function getProfile(userId) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  return toPublicUser(user);
}

export async function updateProfile(userId, payload = {}) {
  const updates = {};
  if (payload.fullName !== undefined) updates.fullName = payload.fullName.trim();
  if (payload.phone !== undefined) updates.phone = String(payload.phone).trim();

  const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true });
  if (!user) throw new ApiError(404, 'User not found');
  return toPublicUser(user);
}
