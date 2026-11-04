import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  refreshTokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  revokedAt: Date,
  userAgent: { type: String, trim: true, maxlength: 255 },
  ip: { type: String, trim: true, maxlength: 64 }
}, { timestamps: true, collection: 'auth_sessions' });

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
sessionSchema.index({ user: 1, revokedAt: 1 });

export default mongoose.model('AuthSession', sessionSchema);
