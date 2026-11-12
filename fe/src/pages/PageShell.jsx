import { Link } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
const copy = {
  'Về Fresh':
    'Fresh chọn những sản phẩm tươi ngon, rõ nguồn gốc và chăm chút trải nghiệm từ vườn đến bàn ăn.',
  'Liên hệ':
    'Đội ngũ Fresh luôn sẵn sàng hỗ trợ bạn qua email support@freshfruit.local hoặc hotline 1900 0000.',
  'Câu hỏi thường gặp':
    'Bạn có thể đổi địa chỉ trước khi đặt hàng, theo dõi đơn trong tài khoản và liên hệ hỗ trợ nếu sản phẩm có vấn đề.',
  'Chính sách giao hàng':
    'Đơn từ 500.000đ được miễn phí giao hàng. Đơn thấp hơn áp dụng phí giao hàng tiêu chuẩn 30.000đ.',
  'Chính sách đổi trả':
    'Vui lòng liên hệ Fresh trong 24 giờ sau khi nhận hàng nếu sản phẩm bị hư hỏng hoặc không đúng đơn.',
  'Chính sách bảo mật':
    'Fresh chỉ sử dụng thông tin tài khoản và giao hàng để xử lý đơn, hỗ trợ khách hàng và bảo vệ trải nghiệm mua sắm.',
  'Điều khoản sử dụng':
    'Khi sử dụng Fresh, bạn đồng ý cung cấp thông tin chính xác và sử dụng dịch vụ đúng mục đích.',
};
export default function PageShell({ title, description }) {
  const content =
    description ||
    copy[title] ||
    'Fresh cung cấp trải nghiệm mua sắm trái cây tươi đơn giản, minh bạch và tận tâm.';
  return (
    <PageContainer>
      <p className="eyebrow">Chợ Fresh</p>
      <h1 className="mt-3 font-display text-5xl text-forest">{title}</h1>
      <div className="mt-8 max-w-3xl rounded-3xl bg-white p-8 shadow-sm">
        <p className="leading-8 text-slate-600">{content}</p>
        <Link className="btn-primary mt-7 inline-flex" to="/products">
          Khám phá sản phẩm
        </Link>
      </div>
    </PageContainer>
  );
}
