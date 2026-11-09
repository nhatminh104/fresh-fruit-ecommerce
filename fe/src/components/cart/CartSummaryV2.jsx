import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';

export default function CartSummary({ items }) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 500000 ? 0 : 30000;
  return <aside className="h-fit rounded-2xl bg-white p-6"><h2 className="font-bold text-forest">Tóm tắt đơn hàng</h2><div className="mt-5 space-y-3 border-b border-slate-100 pb-5 text-sm"><div className="flex justify-between"><span className="text-slate-500">Tạm tính</span><span>{formatCurrency(subtotal)}</span></div><div className="flex justify-between"><span className="text-slate-500">Phí giao hàng</span><span>{shipping ? formatCurrency(shipping) : 'Miễn phí'}</span></div></div><div className="mt-5 flex justify-between font-bold text-forest"><span>Tổng cộng</span><span>{formatCurrency(subtotal + shipping)}</span></div><Link to="/checkout" className="btn-primary mt-6 w-full justify-center">Tiến hành thanh toán</Link></aside>;
}
