import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Package, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import OrderStatusBadge from '../../components/order/OrderStatusBadge';
import { formatCurrency } from '../../utils/formatCurrency';
import api from '../../services/api';
import { getErrorMessage } from '../../utils/errorMessage';

const STATUS_LABELS = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy'
};
const STATUS_COLORS = {
  pending: 'bg-amber-400',
  confirmed: 'bg-sky-400',
  shipping: 'bg-indigo-400',
  delivered: 'bg-emerald-500',
  cancelled: 'bg-rose-400'
};

function BarChart({ data, labelKey, valueKey, formatValue, colorClass = 'bg-brand-500' }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map((d) => d[valueKey] || 0), 1);
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d[labelKey]} className="flex items-center gap-3">
          <span className="w-16 shrink-0 text-xs font-bold text-ink-muted">{d[labelKey]}</span>
          <div className="h-4 flex-1 overflow-hidden rounded-full bg-surface-subtle">
            <div
              className={`h-full rounded-full ${colorClass} transition-all`}
              style={{ width: `${Math.max((d[valueKey] / max) * 100, 2)}%` }}
            />
          </div>
          <span className="w-24 shrink-0 text-right text-xs font-bold text-ink">
            {formatValue ? formatValue(d[valueKey]) : d[valueKey]}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then((response) => setData(response.data.data))
      .catch((requestError) => setError(getErrorMessage(requestError, 'Không thể tải tổng quan quản trị.')));
  }, []);

  if (error)
    return (
      <PageContainer>
        <ErrorMessage message={error} />
      </PageContainer>
    );
  if (!data)
    return (
      <PageContainer>
        <Loading />
      </PageContainer>
    );

  const statusData = (data.ordersByStatus || []).map((s) => ({
    label: STATUS_LABELS[s.status] || s.status,
    value: s.count,
    color: STATUS_COLORS[s.status] || 'bg-slate-400'
  }));
  const maxStatus = Math.max(...statusData.map((s) => s.value), 1);
  const monthly = (data.monthlyRevenue || []).map((m) => ({
    label: m._id,
    value: m.total,
    count: m.count
  }));
  const kpis = [
    { label: 'Người dùng', value: data.users, icon: Users, href: '/admin/users' },
    { label: 'Sản phẩm đang bán', value: data.products, icon: Package, href: '/admin/products' },
    { label: 'Tổng đơn hàng', value: data.orders, icon: ShoppingCart, href: '/admin/orders' },
    { label: 'Doanh thu', value: formatCurrency(data.revenue), icon: TrendingUp, href: '/admin/orders' }
  ];

  return (
    <PageContainer>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Fresh admin</p>
          <h1 className="mt-3 font-display text-4xl text-forest">Tổng quan</h1>
        </div>
        {data.lowStockCount > 0 && (
          <Link
            to="/admin/inventory"
            className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800"
          >
            <AlertTriangle size={14} />
            {data.lowStockCount} sản phẩm sắp hết hàng
          </Link>
        )}
      </div>

      {/* KPI Cards */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            to={href}
            className="group rounded-2xl border border-surface-border bg-white p-5 shadow-subtle transition-all hover:-translate-y-0.5 hover:shadow-card"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">{label}</span>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                <Icon size={17} />
              </span>
            </div>
            <strong className="mt-3 block font-display text-2xl font-bold text-ink">{value}</strong>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Orders by status */}
        <section className="rounded-3xl border border-surface-border bg-white p-6 shadow-subtle">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">Đơn hàng theo trạng thái</h2>
            <Link to="/admin/orders" className="flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-600">
              Xem tất cả <ArrowRight size={13} />
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {statusData.length === 0 && <p className="text-sm text-ink-muted">Chưa có đơn hàng.</p>}
            {statusData.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs font-bold text-ink-muted">{s.label}</span>
                <div className="h-4 flex-1 overflow-hidden rounded-full bg-surface-subtle">
                  <div className={`h-full rounded-full ${s.color}`} style={{ width: `${(s.value / maxStatus) * 100}%` }} />
                </div>
                <span className="w-10 shrink-0 text-right text-xs font-bold text-ink">{s.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Revenue by month */}
        <section className="rounded-3xl border border-surface-border bg-white p-6 shadow-subtle">
          <h2 className="font-display text-lg font-bold text-ink">Doanh thu 6 tháng gần nhất</h2>
          {monthly.length === 0 ? (
            <p className="mt-5 text-sm text-ink-muted">Chưa có dữ liệu doanh thu.</p>
          ) : (
            <div className="mt-5">
              <BarChart
                data={monthly}
                labelKey="label"
                valueKey="value"
                colorClass="bg-brand-500"
                formatValue={(v) => formatCurrency(v)}
              />
              <p className="mt-4 text-[11px] text-ink-light">Đơn vị: VNĐ — chỉ tính đơn không hủy và đã thanh toán/giao.</p>
            </div>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Top products */}
        <section className="rounded-3xl border border-surface-border bg-white p-6 shadow-subtle">
          <h2 className="font-display text-lg font-bold text-ink">Sản phẩm bán chạy</h2>
          {(data.topProducts || []).length === 0 ? (
            <p className="mt-5 text-sm text-ink-muted">Chưa có đơn hàng nào.</p>
          ) : (
            <ul className="mt-4 divide-y divide-surface-border">
              {data.topProducts.map((p, i) => (
                <li key={p._id || i} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink">{p.name}</p>
                      <p className="text-xs text-ink-muted">{p.quantity} sản phẩm đã bán</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-brand-700">{formatCurrency(p.revenue)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent orders */}
        <section className="rounded-3xl border border-surface-border bg-white p-6 shadow-subtle">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">Đơn hàng gần đây</h2>
            <Link to="/admin/orders" className="flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-600">
              Quản lý <ArrowRight size={13} />
            </Link>
          </div>
          {(data.recentOrders || []).length === 0 ? (
            <p className="mt-5 text-sm text-ink-muted">Chưa có đơn hàng.</p>
          ) : (
            <ul className="mt-4 divide-y divide-surface-border">
              {data.recentOrders.map((o) => (
                <li key={o._id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link to={`/admin/orders/${o._id}`} className="block truncate text-sm font-bold text-ink hover:text-brand-600">
                      {o.orderCode}
                    </Link>
                    <p className="truncate text-xs text-ink-muted">
                      {o.user?.fullName || o.user?.email || 'Khách'} · {new Date(o.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <OrderStatusBadge status={o.status} />
                    <span className="text-sm font-bold text-brand-700">{formatCurrency(o.totalAmount)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
