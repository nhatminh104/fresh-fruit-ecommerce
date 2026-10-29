import mongoose from 'mongoose';
const schema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, rating: { type: Number, required: true, min: 1, max: 5, validate: Number.isInteger }, comment: { type: String, trim: true, maxlength: 1000 }, isApproved: { type: Boolean, default: true } }, { timestamps: true, collection: 'reviews' });
schema.index({ product: 1, createdAt: -1 });
export default mongoose.model('Review', schema);
