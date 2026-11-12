import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';

const groups = [
  {
    title: 'Đặt hàng & thanh toán',
    items: [
      { q: 'Làm sao để đặt hàng trên Fresh?', a: 'Chọn sản phẩm yêu thích, thêm vào giỏ hàng, kiểm tra lại sản phẩm và địa chỉ giao hàng, sau đó xác nhận đơn. Bạn có thể thanh toán online (mô phỏng) hoặc chọn thanh toán khi nhận hàng (COD).' },
      { q: 'Các phương thức thanh toán gồm những gì?', a: 'Hiện Fresh hỗ trợ COD (thanh toán khi nhận hàng) và thanh toán online mô phỏng phục vụ demo. Thanh toán online chưa kết nối cổng thanh toán thật.' },
      { q: 'Làm sao để dùng mã giảm giá?', a: 'Nhập mã voucher ở bước thanh toán. Mã hợp lệ sẽ được hệ thống kiểm tra điều kiện đơn tối thiểu và áp dụng giảm giá ngay trên tổng tiền.' },
      { q: 'Tôi có thể hủy đơn hàng không?', a: 'Đơn ở trạng thái chờ xử lý hoặc đã xác nhận có thể hủy trong trang chi tiết đơn hàng. Sau khi hủy, tồn kho và lượt dùng voucher được hoàn lại tự động.' }
    ]
  },
  {
    title: 'Giao hàng & đổi trả',
    items: [
      { q: 'Phí vận chuyển được tính thế nào?', a: 'Đơn hàng từ 500.000đ được miễn phí giao hàng. Đơn dưới mức này áp dụng phí giao hàng tiêu chuẩn 30.000đ — hiển thị rõ trong bước thanh toán.' },
      { q: 'Khi nào tôi nhận được hàng?', a: 'Thời gian giao phụ thuộc khu vực và đơn vị vận chuyển. Bạn có thể theo dõi trạng thái đơn (chờ xử lý → đã xác nhận → đang giao → đã giao) trong trang Đơn hàng.' },
      { q: 'Sản phẩm bị dập nát thì xử lý sao?', a: 'Vui lòng liên hệ trong 24 giờ sau khi nhận hàng kèm ảnh minh họa. Fresh sẽ hỗ trợ đổi sản phẩm hoặc xử lý theo Chính sách đổi trả.' },
      { q: 'Fresh có giao hàng toàn quốc không?', a: 'Có. Bạn nhập địa chỉ giao hàng khi checkout; hệ thống không giới hạn theo tỉnh thành.' }
    ]
  },
  {
    title: 'Tài khoản & bảo mật',
    items: [
      { q: 'Tôi có thể mua hàng mà không cần tài khoản không?', a: 'Các chức năng giỏ hàng, đặt hàng, voucher và đánh giá yêu cầu đăng nhập để đảm bảo đơn hàng gắn đúng với tài khoản của bạn.' },
      { q: 'Quên mật khẩu thì làm sao?', a: 'Vào trang Đăng nhập → Quên mật khẩu và làm theo hướng dẫn đặt lại mật khẩu qua email.' },
      { q: 'Làm sao để cập nhật địa chỉ giao hàng?', a: 'Vào Tài khoản → Địa chỉ để thêm, sửa hoặc xóa địa chỉ. Bạn có thể đặt một địa chỉ mặc định cho tiện lợi.' },
      { q: 'Đánh giá sản phẩm khi nào được hiển thị?', a: 'Đánh giá chỉ được gửi sau khi đơn hàng đã giao thành công. Đánh giá mới cần được quản trị viên duyệt trước khi hiển thị công khai.' }
    ]
  }
];

function AccordionItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-surface-border last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-bold text-ink">{item.q}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-brand-600 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <p className="pb-4 text-sm leading-relaxed text-ink-muted">{item.a}</p>}
    </div>
  );
}

export default function FAQ() {
  return (
    <PageContainer>
      <div className="max-w-3xl">
        <span className="eyebrow">Trợ giúp</span>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold tracking-tight text-ink">
          Câu hỏi thường gặp
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-muted">
          Tổng hợp các thắc mắc phổ biến về đặt hàng, thanh toán, giao hàng và tài khoản trên Fresh.
          Không tìm thấy câu trả lời? <a href="mailto:support@freshfruit.local" className="font-bold text-brand-600 hover:underline">Liên hệ hỗ trợ</a>.
        </p>
      </div>

      <div className="mt-10 space-y-8">
        {groups.map((group) => (
          <section key={group.title}>
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-ink">
              <HelpCircle size={18} className="text-brand-600" />
              {group.title}
            </h2>
            <div className="mt-3 rounded-3xl border border-surface-border bg-white px-6 shadow-subtle">
              {group.items.map((item) => (
                <AccordionItem key={item.q} item={item} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageContainer>
  );
}
