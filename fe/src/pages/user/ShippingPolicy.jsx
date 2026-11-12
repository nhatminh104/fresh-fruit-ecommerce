import { Clock, MapPin, PackageCheck, Truck } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';

const sections = [
  {
    title: 'Phạm vi giao hàng',
    text: 'Fresh giao hàng đến các tỉnh thành trên toàn quốc. Địa chỉ giao hàng được xác nhận và lưu trong tài khoản của bạn để thuận tiện cho các lần đặt sau.'
  },
  {
    title: 'Phí vận chuyển',
    text: 'Đơn hàng từ 500.000đ được miễn phí giao hàng. Đơn dưới 500.000đ áp dụng phí giao hàng tiêu chuẩn 30.000đ. Phí ship được hiển thị rõ ràng ở bước thanh toán trước khi bạn xác nhận đơn.'
  },
  {
    title: 'Đóng gói & bảo quản',
    text: 'Trái cây được phân loại theo độ chín, lót chống sốc trong thùng và bảo quản lạnh (khi cần) trước khi bàn giao đơn vị vận chuyển để giữ độ tươi tối đa.'
  },
  {
    title: 'Theo dõi đơn hàng',
    text: 'Sau khi đặt hàng, bạn có thể theo dõi trạng thái trong mục Đơn hàng: Chờ xử lý → Đã xác nhận → Đang giao → Đã giao. Mỗi thay đổi trạng thái đều được cập nhật trên hệ thống.'
  },
  {
    title: 'Thời gian giao dự kiến',
    text: 'Thời gian giao phụ thuộc khu vực và đơn vị vận chuyển. Đơn nội thành thường được xử lý nhanh hơn đơn liên tỉnh. Fresh sẽ cố gắng giao đúng hẹn và thông báo khi có thay đổi.'
  },
  {
    title: 'Lưu ý khi nhận hàng',
    text: 'Vui lòng kiểm tra sản phẩm ngay khi nhận. Nếu có dấu hiệu hư hỏng hoặc sai đơn, hãy từ chối nhận hoặc liên hệ trong 24 giờ để được hỗ trợ đổi trả theo chính sách.'
  }
];

const steps = [
  { icon: PackageCheck, title: 'Đóng gói', text: 'Kiểm tra đơn, đóng thùng chống sốc và bàn giao vận chuyển.' },
  { icon: Truck, title: 'Vận chuyển', text: 'Đơn vị vận chuyển giao hàng theo địa chỉ đã xác nhận.' },
  { icon: MapPin, title: 'Giao tận nơi', text: 'Nhận hàng, kiểm tra sản phẩm và thanh toán nếu chọn COD.' },
  { icon: Clock, title: 'Hỗ trợ sau bán', text: 'Liên hệ trong 24h nếu sản phẩm có vấn đề để được đổi trả.' }
];

export default function ShippingPolicy() {
  return (
    <PageContainer>
      <div className="max-w-3xl">
        <span className="eyebrow">Chính sách</span>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold tracking-tight text-ink">
          Chính sách giao hàng
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-muted">
          Cam kết giao trái cây tươi đến tay bạn an toàn, đúng hẹn và minh bạch về phí vận chuyển.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl border border-surface-border bg-white p-5 text-center shadow-subtle">
            <div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              <Icon size={20} />
            </div>
            <h3 className="mt-3 text-sm font-bold text-ink">{title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{text}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 space-y-4">
        {sections.map((s) => (
          <section key={s.title} className="rounded-3xl border border-surface-border bg-white p-6 sm:p-8 shadow-subtle">
            <h2 className="font-display text-xl font-bold text-ink">{s.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.text}</p>
          </section>
        ))}
      </div>

      <p className="mt-8 text-xs text-ink-light">
        * Chính sách áp dụng cho website demo Fresh Fruit; thông tin phí ship khớp với cấu hình hệ thống hiện tại.
      </p>
    </PageContainer>
  );
}
