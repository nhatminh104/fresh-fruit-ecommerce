import React from 'react';

const statusConfig = {
  // Order status
  pending: {
    label: 'Chờ xử lý',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  confirmed: {
    label: 'Đã xác nhận',
    className: 'bg-sky-50 text-sky-700 border-sky-200',
    dot: 'bg-sky-500',
  },
  shipping: {
    label: 'Đang giao',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
  },
  delivered: {
    label: 'Đã giao',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  cancelled: {
    label: 'Đã hủy',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
  // Payment status
  paid: {
    label: 'Đã thanh toán',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  refunded: {
    label: 'Đã hoàn tiền',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
  },
  failed: {
    label: 'Thất bại',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
};

export default function OrderStatusBadge({ status = 'pending', className = '' }) {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-surface-subtle text-ink-muted border-surface-border',
    dot: 'bg-ink-light',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-wide ${config.className} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      {config.label}
    </span>
  );
}
