import mongoose from 'mongoose';
const schema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, recipientName: { type: String, required: true, trim: true }, phone: { type: String, required: true, trim: true }, province: { type: String, required: true, trim: true }, district: { type: String, required: true, trim: true }, ward: { type: String, required: true, trim: true }, streetAddress: { type: String, required: true, trim: true }, isDefault: { type: Boolean, default: false } }, { timestamps: true, collection: 'addresses' });
schema.virtual('recipient').get(function () { return this.recipientName; });
schema.virtual('address').get(function () { return this.streetAddress; });
export default mongoose.model('Address', schema);
