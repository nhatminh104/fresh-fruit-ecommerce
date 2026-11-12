import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Ban, CreditCard } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import OrderStatusBadge from '../../components/order/OrderStatusBadge';
import ProductImage from '../../components/common/ProductImage';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { cancelOrder, getOrder } from '../../services/orderService';
import { createPayment } from '../../services/paymentService';
import { formatCurrency } from '../../utils/formatCurrency';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../contexts/ToastContext';

const CANCELLABLE = ['pending', 'confirmed'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [paying, setPaying] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchParams.get('payment') === 'failed') {
      toast.error('Thanh toán chưa hoàn tất. Bạn có thể thử thanh toán lại.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getOrder(id)
      .then(({ data }) => setOrder(data.data))
      .catch((err) => setError(err.response?.data?.message || 'Không thể tải đơn hàng.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const { data } = await cancelOrder(id);
      setOrder(data.data);
      toast.success('Đã hủy đơn hàng.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Không thể hủy đơn hàng.'));
    } finally {
      setCancelling(false);
      setConfirmCancel(false);
    }
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      await createPayment({ orderId: order._id, method: order.paymentMethod });
      const { data } = await getOrder(id);
      setOrder(data.data);
      toast.success('Thanh toán thành công.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Không thể thanh toán. Vui lòng thử lại.'));
    } finally {
      setPaying(false);
    }
  };

  if (loading)
    return (
      <PageContainer>
        <Loading />
      </PageContainer>
    );
  if (error || !order)
    return (
      <PageContainer>
        <ErrorMessage message={error || 'Không tìm thấy đơn hàng.'} />
      </PageContainer>
    );

  const address = order.shippingAddress || {};
  const canCancel = CANCELLABLE.includes(order.status) && order.paymentStatus !== 'paid';
  const canPay =
    order.paymentMethod === 'mock' &&
    ['pending', 'failed'].includes(order.paymentStatus) &&
    !['cancelled', 'delivered'].includes(order.status);

  return (
    <PageContainer>
      <Link to="/orders" className="text-sm font-bold text-leaf">
        ← Đơn hàng của tôi
      </Link>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Chi tiết đơn hàng</p>
          <h1 className="mt-3 font-display text-5xl text-forest">{order.orderCode}</h1>
          <p className="mt-2 text-sm text-slate-500">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          {canPay && (
            <Button onClick={handlePay} loading={paying}>
              <CreditCard size={14} /> {order.paymentStatus === 'failed' ? 'Thanh toán lại' : 'Thanh toán ngay'}
            </Button>
          )}
          {canCancel && (
            <Button variant="danger" size="sm" onClick={() => setConfirmCancel(true)} loading={cancelling}>
              <Ban size={14} /> Hủy đơn
            </Button>
          )}
        </div>
      </div>
      {order.status === 'cancelled' && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Đơn hàng đã bị hủy
          {order.cancelledAt ? ` lúc ${new Date(order.cancelledAt).toLocaleString('vi-VN')}` : ''}.
        </p>
      )}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-surface-border bg-white p-6 shadow-subtle">
          <h2 className="font-display text-3xl text-forest">Sản phẩm</h2>
          <div className="mt-4 divide-y divide-slate-100">
            {order.items.map((item) => (
              <div className="flex items-center gap-4 py-4" key={String(item.product)}>
                <ProductImage
                  className="h-16 w-16 shrink-0 rounded-xl border border-surface-border"
                  src={item.image}
                  alt={item.productName}
                />
                <div className="flex-1">
                  <p className="font-bold text-forest">{item.productName}</p>
                  <p className="text-sm text-slate-500">
                    {item.quantity} × {formatCurrency(item.price)}
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
          <div className="rounded-2xl border border-surface-border bg-white p-6 shadow-subtle">
            <h2 className="font-bold text-forest">Giao đến</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {address.recipientName} · {address.phone}
              <br />
              {address.streetAddress}, {address.ward}, {address.district}, {address.province}
            </p>
          </div>
          <div className="rounded-2xl border border-surface-border bg-white p-6 shadow-subtle">
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
                <span>Trạng thái thanh toán</span>
                <span className="font-semibold">
                  {order.paymentStatus === 'paid'
                    ? 'Đã thanh toán'
                    : order.paymentStatus === 'failed'
                      ? 'Thanh toán thất bại'
                      : order.paymentStatus === 'refunded'
                        ? 'Đã hoàn tiền'
                        : 'Chưa thanh toán'}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Phương thức</span>
                <span>
                  {order.paymentMethod === 'mock' ? 'Thanh toán online (demo)' : 'Thanh toán khi nhận hàng'}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={handleCancel}
        title="Hủy đơn hàng"
        message="Bạn có chắc muốn hủy đơn hàng này? Tồn kho và mã giảm giá sẽ được hoàn lại."
        confirmLabel="Hủy đơn"
        danger
      />
    </PageContainer>
  );
}
