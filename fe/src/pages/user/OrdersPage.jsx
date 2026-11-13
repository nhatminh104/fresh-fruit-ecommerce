import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import OrderStatusBadge from '../../components/order/OrderStatusBadge';
import { getOrders } from '../../services/orderService';
import { formatCurrency } from '../../utils/formatCurrency';
export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const STATUS_OPTIONS = [
    ['all', 'Tất cả'],
    ['pending', 'Chờ xác nhận'],
    ['processing', 'Đang xử lý'],
    ['shipped', 'Đang giao'],
    ['delivered', 'Đã giao'],
    ['cancelled', 'Đã hủy']
  ];
  const filteredOrders = useMemo(
    () => orders.filter((order) => statusFilter === 'all' || order.status === statusFilter),
    [orders, statusFilter]
  );
  useEffect(() => {
    getOrders()
      .then(({ data }) => setOrders(data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Không thể tải đơn hàng.'))
      .finally(() => setLoading(false));
  }, []);
  return (
    <PageContainer>
      <p className="eyebrow">Tài khoản</p>
      <h1 className="mt-3 font-display text-5xl text-forest">Đơn hàng của tôi</h1>
      {!loading && !error && orders.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {STATUS_OPTIONS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                statusFilter === value
                  ? 'bg-forest text-white'
                  : 'border border-surface-border bg-white text-slate-600 hover:border-forest hover:text-forest'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {loading ? (
        <Loading />
      ) : error ? (
        <div className="mt-6">
          <ErrorMessage message={error} />
        </div>
      ) : !filteredOrders.length ? (
        <div className="mt-8">
          <EmptyState title="Bạn chưa có đơn hàng" />
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {filteredOrders.map((order) => (
            <Link
              to={`/orders/${order._id}`}
              key={order._id}
              className="block rounded-2xl border border-surface-border bg-white p-5 shadow-subtle transition hover:-translate-y-0.5 hover:shadow-card"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-forest">{order.orderCode}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')} · {order.items.length} sản phẩm
                  </p>
                </div>
                <div className="text-right">
                  <OrderStatusBadge status={order.status} />
                  <p className="mt-2 font-bold text-forest">{formatCurrency(order.totalAmount)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
