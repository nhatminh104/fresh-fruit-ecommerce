import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 160 }, slug: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ },
  description: { type: String, trim: true }, category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  price: { type: Number, required: true, min: 0 }, originalPrice: { type: Number, min: 0 }, unit: { type: String, required: true, trim: true },
  origin: { type: String, required: true, trim: true }, images: { type: [String], default: [] },
  stock: { type: Number, required: true, min: 0, integer: true, default: 0 }, soldCount: { type: Number, min: 0, integer: true, default: 0 },
  isFeatured: { type: Boolean, default: false }, isActive: { type: Boolean, default: true, index: true }
}, { timestamps: true, collection: 'products' });
productSchema.path('stock').validate(Number.isInteger, 'Stock must be an integer');
productSchema.path('soldCount').validate(Number.isInteger, 'Sold count must be an integer');
productSchema.virtual('image').get(function () { return this.images?.[0]; });
productSchema.set('toJSON', { virtuals: true });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, price: 1, isActive: 1 });
export default mongoose.model('Product', productSchema);
