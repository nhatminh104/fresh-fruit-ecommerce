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

function AreaChart({ data, formatValue }) {
  if (!data?.length) return <p className="mt-5 text-sm text-ink-muted">Chưa có dữ liệu.</p>;
  const W = 640, H = 200, P = 28;
  const max = Math.max(...data.map((d) => d.value), 1);
  const stepX = (W - P * 2) / Math.max(data.length - 1, 1);
  const points = data.map((d, i) => [
    P + i * stepX,
    H - P - (d.value / max) * (H - P * 2 - 10),
  ]);
  // Đường cong monotone cubic (Fritsch-Carlson): mượt nhưng không overshoot
  // xuống dưới/trên min-max dữ liệu -> không bị lõm xuống trục khi có tháng = 0
  const smoothLine = (pts) => {
    const n = pts.length;
    if (n < 3) return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    // Các điểm cách đều nhau -> secant slope d[i] = dy/dx
    const d = [];
    for (let i = 0; i < n - 1; i++) {
      const dx = xs[i + 1] - xs[i] || 1;
      d.push((ys[i + 1] - ys[i]) / dx);
    }
    // Tangent m[i]: 0 khi đổi hướng, ngược lại harmonic mean của 2 secant kề
    // -> bảo đảm monotone, đường không overshoot xuống dưới min dữ liệu
    const m = new Array(n).fill(0);
    m[0] = d[0];
    m[n - 1] = d[n - 2];
    for (let i = 1; i < n - 1; i++) {
      m[i] = d[i - 1] * d[i] <= 0 ? 0 : (2 * d[i - 1] * d[i]) / (d[i - 1] + d[i]);
    }
    let path = `M${xs[0].toFixed(1)},${ys[0].toFixed(1)}`;
    for (let i = 0; i < n - 1; i++) {
      const dx = (xs[i + 1] - xs[i]) / 3;
      const c1x = xs[i] + dx;
      const c1y = ys[i] + m[i] * dx;
      const c2x = xs[i + 1] - dx;
      const c2y = ys[i + 1] - m[i + 1] * dx;
      path += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${xs[i + 1].toFixed(1)},${ys[i + 1].toFixed(1)}`;
    }
    return path;
  };
  const line = smoothLine(points);
  const last = points[points.length - 1];
  const first = points[0];
  const area = `${line} L${last[0].toFixed(1)},${H - P} L${first[0].toFixed(1)},${H - P} Z`;
  return (
    <div className="mt-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Biểu đồ doanh thu">
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3d9e4d" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3d9e4d" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((r) => (
          <line key={r} x1={P} x2={W - P} y1={P + r * (H - P * 2)} y2={P + r * (H - P * 2)} stroke="#eef2ee" strokeWidth="1" />
        ))}
        <path d={area} fill="url(#revGrad)" />
        <path d={line} fill="none" stroke="#2e8b3a" strokeWidth="2.5" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#2e8b3a">
            <title>{`${data[i].label}: ${formatValue ? formatValue(data[i].value) : data[i].value}`}</title>
          </circle>
        ))}
        {data.map((d, i) => (
          <text key={`t${i}`} x={points[i][0]} y={H - 8} textAnchor="middle" fontSize="10" fill="#8a94a6">
            {d.label}
          </text>
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-[11px] text-ink-muted">
        <span>Thấp nhất: {formatValue ? formatValue(Math.min(...data.map((d) => d.value))) : ''}</span>
        <span className="font-bold text-brand-700">
          Cao nhất: {formatValue ? formatValue(Math.max(...data.map((d) => d.value))) : ''}
        </span>
      </div>
    </div>
  );
}

const PAYMENT_LABELS = { cod: 'COD', mock: 'Thanh toán online', bank: 'Chuyển khoản' };
const PAYMENT_COLORS = ['#2e8b3a', '#e8930c', '#4a7fd4', '#8a94a6'];

function DoughnutChart({ data }) {
  if (!data?.length) return <p className="mt-5 text-sm text-ink-muted">Chưa có đơn hàng.</p>;
  const total = data.reduce((s, d) => s + (d.count || 0), 0) || 1;
  const R = 52, C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row">
      <svg viewBox="0 0 140 140" className="h-36 w-36 shrink-0 -rotate-90">
        <circle cx="70" cy="70" r={R} fill="none" stroke="#f0f4f0" strokeWidth="16" />
        {data.map((d, i) => {
          const frac = (d.count || 0) / total;
          const dash = `${frac * C} ${C}`;
          const el = (
            <circle
              key={d.method}
              cx="70" cy="70" r={R} fill="none"
              stroke={PAYMENT_COLORS[i % PAYMENT_COLORS.length]}
              strokeWidth="16" strokeDasharray={dash} strokeDashoffset={-offset * C}
              strokeLinecap="butt"
            >
              <title>{`${PAYMENT_LABELS[d.method] || d.method}: ${d.count} đơn`}</title>
            </circle>
          );
          offset += frac;
          return el;
        })}
      </svg>
      <ul className="w-full space-y-2 text-sm">
        {data.map((d, i) => (
          <li key={d.method} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-slate-600">
              <span className="h-3 w-3 rounded-sm" style={{ background: PAYMENT_COLORS[i % PAYMENT_COLORS.length] }} />
              {PAYMENT_LABELS[d.method] || d.method}
            </span>
            <span className="font-bold text-ink">
              {d.count} <span className="text-xs font-semibold text-ink-muted">({Math.round((d.count / total) * 100)}%)</span>
            </span>
          </li>
        ))}
      </ul>
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
  const monthlyMap = Object.fromEntries(
    (data.monthlyRevenue || []).map((m) => [m._id, m])
  );
  const monthly = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const m = monthlyMap[key];
    return {
      label: `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(2)}`,
      value: m?.total || 0,
      count: m?.count || 0
    };
  });
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

      {/* Revenue chart - full width */}
      <section className="mt-8 rounded-3xl border border-surface-border bg-white p-6 shadow-subtle">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-bold text-ink">Doanh thu 6 tháng gần nhất</h2>
          <span className="text-xs font-semibold text-ink-muted">Đơn vị: VNĐ · chỉ tính đơn không hủy và đã thanh toán/giao</span>
        </div>
        <AreaChart data={monthly} formatValue={(v) => formatCurrency(v)} />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
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

        {/* Orders by payment method */}
        <section className="rounded-3xl border border-surface-border bg-white p-6 shadow-subtle">
          <h2 className="font-display text-lg font-bold text-ink">Cơ cấu đơn theo phương thức thanh toán</h2>
          <DoughnutChart data={data.ordersByPayment || []} />
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Top products */}
        <section className="rounded-3xl border border-surface-border bg-white p-6 shadow-subtle">
          <h2 className="font-display text-lg font-bold text-ink">Sản phẩm bán chạy</h2>
          {(data.topProducts || []).length === 0 ? (
            <p className="mt-5 text-sm text-ink-muted">Chưa có đơn hàng nào.</p>
          ) : (
            <ul className="mt-5 space-y-4">
              {(() => {
                const maxQty = Math.max(...data.topProducts.map((p) => p.quantity || 0), 1);
                return data.topProducts.map((p, i) => (
                  <li key={p._id || i}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex min-w-0 items-center gap-2.5">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-50 text-[11px] font-bold text-brand-700">
                          {i + 1}
                        </span>
                        <span className="truncate font-semibold text-ink">{p.name}</span>
                      </span>
                      <span className="shrink-0 text-xs font-bold text-brand-700">
                        {p.quantity} đã bán · {formatCurrency(p.revenue)}
                      </span>
                    </div>
                    <div className="ml-8 mt-1.5 h-3 overflow-hidden rounded-full bg-surface-subtle">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all"
                        style={{ width: `${Math.max(((p.quantity || 0) / maxQty) * 100, 3)}%` }}
                      />
                    </div>
                  </li>
                ));
              })()}
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
