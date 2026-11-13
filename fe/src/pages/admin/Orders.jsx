import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import OrderStatusBadge from '../../components/order/OrderStatusBadge';
import { listAdmin, updateAdmin } from '../../services/adminService';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { getErrorMessage } from '../../utils/errorMessage';
import { ORDER_STATUS_TRANSITIONS, ORDER_STATUS_OPTIONS, ORDER_ACTION_STYLE } from '../../constants/orderStatus';

const PAGE_SIZE = 10;
const ACTION_LABELS = { confirmed: 'Xác nhận', cancelled: 'Hủy đơn', shipping: 'Đang giao', delivered: 'Đã giao' };
const NEXT_ACTIONS = Object.fromEntries(
  Object.entries(ORDER_STATUS_TRANSITIONS).map(([from, targets]) => [
    from,
    targets.map((to) => [to, ACTION_LABELS[to] || to]),
  ])
);
const ACTION_STYLE = ORDER_ACTION_STYLE;
const STATUS_OPTIONS = ORDER_STATUS_OPTIONS;
const PAYMENT_OPTIONS = [
  { value: 'pending', label: 'Chờ thanh toán' },
  { value: 'paid', label: 'Đã thanh toán' },
  { value: 'failed', label: 'Thất bại' },
  { value: 'refunded', label: 'Đã hoàn' },
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pendingStatus, setPendingStatus] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listAdmin('orders');
      setOrders(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Không thể tải đơn hàng.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, paymentFilter]);

  const filtered = useMemo(() => {
    let result = orders;
    if (debouncedSearch) {
      result = result.filter((order) =>
        [order.orderCode, order.user?.fullName, order.user?.email]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(debouncedSearch))
      );
    }
    if (statusFilter) result = result.filter((order) => order.status === statusFilter);
    if (paymentFilter) result = result.filter((order) => order.paymentStatus === paymentFilter);
    return result;
  }, [orders, debouncedSearch, statusFilter, paymentFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const hasQuery = Boolean(debouncedSearch) || Boolean(statusFilter) || Boolean(paymentFilter);

  const requestStatusChange = (order, status) => {
    const label = NEXT_ACTIONS[order.status]?.find(([value]) => value === status)?.[1] || status;
    setPendingStatus({ order, status, label });
  };

  const changeStatus = async () => {
    if (!pendingStatus) return;
    const { order, status } = pendingStatus;
    setBusyId(order._id);
    try {
      await updateAdmin('orders', order._id, { status });
      await load();
    } catch (actionError) {
      setError(getErrorMessage(actionError, 'Không thể cập nhật trạng thái đơn hàng.'));
    } finally {
      setBusyId(null);
      setPendingStatus(null);
    }
  };

  return (
    <PageContainer>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Fresh admin</p>
          <h1 className="mt-3 font-display text-5xl text-forest">Quản lý đơn hàng</h1>
        </div>
        <Button type="button" variant="secondary" onClick={load} disabled={loading}>
          {loading ? 'Đang tải...' : 'Làm mới'}
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo mã đơn, tên hoặc email khách..."
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
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-xl border border-surface-border bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-leaf"
        >
          <option value="">Tất cả trạng thái</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={paymentFilter}
          onChange={(event) => setPaymentFilter(event.target.value)}
          className="rounded-xl border border-surface-border bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-leaf"
        >
          <option value="">Tất cả thanh toán</option>
          {PAYMENT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {hasQuery && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setStatusFilter('');
              setPaymentFilter('');
            }}
            className="text-xs font-bold text-leaf hover:underline"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

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
      ) : orders.length === 0 ? (
        <p className="mt-8 rounded-2xl bg-white p-6 text-slate-500">Chưa có đơn hàng nào.</p>
      ) : filtered.length === 0 ? (
        <p className="mt-8 rounded-2xl bg-white p-6 text-slate-500">Không tìm thấy đơn hàng phù hợp.</p>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b bg-cream/60 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="whitespace-nowrap px-5 py-4 font-semibold">Mã đơn</th>
                  <th className="whitespace-nowrap px-5 py-4 font-semibold">Khách hàng</th>
                  <th className="whitespace-nowrap px-5 py-4 font-semibold">Ngày tạo</th>
                  <th className="whitespace-nowrap px-5 py-4 font-semibold">Tổng tiền</th>
                  <th className="whitespace-nowrap px-5 py-4 font-semibold">Trạng thái</th>
                  <th className="whitespace-nowrap px-5 py-4 font-semibold">Thanh toán</th>
                  <th className="whitespace-nowrap px-5 py-4 font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((order) => (
                  <tr className="border-b border-slate-100 transition-colors last:border-0 hover:bg-cream/40" key={order._id}>
                    <td className="px-5 py-4 font-bold text-forest">{order.orderCode}</td>
                    <td className="px-5 py-4 text-slate-700">
                      {order.user?.fullName || order.user?.email || '-'}
                    </td>
                    <td className="px-5 py-4 text-slate-500">{formatDate(order.createdAt)}</td>
                    <td className="px-5 py-4 font-semibold">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-5 py-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-4 text-slate-600">{order.paymentStatus}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          className="inline-flex items-center rounded-full border border-surface-border px-3 py-1.5 text-xs font-bold leading-none text-forest transition-colors hover:border-leaf hover:text-leaf"
                          to={`/admin/orders/${order._id}`}
                        >
                          Chi tiết
                        </Link>
                        {(NEXT_ACTIONS[order.status] || []).map(([status, label]) => (
                          <Button
                            key={status}
                            type="button"
                            variant={ACTION_STYLE[status] || 'secondary'}
                            className="px-3 py-1.5 text-xs"
                            disabled={busyId === order._id}
                            onClick={() => requestStatusChange(order, status)}
                          >
                            {busyId === order._id ? '...' : label}
                          </Button>
                        ))}
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
              {Math.min(safePage * PAGE_SIZE, filtered.length)} / {filtered.length} đơn hàng
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

      <ConfirmDialog
        open={Boolean(pendingStatus)}
        onClose={() => setPendingStatus(null)}
        onConfirm={changeStatus}
        title="Cập nhật trạng thái đơn hàng"
        message={
          pendingStatus
            ? `Chuyển đơn ${pendingStatus.order.orderCode} sang "${pendingStatus.label}"?`
            : ''
        }
        confirmLabel={pendingStatus?.label || 'Xác nhận'}
        danger={pendingStatus?.status === 'cancelled'}
      />
    </PageContainer>
  );
}
