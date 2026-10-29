import mongoose from 'mongoose';
const schema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, refreshToken: String }, { timestamps: true });
export default mongoose.model('AuthSession', schema);
