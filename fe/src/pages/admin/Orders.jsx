import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import Button from '../../components/common/Button';
import OrderStatusBadge from '../../components/order/OrderStatusBadge';
import { listAdmin, updateAdmin } from '../../services/adminService';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { getErrorMessage } from '../../utils/errorMessage';

const NEXT_ACTIONS = {
  pending: [['confirmed', 'Xác nhận'], ['cancelled', 'Hủy đơn']],
  confirmed: [['shipping', 'Đang giao'], ['cancelled', 'Hủy đơn']],
  shipping: [['delivered', 'Đã giao']],
  delivered: [],
  cancelled: []
};
const ACTION_STYLE = { cancelled: 'danger', confirmed: 'primary', shipping: 'primary', delivered: 'secondary' };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

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

  useEffect(() => { load(); }, []);

  const changeStatus = async (order, status) => {
    const label = NEXT_ACTIONS[order.status]?.find(([value]) => value === status)?.[1] || status;
    if (!window.confirm(`Chuyển đơn ${order.orderCode} sang "${label}"?`)) return;
    setBusyId(order._id);
    try {
      await updateAdmin('orders', order._id, { status });
      await load();
    } catch (actionError) {
      setError(getErrorMessage(actionError, 'Không thể cập nhật trạng thái đơn hàng.'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <PageContainer>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Fresh admin</p>
          <h1 className="mt-3 font-display text-5xl text-forest">Quản lý đơn hàng</h1>
        </div>
        <Button type="button" variant="secondary" onClick={load}>Làm mới</Button>
      </div>
      {error && <div className="mt-6"><ErrorMessage message={error} /></div>}
      {loading ? <Loading /> : orders.length === 0 ? (
        <p className="mt-8 rounded-2xl bg-white p-6 text-slate-500">Chưa có đơn hàng nào.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b bg-cream text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4">Mã đơn</th>
                <th className="px-5 py-4">Khách hàng</th>
                <th className="px-5 py-4">Ngày tạo</th>
                <th className="px-5 py-4">Tổng tiền</th>
                <th className="px-5 py-4">Trạng thái</th>
                <th className="px-5 py-4">Thanh toán</th>
                <th className="px-5 py-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr className="border-b last:border-0" key={order._id}>
                  <td className="px-5 py-4 font-bold text-forest">{order.orderCode}</td>
                  <td className="px-5 py-4 text-slate-700">{order.user?.fullName || order.user?.email || '-'}</td>
                  <td className="px-5 py-4 text-slate-500">{formatDate(order.createdAt)}</td>
                  <td className="px-5 py-4 font-semibold">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-5 py-4"><OrderStatusBadge status={order.status} /></td>
                  <td className="px-5 py-4 text-slate-600">{order.paymentStatus}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link className="rounded-full border border-surface-border px-3 py-1.5 text-xs font-bold text-forest hover:border-leaf hover:text-leaf" to={`/admin/orders/${order._id}`}>Chi tiết</Link>
                      {(NEXT_ACTIONS[order.status] || []).map(([status, label]) => (
                        <Button
                          key={status}
                          type="button"
                          variant={ACTION_STYLE[status] || 'secondary'}
                          className="px-3 py-1.5 text-xs"
                          disabled={busyId === order._id}
                          onClick={() => changeStatus(order, status)}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  );
}
