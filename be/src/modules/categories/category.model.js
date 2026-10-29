import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, slug: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ },
  description: { type: String, trim: true }, image: String, isActive: { type: Boolean, default: true, index: true }
}, { timestamps: true, collection: 'categories' });
export default mongoose.model('Category', schema);
