import { asyncHandler } from '../../utils/asyncHandler.js';
import { getProfile, updateProfile } from './user.service.js';

export const profileController = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await getProfile(req.user.id) });
});

export const updateProfileController = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await updateProfile(req.user.id, req.body) });
});
