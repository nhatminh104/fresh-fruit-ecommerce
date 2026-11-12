import { useState } from 'react';
import { Clock, HelpCircle, Mail, Package, RotateCcw, Send } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';

const topics = [
  {
    icon: Package,
    title: 'Theo dõi đơn hàng',
    text: 'Đăng nhập và vào mục Đơn hàng để xem trạng thái mới nhất của đơn. Nếu cần hỗ trợ thêm, gửi mã đơn hàng kèm mô tả vấn đề.'
  },
  {
    icon: RotateCcw,
    title: 'Đổi trả sản phẩm',
    text: 'Liên hệ trong 24 giờ sau khi nhận hàng nếu sản phẩm hư hỏng hoặc không đúng đơn. Xem chi tiết tại Chính sách đổi trả.'
  },
  {
    icon: HelpCircle,
    title: 'Câu hỏi chung',
    text: 'Các câu hỏi về thanh toán, voucher, tài khoản được tổng hợp tại trang Câu hỏi thường gặp.'
  },
  {
    icon: Clock,
    title: 'Thời gian phản hồi',
    text: 'Chúng tôi phản hồi email hỗ trợ trong giờ hành chính. Đơn hàng có vấn đề sẽ được ưu tiên xử lý.'
  }
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`[Fresh] ${form.subject || 'Liên hệ hỗ trợ'}`);
    const body = encodeURIComponent(`Họ tên: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.location.href = `mailto:support@freshfruit.local?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <PageContainer>
      <div className="max-w-3xl">
        <span className="eyebrow">Liên hệ</span>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold tracking-tight text-ink">
          Fresh luôn sẵn sàng hỗ trợ
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-muted">
          Có thắc mắc về đơn hàng, sản phẩm hay tài khoản? Gửi email cho chúng tôi — đội ngũ Fresh sẽ
          phản hồi sớm nhất có thể.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-surface-border bg-white p-6 sm:p-8 shadow-subtle">
          <h2 className="font-display text-xl font-bold text-ink">Gửi tin nhắn</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-ink-muted" htmlFor="contact-name">Họ tên</label>
              <input
                id="contact-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-surface-border bg-surface-subtle px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-50"
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-ink-muted" htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-surface-border bg-surface-subtle px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-50"
                placeholder="ban@example.com"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-bold text-ink-muted" htmlFor="contact-subject">Chủ đề</label>
              <input
                id="contact-subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full rounded-xl border border-surface-border bg-surface-subtle px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-50"
                placeholder="VD: Hỏi về đơn hàng FF-123"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-bold text-ink-muted" htmlFor="contact-message">Nội dung</label>
              <textarea
                id="contact-message"
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-xl border border-surface-border bg-surface-subtle px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-50"
                placeholder="Mô tả vấn đề hoặc câu hỏi của bạn..."
              />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button type="submit">
              <Send size={15} />
              <span>{sent ? 'Đã mở email — vui lòng gửi' : 'Gửi qua email'}</span>
            </Button>
            <p className="text-xs text-ink-light">Form sẽ mở ứng dụng email của bạn với nội dung đã soạn sẵn.</p>
          </div>
        </form>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-brand-200 bg-brand-50/60 p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-600 text-white">
                <Mail size={19} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-brand-700">Email hỗ trợ</p>
                <a href="mailto:support@freshfruit.local" className="text-sm font-bold text-ink hover:text-brand-600">
                  support@freshfruit.local
                </a>
              </div>
            </div>
          </div>
          {topics.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-surface-border bg-white p-5 shadow-subtle">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-subtle text-brand-700">
                  <Icon size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink">{title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-ink-muted">{text}</p>
                </div>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </PageContainer>
  );
}
