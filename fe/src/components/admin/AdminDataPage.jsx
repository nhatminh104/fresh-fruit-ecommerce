import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import PageContainer from '../layout/PageContainer';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import Button from '../common/Button';
import ConfirmDialog from '../common/ConfirmDialog';
import * as adminService from '../../services/adminService';
import { getErrorMessage } from '../../utils/errorMessage';
import { formatCurrency } from '../../utils/formatCurrency';

const PAGE_SIZE = 10;

const display = (value, column) => {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'boolean') return value ? 'Có' : 'Không';
  if (column?.format) return column.format(value);
  if (column?.type === 'currency') return formatCurrency(Number(value) || 0);
  if (column?.type === 'date' || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value))) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN');
  }
  if (typeof value === 'object')
    return value.name || value.fullName || value.email || value.code || value.productName || '-';
  return String(value);
};

const getNested = (item, path) =>
  path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), item);

export default function AdminDataPage({
  title,
  resource,
  columns,
  actions = [],
  editPath = null,
  createPath = null,
  searchFields = [],
  filters = [],
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterValues, setFilterValues] = useState({});
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminService.listAdmin(resource);
      setItems(Array.isArray(data) ? data : data.items || []);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Không thể tải dữ liệu quản trị.'));
    } finally {
      setLoading(false);
    }
  }, [resource]);
  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterValues, resource]);

  const filtered = useMemo(() => {
    let result = items;
    if (debouncedSearch && searchFields.length) {
      result = result.filter((item) =>
        searchFields.some((field) =>
          String(getNested(item, field) ?? '').toLowerCase().includes(debouncedSearch)
        )
      );
    }
    for (const filter of filters) {
      const value = filterValues[filter.key];
      if (value) {
        result = result.filter((item) => String(getNested(item, filter.key) ?? '') === value);
      }
    }
    return result;
  }, [items, debouncedSearch, filterValues, searchFields, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const hasQuery = Boolean(debouncedSearch) || Object.values(filterValues).some(Boolean);

  const executeAction = async (action, item) => {
    setActionLoading(`${item._id || item.id}:${action.label}`);
    try {
      await action.run(item, adminService);
      await load();
    } catch (actionError) {
      setError(getErrorMessage(actionError, 'Thao tác thất bại.'));
    } finally {
      setActionLoading(null);
      setPendingAction(null);
    }
  };

  const runAction = (action, item) => {
    if (action.confirm) {
      setPendingAction({ action, item });
      return;
    }
    executeAction(action, item);
  };

  const clearFilters = () => {
    setSearch('');
    setFilterValues({});
  };

  return (
    <PageContainer>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Fresh admin</p>
          <h1 className="mt-3 font-display text-5xl text-forest">{title}</h1>
        </div>
        <div className="flex gap-2">
          {createPath && (
            <Link className="btn-primary" to={createPath}>
              + Thêm mới
            </Link>
          )}
          <Button type="button" variant="secondary" onClick={load} disabled={loading}>
            {loading ? 'Đang tải...' : 'Làm mới'}
          </Button>
        </div>
      </div>

      {(searchFields.length > 0 || filters.length > 0) && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {searchFields.length > 0 && (
            <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm kiếm..."
                className="w-full rounded-xl border border-surface-border bg-white py-2.5 pl-10 pr-9 text-sm outline-none transition-colors focus:border-leaf"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-muted hover:bg-slate-100 hover:text-ink"
                  aria-label="Xóa tìm kiếm"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}
          {filters.map((filter) => (
            <select
              key={filter.key}
              value={filterValues[filter.key] || ''}
              onChange={(event) =>
                setFilterValues((current) => ({ ...current, [filter.key]: event.target.value }))
              }
              className="rounded-xl border border-surface-border bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-leaf"
            >
              <option value="">{filter.label || `Tất cả ${filter.key}`}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ))}
          {hasQuery && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-bold text-leaf hover:underline"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="mt-6">
          <ErrorMessage message={error} />
          <Button type="button" variant="secondary" className="mt-3" onClick={load}>
            Thử lại
          </Button>
        </div>
      )}

      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <p className="mt-8 rounded-2xl bg-white p-6 text-slate-500">Chưa có dữ liệu.</p>
      ) : filtered.length === 0 ? (
        <p className="mt-8 rounded-2xl bg-white p-6 text-slate-500">
          Không tìm thấy kết quả phù hợp.
        </p>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b bg-cream/60 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  {columns.map((column) => (
                    <th className="whitespace-nowrap px-5 py-4 font-semibold" key={column.key}>
                      {column.label}
                    </th>
                  ))}
                  <th className="whitespace-nowrap px-5 py-4 font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((item) => (
                  <tr
                    className="border-b border-slate-100 transition-colors last:border-0 hover:bg-cream/40"
                    key={item._id || item.id}
                  >
                    {columns.map((column) => (
                      <td className="max-w-[260px] truncate px-5 py-4 text-slate-700" key={column.key}>
                        {column.render ? column.render(item) : display(getNested(item, column.key), column)}
                      </td>
                    ))}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {editPath && (
                          <Link
                            className="inline-flex items-center rounded-full border border-surface-border px-3 py-1.5 text-xs font-bold leading-none text-forest transition-colors hover:border-leaf hover:text-leaf"
                            to={editPath(item)}
                          >
                            Sửa
                          </Link>
                        )}
                        {actions
                          .filter((action) => !action.hidden || !action.hidden(item))
                          .map((action) => {
                            const busy = actionLoading === `${item._id || item.id}:${action.label}`;
                            return (
                              <Button
                                type="button"
                                variant={action.variant || 'secondary'}
                                className="px-3 py-1.5 text-xs"
                                key={action.label}
                                disabled={busy}
                                onClick={() => runAction(action, item)}
                              >
                                {busy ? '...' : action.label}
                              </Button>
                            );
                          })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
            <p>
              Hiển thị {filtered.length ? (safePage - 1) * PAGE_SIZE + 1 : 0}–
              {Math.min(safePage * PAGE_SIZE, filtered.length)} / {filtered.length} bản ghi
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage(safePage - 1)}
                  className="inline-flex items-center gap-1 rounded-full border border-surface-border bg-white px-3 py-1.5 text-xs font-bold text-ink transition-colors hover:border-leaf disabled:opacity-40"
                >
                  <ChevronLeft size={14} /> Trước
                </button>
                <span className="px-2 text-xs font-semibold">
                  {safePage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage(safePage + 1)}
                  className="inline-flex items-center gap-1 rounded-full border border-surface-border bg-white px-3 py-1.5 text-xs font-bold text-ink transition-colors hover:border-leaf disabled:opacity-40"
                >
                  Sau <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {pendingAction && (
        <ConfirmDialog
          open
          onClose={() => setPendingAction(null)}
          onConfirm={() => executeAction(pendingAction.action, pendingAction.item)}
          title={pendingAction.action.confirmTitle || 'Xác nhận thao tác'}
          message={
            typeof pendingAction.action.confirm === 'function'
              ? pendingAction.action.confirm(pendingAction.item)
              : pendingAction.action.confirm
          }
          confirmLabel={pendingAction.action.confirmLabel || 'Xác nhận'}
          danger={Boolean(pendingAction.action.danger)}
        />
      )}
    </PageContainer>
  );
}
