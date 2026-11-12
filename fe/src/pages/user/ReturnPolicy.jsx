import { AlertTriangle, CheckCircle2, PackageX, RefreshCcw } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';

const conditions = [
  'Sản phẩm bị dập nát, hư hỏng hoặc không đúng mô tả so với đơn hàng.',
  'Sản phẩm không đúng loại hoặc sai số lượng so với đơn đã đặt.',
  'Liên hệ hỗ trợ trong vòng 24 giờ kể từ khi nhận hàng.'
];

const steps = [
  { icon: AlertTriangle, title: '1. Liên hệ', text: 'Gửi email support@freshfruit.local hoặc liên hệ qua trang Liên hệ, đính kèm mã đơn hàng và ảnh/video minh họa vấn đề.' },
  { icon: CheckCircle2, title: '2. Xác nhận', text: 'Fresh kiểm tra thông tin đơn hàng và bằng chứng, sau đó xác nhận đủ điều kiện đổi trả.' },
  { icon: RefreshCcw, title: '3. Đổi / hoàn', text: 'Tùy tình trạng sản phẩm, Fresh sẽ gửi sản phẩm thay thế hoặc hoàn tiền vào phương thức thanh toán ban đầu.' },
  { icon: PackageX, title: '4. Không áp dụng', text: 'Sản phẩm đã qua sử dụng, hết hạn hoặc lỗi do bảo quản không đúng cách của khách hàng không thuộc diện đổi trả.' }
];

export default function ReturnPolicy() {
  return (
    <PageContainer>
      <div className="max-w-3xl">
        <span className="eyebrow">Chính sách</span>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold tracking-tight text-ink">
          Chính sách đổi trả
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-muted">
          Fresh cam kết mang đến trái cây chất lượng. Nếu sản phẩm có vấn đề, chúng tôi hỗ trợ đổi trả
          nhanh chóng và minh bạch.
        </p>
      </div>

      <section className="mt-10 rounded-3xl border border-amber-200 bg-amber-50/60 p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold text-ink">Điều kiện đổi trả</h2>
        <ul className="mt-4 space-y-2.5">
          {conditions.map((c) => (
            <li key={c} className="flex items-start gap-3 text-sm text-ink">
              <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-brand-600" />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {steps.map(({ icon: Icon, title, text }) => (
          <article key={title} className="rounded-3xl border border-surface-border bg-white p-6 shadow-subtle">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                <Icon size={18} />
              </div>
              <h3 className="font-display text-base font-bold text-ink">{title}</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">{text}</p>
          </article>
        ))}
      </div>

      <p className="mt-8 text-xs text-ink-light">
        * Quy trình trên là chính sách minh họa của website demo Fresh Fruit.
      </p>
    </PageContainer>
  );
}
