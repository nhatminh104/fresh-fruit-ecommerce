import { Database, Lock, Mail, ShieldCheck, UserCheck } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';

const sections = [
  {
    icon: Database,
    title: '1. Thông tin chúng tôi thu thập',
    text: 'Khi bạn tạo tài khoản hoặc đặt hàng, Fresh có thể thu thập: họ tên, email, số điện thoại, địa chỉ giao hàng, lịch sử đơn hàng và đánh giá sản phẩm. Một số thông tin kỹ thuật như địa chỉ IP và thiết bị được ghi nhận để bảo mật và vận hành dịch vụ.'
  },
  {
    icon: ShieldCheck,
    title: '2. Mục đích sử dụng',
    text: 'Thông tin được sử dụng để: xử lý và giao đơn hàng, xác thực tài khoản, gửi thông báo trạng thái đơn, hỗ trợ khách hàng, cải thiện trải nghiệm mua sắm và bảo vệ hệ thống khỏi gian lận.'
  },
  {
    icon: Lock,
    title: '3. Bảo mật thông tin',
    text: 'Mật khẩu được mã hóa bằng cơ chế hash một chiều và không bao giờ lưu dưới dạng văn bản thuần. Token truy cập có thời hạn ngắn và có thể thu hồi. Chúng tôi áp dụng các biện pháp kỹ thuật hợp lý để bảo vệ dữ liệu.'
  },
  {
    icon: Mail,
    title: '4. Chia sẻ thông tin',
    text: 'Fresh không bán thông tin cá nhân của bạn. Thông tin chỉ được chia sẻ với đơn vị vận chuyển (để giao hàng), cổng thanh toán (khi có) và khi pháp luật yêu cầu.'
  },
  {
    icon: UserCheck,
    title: '5. Quyền của bạn',
    text: 'Bạn có thể xem, cập nhật thông tin cá nhân và địa chỉ trong mục Tài khoản. Bạn cũng có thể yêu cầu xóa tài khoản hoặc dữ liệu liên quan bằng cách liên hệ support@freshfruit.local.'
  },
  {
    icon: ShieldCheck,
    title: '6. Cookie & lưu trữ cục bộ',
    text: 'Fresh sử dụng token đăng nhập và giỏ hàng lưu trong trình duyệt để duy trì phiên làm việc. Không sử dụng cookie theo dõi quảng cáo của bên thứ ba.'
  },
  {
    title: '7. Thay đổi chính sách',
    text: 'Chính sách bảo mật có thể được cập nhật khi dịch vụ thay đổi. Phiên bản mới nhất luôn được đăng tại trang này.'
  },
  {
    title: '8. Liên hệ',
    text: 'Mọi câu hỏi về quyền riêng tư vui lòng gửi về support@freshfruit.local.'
  }
];

export default function PrivacyPolicy() {
  return (
    <PageContainer>
      <div className="max-w-3xl">
        <span className="eyebrow">Chính sách</span>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold tracking-tight text-ink">
          Chính sách bảo mật
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-muted">
          Fresh cam kết bảo vệ thông tin cá nhân của bạn và chỉ sử dụng dữ liệu trong phạm vi cần thiết
          để cung cấp dịch vụ.
        </p>
      </div>

      <div className="mt-10 space-y-4">
        {sections.map((s) => (
          <section key={s.title} className="rounded-3xl border border-surface-border bg-white p-6 sm:p-8 shadow-subtle">
            <h2 className="flex items-center gap-3 font-display text-lg font-bold text-ink">
              {s.icon && (
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <s.icon size={17} />
                </span>
              )}
              {s.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">{s.text}</p>
          </section>
        ))}
      </div>

      <p className="mt-8 text-xs text-ink-light">
        * Chính sách này áp dụng cho website demo Fresh Fruit.
      </p>
    </PageContainer>
  );
}
