import mongoose from 'mongoose';
const schema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true }, items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, quantity: { type: Number, required: true, min: 1, validate: Number.isInteger } }] }, { timestamps: true, collection: 'carts' });
export default mongoose.model('Cart', schema);
