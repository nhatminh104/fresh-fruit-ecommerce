import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock,
  Heart,
  Leaf,
  PackageCheck,
  Percent,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Truck,
} from 'lucide-react';
import ProductCard from '../../components/product/ProductCard';
import { homeData } from '../../data/homeData';
import { getCategories } from '../../services/categoryService';
import { getProducts } from '../../services/productService';
import { getVouchers } from '../../services/voucherService';
import { formatCurrency } from '../../utils/formatCurrency';
import { useToast } from '../../contexts/ToastContext';

export default function Home() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [seasonalProducts, setSeasonalProducts] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      getCategories(),
      getProducts({ limit: 8, featured: true }),
      getProducts({ limit: 4, sort: 'popular' }),
      getVouchers(),
    ])
      .then(([catRes, prodRes, seasonRes, voucherRes]) => {
        if (!active) return;
        setCategories(catRes.data.data || []);
        setFeaturedProducts(prodRes.data.data?.items || []);
        setSeasonalProducts(seasonRes.data.data?.items || []);
        setVouchers(voucherRes.data.data || []);
      })
      .catch(() => {
        if (active) {
          setCategories([]);
          setFeaturedProducts([]);
          setSeasonalProducts([]);
          setVouchers([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const copyVoucher = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép mã ưu đãi ${code}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-ink">
      <main className="flex-1">
        {/* 1. HERO BANNER */}
        <section className="relative overflow-hidden bg-gradient-to-b from-surface-subtle via-white to-white py-12 lg:py-20 border-b border-surface-border/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
              {/* Left Column */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1 text-xs font-bold text-brand-700 shadow-sm">
                  <Sparkles size={14} className="text-accent" />
                  <span>Nông sản sạch VietGAP 100% tự nhiên</span>
                </div>

                <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-ink leading-[1.08]">
                  Trái cây tươi lành, <br />
                  <span className="text-brand-500 italic">ngọt mát</span> mỗi ngày.
                </h1>

                <p className="max-w-xl text-base sm:text-lg leading-relaxed text-ink-muted">
                  Được hái tận vườn từ các nông trại uy tín và bảo quản lạnh tiêu chuẩn. Đặt hàng tiện lợi,
                  giao nhanh trong 2 giờ để giữ trọn vẹn vitamin và vị ngọt nguyên bản.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    to="/products"
                    className="btn-primary text-base px-7 py-3.5 shadow-card hover:shadow-elevated"
                  >
                    <span>Mua sắm ngay</span>
                    <ArrowRight size={18} />
                  </Link>
                  <Link to="/categories" className="btn-secondary text-base px-6 py-3.5">
                    Xem danh mục
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-surface-border">
                  <div>
                    <strong className="block font-display text-2xl font-bold text-brand-700">2 Giờ</strong>
                    <span className="text-xs text-ink-muted">Giao siêu tốc nội thành</span>
                  </div>
                  <div>
                    <strong className="block font-display text-2xl font-bold text-brand-700">100%</strong>
                    <span className="text-xs text-ink-muted">Chuẩn tươi sạch VietGAP</span>
                  </div>
                  <div>
                    <strong className="block font-display text-2xl font-bold text-brand-700">24h</strong>
                    <span className="text-xs text-ink-muted">Đổi trả nếu dập nát</span>
                  </div>
                </div>
              </div>

              {/* Right Column / Hero Image */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Decorative backdrop glow */}
                  <div className="absolute -inset-4 rounded-3xl bg-brand-50/80 -z-10 blur-xl transform rotate-2" />

                  <img
                    src={
                      homeData?.hero?.image ||
                      'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=900&q=80'
                    }
                    alt="Trái cây tươi ngon"
                    className="w-full aspect-[4/3] sm:aspect-square object-cover rounded-3xl border border-surface-border shadow-elevated"
                    loading="eager"
                  />

                  {/* Floating Highlight Card */}
                  <div className="absolute -bottom-6 -left-4 sm:left-4 rounded-2xl border border-surface-border bg-white/95 p-4 shadow-card backdrop-blur-md flex items-center gap-3.5">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-700">
                      <Check size={22} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-brand-700 uppercase tracking-wide">
                        Tuyển chọn loại 1
                      </p>
                      <p className="text-sm font-bold text-ink">Ngọt đậm đà, an tâm sức khỏe</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. CATEGORIES SECTION */}
        <section className="section-shell">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="eyebrow">
                <Leaf size={14} /> Danh mục tuyển chọn
              </span>
              <h2 className="section-title mt-2">Khám phá theo khẩu vị</h2>
            </div>
            <Link to="/categories" className="section-link group">
              <span>Xem tất cả danh mục</span>
              <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/products?category=${category.slug}`}
                className="category-card group"
              >
                <div className="aspect-square w-full overflow-hidden rounded-xl bg-surface-muted mb-3">
                  <img
                    src={
                      category.image ||
                      'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=400&q=80'
                    }
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-sm font-bold text-ink group-hover:text-brand-500 transition-colors line-clamp-1">
                  {category.name}
                </h3>
                <span className="text-[11px] text-ink-muted mt-0.5 block">Xem ngay</span>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. FEATURED PRODUCTS (MÓN NGON NỔI BẬT) */}
        <section className="py-16 bg-surface-subtle border-y border-surface-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <span className="eyebrow">
                  <Sparkles size={14} className="text-accent" /> Món ngon trong tuần
                </span>
                <h2 className="section-title mt-2">Trái cây nổi bật nhất</h2>
              </div>
              <Link to="/products" className="section-link group">
                <span>Xem tất cả sản phẩm</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="h-72 rounded-2xl bg-white border border-surface-border animate-pulse p-4"
                  />
                ))}
              </div>
            ) : featuredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {featuredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-surface-border bg-white p-12 text-center text-ink-muted">
                Hiện chưa có sản phẩm nổi bật.
              </div>
            )}
          </div>
        </section>

        {/* 4. SEASONAL BANNER & HIGHLIGHT */}
        <section className="section-shell">
          <div className="relative overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-r from-brand-50 via-surface-subtle to-brand-100/50 p-8 sm:p-12 lg:p-16 shadow-subtle">
            <div className="relative z-10 max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-xs font-bold text-amber-800">
                <Tag size={13} /> Hương vị theo mùa
              </span>
              <h2 className="mt-4 font-display text-3xl sm:text-5xl font-bold tracking-tight text-ink leading-tight">
                Mùa trái cây ngọt mát, <br />
                <span className="text-brand-700 italic">tươi ngon đỉnh điểm</span>
              </h2>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-ink-muted">
                Thưởng thức xoài cát Hòa Lộc thơm lừng, thanh long đỏ Bình Thuận mọng nước và cam sành Tiền
                Giang giàu vitamin C với mức giá ưu đãi tận vườn.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/products?sort=popular" className="btn-primary text-sm px-6 py-3 shadow-card">
                  <span>Khám phá ngay</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/vouchers" className="btn-secondary text-sm px-6 py-3">
                  Nhận mã giảm giá
                </Link>
              </div>
            </div>

            {/* Right seasonal fruit thumbnails */}
            <div className="hidden lg:grid absolute right-12 top-1/2 -translate-y-1/2 grid-cols-2 gap-4 w-96">
              {seasonalProducts.slice(0, 2).map((item) => (
                <div
                  key={item._id}
                  className="rounded-2xl bg-white/95 p-3.5 shadow-card border border-surface-border"
                >
                  <img
                    src={item.images?.[0] || item.image}
                    alt={item.name}
                    className="aspect-square w-full rounded-xl object-cover"
                  />
                  <h4 className="mt-2 text-xs font-bold text-ink truncate">{item.name}</h4>
                  <p className="text-xs font-bold text-brand-700 mt-1">{formatCurrency(item.price)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. VOUCHERS / PROMOTIONS */}
        {vouchers.length > 0 && (
          <section className="py-14 bg-surface-subtle border-t border-surface-border">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                  <span className="eyebrow">
                    <Percent size={14} className="text-accent" /> Tiết kiệm mỗi ngày
                  </span>
                  <h2 className="section-title mt-2">Mã giảm giá dành cho bạn</h2>
                </div>
                <Link to="/vouchers" className="section-link">
                  <span>Xem tất cả voucher</span>
                  <ChevronRight size={16} />
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {vouchers.slice(0, 3).map((voucher) => (
                  <div
                    key={voucher._id}
                    className="relative flex items-center justify-between rounded-2xl border border-dashed border-amber-300 bg-white p-5 shadow-subtle hover:border-accent transition-all"
                  >
                    <div className="flex-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-extrabold text-amber-800">
                          {voucher.code}
                        </span>
                        <span className="text-xs text-ink-muted">
                          {voucher.discountType === 'percent'
                            ? `Giảm ${voucher.discountValue}%`
                            : `Giảm ${formatCurrency(voucher.discountValue)}`}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-ink-muted line-clamp-1">
                        {voucher.description || `Đơn tối thiểu ${formatCurrency(voucher.minOrderValue || 0)}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyVoucher(voucher.code)}
                      className="shrink-0 rounded-full border border-surface-border bg-surface-subtle px-3.5 py-1.5 text-xs font-bold text-ink hover:bg-brand-50 hover:text-brand-700 transition-colors"
                    >
                      Lưu mã
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 6. CUSTOMER REVIEWS & TESTIMONIALS */}
        <section className="section-shell">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="eyebrow justify-center">
              <Star size={14} className="text-accent fill-accent" /> Khách hàng nói gì
            </span>
            <h2 className="section-title mt-2">Hơn 10.000+ bữa ăn ngon</h2>
            <p className="mt-3 text-sm text-ink-muted">
              Sự hài lòng của bạn là động lực để Fresh mỗi ngày tìm kiếm những mùa quả ngọt lành nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                name: 'Chị Mai Lan',
                role: 'Quận 1, TP.HCM',
                comment:
                  'Trái cây ở Fresh tươi và ngọt đậm tự nhiên, không bị ngâm hóa chất. Dâu tây và xoài cát giao đến đóng gói rất kỹ, nguyên vẹn không bị dập.',
                rating: 5,
              },
              {
                name: 'Anh Minh Trí',
                role: 'Bình Thạnh, TP.HCM',
                comment:
                  'Giao hàng cực kỳ nhanh, đúng 1 tiếng là có trái cây cho cả văn phòng ăn xế. Giá cả minh bạch và nhiều mã giảm giá hấp dẫn.',
                rating: 5,
              },
              {
                name: 'Cô Thu Cúc',
                role: 'Quận 3, TP.HCM',
                comment:
                  'Thích nhất là chính sách đổi trả nhanh gọn. Có lần quả bơ bị chín quá một chút, báo hotline là nhân viên mang quả mới đổi tận nhà ngay.',
                rating: 5,
              },
            ].map((review, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-surface-border bg-white p-6 shadow-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 text-accent mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={16} className="fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-ink-muted italic">"{review.comment}"</p>
                </div>
                <div className="mt-6 flex items-center gap-3 border-t border-surface-border pt-4">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-700 font-bold text-xs">
                    {review.name[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-ink">{review.name}</h4>
                    <p className="text-xs text-ink-light">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. CALL TO ACTION */}
        <section className="bg-surface-subtle py-16 border-t border-surface-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-brand-200 bg-white p-8 sm:p-12 shadow-card flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
              <div>
                <span className="eyebrow">Sẵn sàng bổ sung vitamin?</span>
                <h3 className="font-display text-2xl sm:text-4xl font-bold text-ink mt-2">
                  Đặt trái cây tươi ngon hôm nay
                </h3>
                <p className="mt-2 text-sm text-ink-muted max-w-md">
                  Nhập mã ưu đãi tại giỏ hàng để nhận miễn phí vận chuyển cho đơn hàng đầu tiên của bạn.
                </p>
              </div>
              <Link
                to="/products"
                className="btn-primary text-base px-8 py-4 shadow-card hover:shadow-elevated shrink-0"
              >
                <span>Xem cửa hàng</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
