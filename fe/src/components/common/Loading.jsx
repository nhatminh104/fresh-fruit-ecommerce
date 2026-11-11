import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading({ message = 'Đang tải dữ liệu...', minHeight = 'min-h-48' }) {
  return (
    <div className={`grid ${minHeight} place-items-center p-6 text-center`}>
      <div className="flex flex-col items-center gap-3">
        <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-500 shadow-sm">
          <Loader2 size={24} className="animate-spin text-brand-500" />
        </div>
        <p className="text-sm font-semibold text-ink-muted">{message}</p>
      </div>
    </div>
  );
}
