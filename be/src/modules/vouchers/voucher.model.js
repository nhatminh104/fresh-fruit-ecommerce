import mongoose from 'mongoose';
const schema = new mongoose.Schema({ code: { type: String, required: true, unique: true, uppercase: true, trim: true, match: /^[A-Z0-9_-]+$/ }, description: String, discountType: { type: String, enum: ['percent', 'fixed'], required: true }, discountValue: { type: Number, required: true, min: 0 }, minOrderValue: { type: Number, min: 0, default: 0 }, maxDiscount: { type: Number, min: 0 }, startDate: { type: Date, required: true }, endDate: { type: Date, required: true }, usageLimit: { type: Number, min: 1 }, usedCount: { type: Number, min: 0, default: 0 }, isActive: { type: Boolean, default: true } }, { timestamps: true, collection: 'vouchers' });
schema.path('endDate').validate(function (value) { return !this.startDate || value >= this.startDate; }, 'End date must be after start date');
schema.path('discountValue').validate(function (value) { return this.discountType !== 'percent' || value <= 100; }, 'Percent discount cannot exceed 100');
schema.index({ code: 1, isActive: 1 });
export default mongoose.model('Voucher', schema);
