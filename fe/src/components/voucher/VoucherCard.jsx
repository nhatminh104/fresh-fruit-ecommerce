import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { useToast } from '../../contexts/ToastContext';

export default function VoucherCard({ voucher }) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();
  const discount =
    voucher.discountType === 'percent' ? `${voucher.discountValue}%` : formatCurrency(voucher.discountValue);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(voucher.code);
      setCopied(true);
      toast.success(`Đã sao chép mã ${voucher.code}`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Không thể sao chép mã. Vui lòng copy thủ công.');
    }
  };

  return (
    <article className="relative overflow-hidden rounded-2xl border border-dashed border-amber-300 bg-white p-6">
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-amber-50" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <strong className="text-xl text-forest">{voucher.code}</strong>
          <p className="mt-2 text-sm text-slate-500">
            {voucher.description || `Giảm ${discount} cho đơn hàng`}
          </p>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
          -{discount}
        </span>
      </div>
      <div className="relative mt-5 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-400">
          Đơn tối thiểu {formatCurrency(voucher.minOrderValue || 0)} · Hạn dùng{' '}
          {new Date(voucher.endDate).toLocaleDateString('vi-VN')}
        </p>
        <button
          type="button"
          onClick={copyCode}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-surface-border bg-surface-subtle px-3.5 py-1.5 text-xs font-bold text-ink transition-colors hover:border-leaf hover:text-leaf"
        >
          {copied ? <Check size={13} className="text-leaf" /> : <Copy size={13} />}
          {copied ? 'Đã chép' : 'Sao chép'}
        </button>
      </div>
    </article>
  );
}
