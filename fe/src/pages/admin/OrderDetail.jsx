import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import OrderStatusBadge from '../../components/order/OrderStatusBadge';
import ProductImage from '../../components/common/ProductImage';
import api from '../../services/api';
import { updateAdmin } from '../../services/adminService';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../contexts/ToastContext';

const NEXT_ACTIONS = {
  pending: [
    ['confirmed', 'Xác nhận đơn'],
    ['cancelled', 'Hủy đơn'],
  ],
  confirmed: [
    ['shipping', 'Chuyển sang đang giao'],
    ['cancelled', 'Hủy đơn'],
  ],
  shipping: [['delivered', 'Đánh dấu đã giao']],
  delivered: [],
  cancelled: [],
};

export default function OrderDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  const load = () =>
    api
      .get(`/admin/orders/${id}`)
      .then((response) => setOrder(response.data.data))
      .catch((requestError) => setError(getErrorMessage(requestError, 'Không thể tải đơn hàng.')));

  useEffect(() => {
    load();
  }, [id]);

  const changeStatus = async () => {
    if (!pendingStatus) return;
    setBusy(true);
    try {
      await updateAdmin('orders', id, { status: pendingStatus.status });
      toast.success('Đã cập nhật trạng thái đơn hàng.');
      await load();
    } catch (actionError) {
      toast.error(getErrorMessage(actionError, 'Không thể cập nhật trạng thái.'));
    } finally {
      setBusy(false);
      setPendingStatus(null);
    }
  };

  if (error)
    return (
      <PageContainer>
        <ErrorMessage message={error} />
      </PageContainer>
    );
  if (!order)
    return (
      <PageContainer>
        <Loading />
      </PageContainer>
    );

  const address = order.shippingAddress || {};

  return (
    <PageContainer>
      <Link className="text-sm font-semibold text-forest hover:text-leaf" to="/admin/orders">
        ← Quay lại danh sách
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Fresh admin</p>
          <h1 className="mt-3 font-display text-5xl text-forest">{order.orderCode}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {order.user?.fullName} ({order.user?.email}) · {formatDate(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(NEXT_ACTIONS[order.status] || []).map(([status, label]) => (
          <Button
            key={status}
            type="button"
            variant={status === 'cancelled' ? 'danger' : 'primary'}
            disabled={busy}
            onClick={() => setPendingStatus({ status, label })}
          >
            {label}
          </Button>
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(pendingStatus)}
        onClose={() => setPendingStatus(null)}
        onConfirm={changeStatus}
        title="Cập nhật trạng thái đơn hàng"
        message={pendingStatus ? `Chuyển đơn ${order?.orderCode} sang "${pendingStatus.label}"?` : ''}
        confirmLabel={pendingStatus?.label || 'Xác nhận'}
        danger={pendingStatus?.status === 'cancelled'}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="rounded-2xl bg-white p-6">
          <h2 className="font-display text-3xl text-forest">Sản phẩm</h2>
          <div className="mt-4 divide-y divide-slate-100">
            {order.items.map((item) => (
              <div className="flex items-center gap-4 py-4" key={String(item.product)}>
                <ProductImage
                  className="h-14 w-14 shrink-0 rounded-xl border border-surface-border"
                  src={item.image}
                  alt={item.productName}
                />
                <div className="flex-1">
                  <p className="font-bold text-forest">{item.productName}</p>
                  <p className="text-sm text-slate-500">
                    {item.quantity} × {formatCurrency(item.price)} / {item.unit}
                  </p>
                </div>
                <strong>{formatCurrency(item.subtotal)}</strong>
              </div>
            ))}
          </div>
          {order.note && (
            <p className="mt-4 rounded-xl bg-surface-subtle p-4 text-sm text-slate-600">
              Ghi chú: {order.note}
            </p>
          )}
        </section>
        <aside className="h-fit space-y-5">
          <div className="rounded-2xl bg-white p-6">
            <h2 className="font-bold text-forest">Giao đến</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {address.recipientName} · {address.phone}
              <br />
              {address.streetAddress}, {address.ward}, {address.district}, {address.province}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6">
            <h2 className="font-bold text-forest">Thanh toán</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Tạm tính</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-leaf">
                  <span>Giảm giá</span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Phí giao hàng</span>
                <span>{formatCurrency(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between border-t pt-3 font-bold text-forest">
                <span>Tổng cộng</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Phương thức</span>
                <span>
                  {order.paymentMethod === 'mock' ? 'Online (demo)' : 'COD'} · {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}
