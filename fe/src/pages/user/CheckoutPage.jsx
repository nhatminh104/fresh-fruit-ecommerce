import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Tag } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import { useCart } from '../../hooks/useCart';
import { createAddress, getAddresses } from '../../services/addressService';
import { createOrder } from '../../services/orderService';
import { createPayment } from '../../services/paymentService';
import { getVouchers } from '../../services/voucherService';
import { formatCurrency } from '../../utils/formatCurrency';
import { getErrorMessage } from '../../utils/errorMessage';

const blankAddress = {
  recipientName: '',
  phone: '',
  province: '',
  district: '',
  ward: '',
  streetAddress: '',
};
const ADDRESS_FIELDS = [
  ['recipientName', 'Người nhận'],
  ['phone', 'Số điện thoại'],
  ['province', 'Tỉnh / thành phố'],
  ['district', 'Quận / huyện'],
  ['ward', 'Phường / xã'],
  ['streetAddress', 'Địa chỉ cụ thể'],
];
const PAYMENT_METHODS = [
  ['cod', 'Thanh toán khi nhận hàng'],
  ['mock', 'Thanh toán online (demo)'],
];

function estimateDiscount(voucher, subtotal) {
  if (!voucher || subtotal < (voucher.minOrderValue || 0)) return 0;
  const raw =
    voucher.discountType === 'percent'
      ? (subtotal * Number(voucher.discountValue)) / 100
      : Number(voucher.discountValue);
  const capped = voucher.maxDiscount ? Math.min(raw, Number(voucher.maxDiscount)) : raw;
  return Math.min(capped, subtotal);
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, loading: cartLoading, clear: clearCart } = useCart();
  const idempotencyKey = useRef(`web-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  const [addresses, setAddresses] = useState([]);
  const [selected, setSelected] = useState('');
  const [form, setForm] = useState(blankAddress);
  const [newAddress, setNewAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [note, setNote] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      getAddresses().then(({ data }) => {
        const next = data.data || [];
        setAddresses(next);
        setSelected(next.find((address) => address.isDefault)?._id || next[0]?._id || '');
      }),
      getVouchers()
        .then(({ data }) => setVouchers(data.data || []))
        .catch(() => {}),
    ])
      .catch((err) => setError(err.response?.data?.message || 'Không thể tải địa chỉ.'))
      .finally(() => setLoading(false));
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const voucherEligible = (voucher) => {
    if (!voucher) return false;
    const now = Date.now();
    if (voucher.isActive === false) return false;
    if (voucher.startDate && new Date(voucher.startDate).getTime() > now) return false;
    if (voucher.endDate && new Date(voucher.endDate).getTime() < now) return false;
    if (voucher.usageLimit && (voucher.usedCount || 0) >= voucher.usageLimit) return false;
    if (subtotal < (voucher.minOrderValue || 0)) return false;
    return true;
  };

  const applyVoucher = (voucher) => {
    setVoucherError('');
    if (!voucher) {
      setVoucherError('Mã voucher không tồn tại.');
      return;
    }
    if (!voucherEligible(voucher)) {
      setVoucherError('Voucher không khả dụng: kiểm tra thời hạn, lượt dùng và đơn tối thiểu.');
      return;
    }
    setAppliedVoucher(voucher);
    setVoucherCode(voucher.code);
  };

  const clearVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    setVoucherError('');
  };

  const totals = useMemo(() => {
    const shipping = subtotal >= 500000 ? 0 : 30000;
    const discount = estimateDiscount(appliedVoucher, subtotal);
    return { subtotal, shipping, discount, total: Math.max(0, subtotal - discount + shipping), voucher: appliedVoucher };
  }, [subtotal, appliedVoucher]);

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      let address = addresses.find((item) => item._id === selected);
      if (newAddress) {
        const response = await createAddress(form);
        address = response.data.data;
      }
      if (!address) throw new Error('Vui lòng chọn hoặc tạo địa chỉ giao hàng.');
      const response = await createOrder({
        items: items.map((item) => ({ product: item.id, quantity: item.quantity })),
        shippingAddress: address,
        paymentMethod,
        note,
        voucherCode: appliedVoucher?.code || undefined,
        idempotencyKey: idempotencyKey.current,
      });
      const order = response.data.data;
      // Backend đã xóa giỏ khi tạo đơn — đồng bộ context để giỏ không "hồi sinh"
      await clearCart().catch(() => {});
      if (paymentMethod === 'mock') {
        try {
          await createPayment({ orderId: order._id, method: paymentMethod });
          navigate(`/payment-result?status=success&orderId=${order._id}`);
        } catch {
          // Đơn đã tạo thành công — chuyển đến chi tiết đơn để thanh toán lại
          navigate(`/orders/${order._id}?payment=failed`);
        }
      } else {
        navigate(`/payment-result?status=pending&orderId=${order._id}`);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tạo đơn hàng.'));
    } finally {
      setSaving(false);
    }
  }

  if (cartLoading || loading)
    return (
      <PageContainer>
        <Loading />
      </PageContainer>
    );
  if (!items.length)
    return (
      <PageContainer>
        <EmptyState
          title="Giỏ hàng đang trống"
          action={
            <Link className="btn-primary" to="/products">
              Xem sản phẩm
            </Link>
          }
        />
      </PageContainer>
    );

  return (
    <PageContainer>
      <p className="eyebrow">Đặt hàng</p>
      <h1 className="mt-3 font-display text-5xl text-forest">Thanh toán</h1>
      {error && (
        <div className="mt-6">
          <ErrorMessage message={error} />
        </div>
      )}
      <form className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]" onSubmit={submit}>
        <div className="space-y-6">
          <section className="rounded-2xl border border-surface-border bg-white p-6 shadow-subtle">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-3xl text-forest">Địa chỉ giao hàng</h2>
              <button
                type="button"
                className="text-sm font-bold text-leaf"
                onClick={() => setNewAddress((value) => !value)}
              >
                {newAddress ? 'Chọn địa chỉ có sẵn' : 'Thêm địa chỉ mới'}
              </button>
            </div>
            {newAddress ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {ADDRESS_FIELDS.map(([field, label]) => (
                  <Input key={field} label={label} value={form[field]} onChange={update(field)} required />
                ))}
              </div>
            ) : addresses.length ? (
              <div className="mt-5 grid gap-3">
                {addresses.map((address) => (
                  <label
                    key={address._id}
                    className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 p-4 has-[:checked]:border-leaf has-[:checked]:bg-green-50/40"
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selected === address._id}
                      onChange={() => setSelected(address._id)}
                    />
                    <span>
                      <strong>
                        {address.recipientName} · {address.phone}
                      </strong>
                      <span className="mt-1 block text-sm text-slate-500">
                        {address.streetAddress}, {address.ward}, {address.district}, {address.province}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm text-slate-500">Bạn chưa có địa chỉ. Hãy thêm địa chỉ mới.</p>
            )}
          </section>

          <section className="rounded-2xl border border-surface-border bg-white p-6 shadow-subtle">
            <h2 className="font-display text-3xl text-forest">Thanh toán</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {PAYMENT_METHODS.map(([value, label]) => (
                <label
                  key={value}
                  className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 p-4 has-[:checked]:border-leaf has-[:checked]:bg-green-50/40"
                >
                  <input
                    type="radio"
                    name="payment"
                    value={value}
                    checked={paymentMethod === value}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                  />
                  <span className="text-sm font-semibold">{label}</span>
                </label>
              ))}
            </div>
            <div className="mt-5">
              <span className="text-sm font-medium text-slate-600">Mã giảm giá</span>
              {appliedVoucher ? (
                <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-leaf bg-green-50 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-forest">{appliedVoucher.code}</p>
                    <p className="text-xs text-slate-500">
                      Giảm{' '}
                      {appliedVoucher.discountType === 'percent'
                        ? `${appliedVoucher.discountValue}%`
                        : formatCurrency(appliedVoucher.discountValue)}
                      {appliedVoucher.minOrderValue
                        ? ` · Đơn tối thiểu ${formatCurrency(appliedVoucher.minOrderValue)}`
                        : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={clearVoucher}
                    className="shrink-0 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-white"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative mt-2">
                    <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(event) => {
                        setVoucherCode(event.target.value.toUpperCase());
                        setVoucherError('');
                      }}
                      placeholder="Nhập mã voucher (nếu có)"
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-leaf"
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      className="px-4 py-2 text-sm"
                      onClick={() =>
                        applyVoucher(vouchers.find((v) => v.code === voucherCode.trim().toUpperCase()))
                      }
                      disabled={!voucherCode.trim()}
                    >
                      Áp dụng
                    </Button>
                    {voucherCode.trim() && (
                      <button
                        type="button"
                        onClick={clearVoucher}
                        className="text-xs font-semibold text-slate-500 hover:text-ink"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                  {voucherError && <p className="mt-2 text-xs font-semibold text-red-600">{voucherError}</p>}
                </>
              )}
              {!appliedVoucher && vouchers.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {vouchers
                    .filter((v) => voucherEligible(v))
                    .slice(0, 4)
                    .map((voucher) => (
                      <button
                        key={voucher._id}
                        type="button"
                        onClick={() => applyVoucher(voucher)}
                        className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 transition-colors hover:bg-amber-100"
                      >
                        {voucher.code} ·{' '}
                        {voucher.discountType === 'percent'
                          ? `-${voucher.discountValue}%`
                          : `-${formatCurrency(voucher.discountValue)}`}
                      </button>
                    ))}
                </div>
              )}
            </div>
            <label className="mt-5 block text-sm font-medium text-slate-600">
              Ghi chú đơn hàng
              <textarea
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-leaf"
                rows="3"
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </label>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-surface-border bg-white p-6 shadow-subtle">
          <h2 className="font-bold text-forest">Tóm tắt đơn hàng</h2>
          <div className="mt-5 space-y-3 border-b border-slate-100 pb-5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Tạm tính</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-leaf">
                <span>Giảm giá (dự kiến)</span>
                <span>-{formatCurrency(totals.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Phí giao hàng</span>
              <span>{totals.shipping ? formatCurrency(totals.shipping) : 'Miễn phí'}</span>
            </div>
          </div>
          <div className="mt-5 flex justify-between font-bold text-forest">
            <span>Tổng cộng</span>
            <span>{formatCurrency(totals.total)}</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Tổng tiền cuối cùng do hệ thống xác nhận khi tạo đơn.
          </p>
          <Button className="mt-6 w-full" type="submit" disabled={saving}>
            {saving ? 'Đang tạo đơn...' : 'Đặt hàng'}
          </Button>
        </aside>
      </form>
    </PageContainer>
  );
}
