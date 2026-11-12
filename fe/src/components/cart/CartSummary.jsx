import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShieldCheck, Truck } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

export default function CartSummary({ items = [] }) {
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );
  const freeshipThreshold = 500000;
  const isFreeship = subtotal >= freeshipThreshold;
  const shippingFee = isFreeship ? 0 : 30000;
  const total = subtotal + shippingFee;
  const amountNeededForFreeship = Math.max(0, freeshipThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeshipThreshold) * 100));

  return (
    <aside className="rounded-3xl border border-surface-border bg-white p-6 shadow-card h-fit space-y-6">
      <h3 className="font-display text-xl font-bold text-ink">Tóm tắt đơn hàng</h3>

      {/* Freeship Progress Indicator */}
      <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
        <div className="flex items-center gap-2 text-xs font-bold text-brand-700">
          {isFreeship ? (
            <>
              <CheckCircle2 size={16} className="text-brand-500 shrink-0" />
              <span>Chúc mừng! Bạn đã được Miễn phí giao hàng.</span>
            </>
          ) : (
            <>
              <Truck size={16} className="text-brand-500 shrink-0" />
              <span>
                Mua thêm <strong className="text-brand-700">{formatCurrency(amountNeededForFreeship)}</strong>{' '}
                để được FREESHIP!
              </span>
            </>
          )}
        </div>
        <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-brand-100">
          <div
            className="h-full bg-brand-500 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Cost lines */}
      <div className="space-y-3 border-b border-surface-border pb-5 text-sm text-ink-muted">
        <div className="flex justify-between items-center">
          <span>Tạm tính ({items.length} sản phẩm)</span>
          <span className="font-bold text-ink">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Phí vận chuyển</span>
          <span className={shippingFee === 0 ? 'font-bold text-brand-700' : 'font-bold text-ink'}>
            {shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}
          </span>
        </div>
      </div>

      {/* Total Amount */}
      <div className="flex items-baseline justify-between">
        <span className="text-base font-bold text-ink">Tổng thanh toán</span>
        <div className="text-right">
          <span className="font-display text-2xl font-black text-brand-700">{formatCurrency(total)}</span>
          <span className="block text-[11px] text-ink-muted">(Đã bao gồm VAT nếu có)</span>
        </div>
      </div>

      {/* Action Button */}
      <Link to="/checkout" className="btn-primary w-full py-3.5 text-base shadow-card hover:shadow-elevated">
        <span>Tiến hành thanh toán</span>
        <ArrowRight size={18} />
      </Link>

      {/* Trust notices */}
      <div className="space-y-2 pt-2 border-t border-surface-border text-xs text-ink-muted">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-brand-500 shrink-0" />
          <span>Cam kết trái cây chuẩn loại 1, minh bạch nguồn gốc</span>
        </div>
        <div className="flex items-center gap-2">
          <Truck size={16} className="text-brand-500 shrink-0" />
          <span>Được kiểm tra hàng trước khi thanh toán tiền mặt</span>
        </div>
      </div>
    </aside>
  );
}
