import Voucher from './voucher.model.js'; export const listVouchers = () => Voucher.find({ isActive: true }).lean();
