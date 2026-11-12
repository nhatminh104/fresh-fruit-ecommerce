import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';

const sections = [
  {
    title: '1. Giới thiệu dịch vụ',
    text: 'Fresh là nền tảng thương mại điện tử bán trái cây trực tuyến. Khi sử dụng dịch vụ, bạn đồng ý với các điều khoản dưới đây. Nếu không đồng ý, vui lòng ngừng sử dụng dịch vụ.'
  },
  {
    title: '2. Tài khoản người dùng',
    text: 'Bạn chịu trách nhiệm cung cấp thông tin đăng ký chính xác và bảo mật thông tin đăng nhập. Mỗi tài khoản chỉ dùng cho một người. Fresh có quyền khóa tài khoản nếu phát hiện hành vi gian lận hoặc vi phạm điều khoản.'
  },
  {
    title: '3. Đặt hàng & thanh toán',
    text: 'Đơn hàng được xác nhận khi hệ thống tiếp nhận yêu cầu hợp lệ và trừ tồn kho thành công. Giá và tổng tiền do hệ thống tính toán — thông tin giá do người dùng nhập không được chấp nhận. Fresh hỗ trợ COD và thanh toán online mô phỏng.'
  },
  {
    title: '4. Tồn kho & hủy đơn',
    text: 'Tồn kho được quản lý theo thời gian thực. Đơn hàng chỉ ở trạng thái chờ xử lý hoặc đã xác nhận mới có thể hủy. Khi hủy, tồn kho và lượt dùng voucher được hoàn lại tự động.'
  },
  {
    title: '5. Voucher & khuyến mãi',
    text: 'Mỗi mã voucher có điều kiện sử dụng, thời hạn và giới hạn lượt dùng riêng. Fresh có quyền điều chỉnh hoặc thu hồi chương trình khuyến mãi. Lạm dụng voucher (tạo đơn ảo, hoàn tiền trái phép) có thể dẫn đến khóa tài khoản.'
  },
  {
    title: '6. Sở hữu trí tuệ',
    text: 'Toàn bộ nội dung trên Fresh — hình ảnh, mô tả sản phẩm, giao diện, mã nguồn — thuộc quyền sở hữu của Fresh hoặc đối tác cấp phép. Không sao chép, phân phối lại khi chưa được phép.'
  },
  {
    title: '7. Giới hạn trách nhiệm',
    text: 'Fresh nỗ lực đảm bảo thông tin sản phẩm chính xác nhưng không chịu trách nhiệm cho sai lệch do yếu tố khách quan (giá thị trường, tình trạng mùa vụ). Trường hợp bất khả kháng (thiên tai, dịch bệnh), Fresh sẽ thông báo và thỏa thuận phương án xử lý với khách hàng.'
  },
  {
    title: '8. Thay đổi điều khoản',
    text: 'Điều khoản có thể được cập nhật. Phiên bản mới nhất luôn hiển thị tại trang này. Việc tiếp tục sử dụng dịch vụ sau khi cập nhật đồng nghĩa với chấp nhận điều khoản mới.'
  }
];

function Section({ title, text }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-surface-border last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-bold text-ink">{title}</span>
        <ChevronDown size={16} className={`shrink-0 text-brand-600 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="pb-4 text-sm leading-relaxed text-ink-muted">{text}</p>}
    </div>
  );
}

export default function Terms() {
  return (
    <PageContainer>
      <div className="max-w-3xl">
        <span className="eyebrow">Pháp lý</span>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold tracking-tight text-ink">
          Điều khoản sử dụng
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-muted">
          Vui lòng đọc kỹ các điều khoản trước khi sử dụng dịch vụ Fresh.
        </p>
      </div>

      <div className="mt-10 rounded-3xl border border-surface-border bg-white px-6 shadow-subtle">
        {sections.map((s) => (
          <Section key={s.title} {...s} />
        ))}
      </div>

      <p className="mt-8 text-xs text-ink-light">
        * Điều khoản áp dụng cho website demo Fresh Fruit — đồ án tốt nghiệp.
      </p>
    </PageContainer>
  );
}
