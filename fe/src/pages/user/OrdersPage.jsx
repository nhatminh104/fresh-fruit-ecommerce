import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import OrderStatusBadge from '../../components/order/OrderStatusBadge';
import { getOrders } from '../../services/orderService';
import { formatCurrency } from '../../utils/formatCurrency';
export default function OrdersPage() { const [orders, setOrders] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); useEffect(() => { getOrders().then(({ data }) => setOrders(data.data || [])).catch((err) => setError(err.response?.data?.message || 'Không thể tải đơn hàng.')).finally(() => setLoading(false)); }, []); return <PageContainer><p className="eyebrow">Tài khoản</p><h1 className="mt-3 font-display text-5xl text-forest">Đơn hàng của tôi</h1>{loading ? <Loading /> : error ? <div className="mt-6"><ErrorMessage message={error} /></div> : !orders.length ? <div className="mt-8"><EmptyState title="Bạn chưa có đơn hàng" /></div> : <div className="mt-8 space-y-4">{orders.map((order) => <Link to={`/orders/${order._id}`} key={order._id} className="block rounded-2xl bg-white p-5 transition hover:-translate-y-0.5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-bold text-forest">{order.orderCode}</p><p className="mt-1 text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString('vi-VN')} · {order.items.length} sản phẩm</p></div><div className="text-right"><OrderStatusBadge status={order.status} /><p className="mt-2 font-bold text-forest">{formatCurrency(order.totalAmount)}</p></div></div></Link>)}</div>}</PageContainer>; }
