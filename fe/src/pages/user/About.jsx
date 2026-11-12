import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, PackageCheck, ShieldCheck, Truck } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';

const values = [
  {
    icon: Leaf,
    title: 'Tươi từ nguồn',
    text: 'Trái cây được tuyển chọn từ các vùng trồng uy tín, ưu tiên hàng theo mùa và hái đúng độ chín.'
  },
  {
    icon: PackageCheck,
    title: 'Đóng gói cẩn thận',
    text: 'Sản phẩm được phân loại, lót chống sốc và bảo quản lạnh trước khi bàn giao đơn vị vận chuyển.'
  },
  {
    icon: Truck,
    title: 'Giao nhanh toàn quốc',
    text: 'Hỗ trợ giao hàng đến các tỉnh thành trên cả nước với minh bạch phí ship và theo dõi đơn hàng.'
  },
  {
    icon: ShieldCheck,
    title: 'Minh bạch rõ ràng',
    text: 'Giá cả, phí vận chuyển và giảm giá đều được tính và hiển thị chính xác từ hệ thống trước khi đặt hàng.'
  }
];

const steps = [
  { title: 'Tuyển chọn', text: 'Kiểm tra chất lượng, độ tươi và nguồn gốc từng lô hàng trước khi nhập kho.' },
  { title: 'Bảo quản', text: 'Trái cây nhạy cảm được bảo quản lạnh, phân loại theo độ chín để giao đúng thời điểm.' },
  { title: 'Đóng gói', text: 'Đóng thùng chống sốc, dán thông tin đơn hàng và sắp xếp theo tuyến giao.' },
  { title: 'Giao tận nơi', text: 'Đơn vị vận chuyển giao đến địa chỉ khách hàng, kèm hỗ trợ đổi trả khi cần.' }
];

export default function About() {
  return (
    <PageContainer>
      <div className="max-w-3xl">
        <span className="eyebrow">Về Fresh</span>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold tracking-tight text-ink">
          Trái cây tươi, từ vườn đến bàn ăn
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-muted">
          Fresh là cửa hàng trái cây trực tuyến với mục tiêu đơn giản: mang những loại trái cây tươi ngon,
          đúng mùa và rõ nguồn gốc đến gần hơn với gia đình Việt. Chúng tôi tin rằng một bữa ăn ngon bắt
          đầu từ nguyên liệu tươi — và việc mua sắm trái cây không nên phức tạp.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {values.map(({ icon: Icon, title, text }) => (
          <article key={title} className="rounded-3xl border border-surface-border bg-white p-6 shadow-subtle">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              <Icon size={20} />
            </div>
            <h2 className="mt-4 font-display text-xl font-bold text-ink">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{text}</p>
          </article>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-ink">Quy trình của Fresh</h2>
        <p className="mt-2 text-sm text-ink-muted">Từ lúc hái đến lúc giao — mỗi bước đều có kiểm soát.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.title} className="relative rounded-2xl border border-surface-border bg-white p-5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                {i + 1}
              </span>
              <h3 className="mt-3 text-sm font-bold text-ink">{step.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-3xl border border-brand-200 bg-brand-50/60 p-8 text-center">
        <h2 className="font-display text-2xl font-bold text-ink">Trải nghiệm mua sắm minh bạch</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-ink-muted">
          Mọi giá bán, phí ship và mã giảm giá đều do hệ thống tính toán — bạn luôn biết chính xác mình
          sẽ thanh toán bao nhiêu trước khi xác nhận đơn.
        </p>
        <Link to="/products" className="btn-primary mt-6 inline-flex px-7 py-3">
          <span>Khám phá sản phẩm</span>
          <ArrowRight size={16} />
        </Link>
      </section>

      <p className="mt-8 text-xs text-ink-light">
        * Nội dung giới thiệu mang tính minh họa cho website demo Fresh Fruit.
      </p>
    </PageContainer>
  );
}
