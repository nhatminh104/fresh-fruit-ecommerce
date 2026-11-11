import React from 'react';
import { PackageOpen } from 'lucide-react';

export default function EmptyState({
  icon: Icon = PackageOpen,
  title = 'Chưa có dữ liệu',
  description = 'Hiện tại danh sách này đang trống.',
  action = null,
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-3xl border border-surface-border bg-white p-10 text-center shadow-subtle ${className}`}>
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-surface-subtle text-brand-500 mb-4">
        <Icon size={32} strokeWidth={1.75} />
      </div>
      <h3 className="font-display text-xl font-bold text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
