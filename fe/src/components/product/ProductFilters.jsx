import React from 'react';
import { ArrowDownUp, Filter, RotateCcw } from 'lucide-react';

export default function ProductFilters({ value = {}, onChange }) {
  const hasActiveFilters = Boolean(value.minPrice || value.maxPrice || (value.sort && value.sort !== 'newest'));

  const handleReset = () => {
    onChange?.({ minPrice: '', maxPrice: '', sort: 'newest' });
  };

  return (
    <div className="rounded-2xl border border-surface-border bg-white p-4 shadow-subtle">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-surface-border/60">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-700">
          <Filter size={15} />
          <span>Bộ lọc & Sắp xếp</span>
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-xs font-bold text-ink-muted hover:text-red-600 transition-colors"
          >
            <RotateCcw size={13} />
            <span>Xóa bộ lọc</span>
          </button>
        )}
      </div>

      <div className="mt-3.5 grid gap-3 sm:grid-cols-3">
        {/* Min Price */}
        <div>
          <label className="block text-xs font-bold text-ink-muted mb-1">
            Giá tối thiểu (đ)
          </label>
          <input
            className="w-full rounded-xl border border-surface-border bg-surface-subtle px-3 py-2 text-sm text-ink outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-50"
            type="number"
            min="0"
            step="5000"
            placeholder="Từ 0đ"
            value={value.minPrice || ''}
            onChange={(e) => onChange?.({ ...value, minPrice: e.target.value })}
          />
        </div>

        {/* Max Price */}
        <div>
          <label className="block text-xs font-bold text-ink-muted mb-1">
            Giá tối đa (đ)
          </label>
          <input
            className="w-full rounded-xl border border-surface-border bg-surface-subtle px-3 py-2 text-sm text-ink outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-50"
            type="number"
            min="0"
            step="5000"
            placeholder="Đến 500.000đ"
            value={value.maxPrice || ''}
            onChange={(e) => onChange?.({ ...value, maxPrice: e.target.value })}
          />
        </div>

        {/* Sort */}
        <div>
          <label className="block text-xs font-bold text-ink-muted mb-1 flex items-center gap-1">
            <ArrowDownUp size={13} />
            <span>Sắp xếp theo</span>
          </label>
          <select
            className="w-full rounded-xl border border-surface-border bg-surface-subtle px-3 py-2 text-sm text-ink outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-50 cursor-pointer"
            value={value.sort || 'newest'}
            onChange={(e) => onChange?.({ ...value, sort: e.target.value })}
          >
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
            <option value="popular">Bán chạy nhất</option>
          </select>
        </div>
      </div>
    </div>
  );
}
