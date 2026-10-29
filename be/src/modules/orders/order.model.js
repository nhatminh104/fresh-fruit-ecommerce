import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({ recipientName: String, phone: String, province: String, district: String, ward: String, streetAddress: String }, { _id: false });
const itemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, productName: { type: String, required: true }, image: String,
  unit: { type: String, required: true }, price: { type: Number, required: true, min: 0 }, quantity: { type: Number, required: true, min: 1, validate: Number.isInteger }, subtotal: { type: Number, required: true, min: 0 }
}, { _id: false });
const schema = new mongoose.Schema({
  orderCode: { type: String, required: true, unique: true, index: true }, user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, items: { type: [itemSchema], required: true, validate: (v) => v.length > 0 },
  shippingAddress: { type: addressSchema, required: true }, subtotal: { type: Number, required: true, min: 0 }, discountAmount: { type: Number, min: 0, default: 0 }, shippingFee: { type: Number, min: 0, default: 0 }, totalAmount: { type: Number, required: true, min: 0 },
  voucher: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher' }, paymentMethod: { type: String, enum: ['cod', 'mock'], default: 'cod' }, paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  status: { type: String, enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'], default: 'pending', index: true }, note: { type: String, trim: true, maxlength: 500 }
}, { timestamps: true, collection: 'orders' });
schema.virtual('total').get(function () { return this.totalAmount; });
schema.set('toJSON', { virtuals: true });
schema.index({ user: 1, createdAt: -1 });
schema.statics.allowedTransitions = { pending: ['confirmed', 'cancelled'], confirmed: ['shipping', 'cancelled'], shipping: ['delivered'], delivered: [], cancelled: [] };
export default mongoose.model('Order', schema);
