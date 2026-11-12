import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';

export default function PaymentResultPage() {
  const [params] = useSearchParams();
  const status = params.get('status') || 'pending';
  const success = status === 'success';
  const pending = status === 'pending';
  const orderId = params.get('orderId');

  return (
    <PageContainer>
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-10 text-center shadow-card">
        {success ? (
          <CheckCircle2 size={56} className="mx-auto text-leaf" aria-hidden="true" />
        ) : pending ? (
          <CheckCircle2 size={56} className="mx-auto text-accent" aria-hidden="true" />
        ) : (
          <XCircle size={56} className="mx-auto text-red-500" aria-hidden="true" />
        )}
        <h1 className="mt-5 font-display text-4xl text-forest">
          {success ? 'Thanh toán thành công' : pending ? 'Đặt hàng thành công' : 'Thanh toán chưa hoàn tất'}
        </h1>
        <p className="mt-4 text-slate-500">
          {success
            ? 'Đơn hàng của bạn đã được ghi nhận. Chúng tôi sẽ liên hệ để xác nhận và giao hàng sớm nhất.'
            : pending
              ? 'Đơn hàng của bạn đã được tạo. Vui lòng thanh toán khi nhận hàng.'
              : 'Bạn có thể kiểm tra lại đơn hàng và thử thanh toán lại sau.'}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {orderId && (
            <Link className="btn-secondary" to={`/orders/${orderId}`}>
              Xem chi tiết đơn hàng
            </Link>
          )}
          <Link className="btn-primary" to="/orders">
            Đơn hàng của tôi
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
