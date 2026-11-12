import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import ProductImage from '../common/ProductImage';

export default function CartItem({ item, onRemove, onQuantityChange }) {
  const itemId = item.id || item._id;
  const image = item.images?.[0] || item.image;
  const subtotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-5 border-b border-surface-border last:border-b-0">
      {/* Product Image & Info */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <Link
          to={`/products/${itemId}`}
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-surface-border bg-surface-subtle"
        >
          <ProductImage src={image} alt={item.name} className="h-full w-full" />
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            to={`/products/${itemId}`}
            className="font-bold text-sm sm:text-base text-ink hover:text-brand-500 transition-colors line-clamp-1"
          >
            {item.name}
          </Link>
          <p className="mt-1 text-xs text-ink-muted">
            Đơn giá: <strong className="text-ink">{formatCurrency(item.price)}</strong>{' '}
            {item.unit ? `/ ${item.unit}` : ''}
          </p>

          {/* Stepper on Mobile */}
          <div className="mt-3 flex items-center gap-3 sm:hidden">
            <div className="flex items-center rounded-full border border-surface-border bg-white p-0.5 shadow-subtle">
              <button
                type="button"
                onClick={() => onQuantityChange(itemId, item.quantity - 1)}
                className="grid h-7 w-7 place-items-center rounded-full text-ink hover:bg-surface-subtle"
                aria-label="Giảm số lượng"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-xs font-bold text-ink">{item.quantity}</span>
              <button
                type="button"
                onClick={() => onQuantityChange(itemId, item.quantity + 1)}
                className="grid h-7 w-7 place-items-center rounded-full text-ink hover:bg-surface-subtle"
                aria-label="Tăng số lượng"
              >
                <Plus size={14} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => onRemove(itemId)}
              className="text-xs font-semibold text-red-600 hover:text-red-700"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Stepper, Price & Remove */}
      <div className="hidden sm:flex items-center gap-6">
        <div className="flex items-center rounded-full border border-surface-border bg-white p-0.5 shadow-subtle">
          <button
            type="button"
            onClick={() => onQuantityChange(itemId, item.quantity - 1)}
            className="grid h-8 w-8 place-items-center rounded-full text-ink hover:bg-surface-subtle"
            aria-label="Giảm số lượng"
          >
            <Minus size={14} />
          </button>
          <span className="w-10 text-center text-xs font-bold text-ink">{item.quantity}</span>
          <button
            type="button"
            onClick={() => onQuantityChange(itemId, item.quantity + 1)}
            className="grid h-8 w-8 place-items-center rounded-full text-ink hover:bg-surface-subtle"
            aria-label="Tăng số lượng"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="w-28 text-right">
          <span className="font-extrabold text-sm sm:text-base text-brand-700">
            {formatCurrency(subtotal)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onRemove(itemId)}
          className="grid h-9 w-9 place-items-center rounded-full text-ink-muted hover:bg-red-50 hover:text-red-600 transition-colors"
          title="Xóa sản phẩm"
          aria-label="Xóa sản phẩm khỏi giỏ hàng"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
