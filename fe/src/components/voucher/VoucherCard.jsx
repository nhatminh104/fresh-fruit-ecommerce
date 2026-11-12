import { formatCurrency } from '../../utils/formatCurrency';
export default function VoucherCard({ voucher }) {
  const discount =
    voucher.discountType === 'percent' ? `${voucher.discountValue}%` : formatCurrency(voucher.discountValue);
  return (
    <article className="rounded-2xl border border-dashed border-leaf bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <strong className="text-xl text-forest">{voucher.code}</strong>
          <p className="mt-2 text-sm text-slate-500">
            {voucher.description || `Giảm ${discount} cho đơn hàng`}
          </p>
        </div>
        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
          -{discount}
        </span>
      </div>
      <p className="mt-5 text-xs text-slate-400">
        Đơn tối thiểu {formatCurrency(voucher.minOrderValue || 0)} · Hạn dùng{' '}
        {new Date(voucher.endDate).toLocaleDateString('vi-VN')}
      </p>
    </article>
  );
}
