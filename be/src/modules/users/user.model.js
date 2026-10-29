import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  password: { type: String, required: true, select: false },
  phone: { type: String, trim: true },
  avatar: String,
  role: { type: String, enum: ['customer', 'admin'], default: 'customer', index: true },
  status: { type: String, enum: ['active', 'inactive', 'blocked'], default: 'active', index: true }
}, { timestamps: true, collection: 'users' });

userSchema.virtual('name').get(function () { return this.fullName; });
userSchema.set('toJSON', { virtuals: true, transform: (_, ret) => { delete ret.password; return ret; } });
export default mongoose.model('User', userSchema);
