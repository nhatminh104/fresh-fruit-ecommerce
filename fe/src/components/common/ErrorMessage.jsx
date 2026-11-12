import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorMessage({
  message = 'Có lỗi xảy ra, vui lòng thử lại.',
  onRetry = null,
  className = '',
}) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-800 ${className}`}
    >
      <AlertCircle size={20} className="shrink-0 text-red-600 mt-0.5" />
      <div className="flex-1">
        <p className="font-semibold text-red-900 leading-snug">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 text-xs font-bold underline hover:text-red-950"
          >
            Thử lại
          </button>
        )}
      </div>
    </div>
  );
}
