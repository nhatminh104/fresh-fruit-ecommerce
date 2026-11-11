import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Heart,
  Leaf,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import Button from '../../components/common/Button';
import ProductCard from '../../components/product/ProductCard';
import { getProduct, getProducts } from '../../services/productService';
import { getReviews, createReview } from '../../services/reviewService';
import { addWishlistItem, removeWishlistItem, getWishlist } from '../../services/wishlistService';
import { formatCurrency } from '../../utils/formatCurrency';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';

export default function ProductDetailFullPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [error, setError] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [isWished, setIsWished] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    Promise.all([
      getProduct(id),
      getReviews(id),
      user ? getWishlist() : Promise.resolve({ data: { data: { products: [] } } })
    ])
      .then(([prodRes, reviewRes, wishRes]) => {
        if (!active) return;
        const prodData = prodRes.data.data;
        setProduct(prodData);
        setSelectedImage(prodData.images?.[0] || prodData.image || '');
        setReviews(reviewRes.data.data || []);
        
        const wished = (wishRes.data?.data?.products || []).some(
          (p) => (p._id || p.id) === (prodData._id || prodData.id)
        );
        setIsWished(wished);

        // Fetch related products
        if (prodData?.category) {
          getProducts({
            category: prodData.category.slug || prodData.category._id || prodData.category,
            limit: 4
          })
            .then(({ data }) => {
              if (active) {
                setRelatedProducts((data.data?.items || []).filter((p) => p._id !== prodData._id));
              }
            })
            .catch(() => {});
        }
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'Không thể tải thông tin sản phẩm.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, user]);

  const handleAddToCart = async () => {
    if (!product || !product.stock) return;
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await addItem({ ...product, id: product._id, quantity });
      if (res?.requiresAuth) {
        navigate('/login');
      }
    } catch {
      // Toast handled by context
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      if (isWished) {
        await removeWishlistItem(product._id);
        setIsWished(false);
        toast.info('Đã xóa khỏi danh sách yêu thích');
      } else {
        await addWishlistItem(product._id);
        setIsWished(true);
        toast.success('Đã thêm vào danh sách yêu thích');
      }
    } catch {
      toast.error('Không thể cập nhật danh sách yêu thích');
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setReviewError('');
    setSubmittingReview(true);
    try {
      const response = await createReview({ product: id, rating, comment });
      setReviews((current) => [response.data.data, ...current]);
      setComment('');
      toast.success('Đánh giá của bạn đã được gửi thành công!');
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Chỉ khách hàng đã nhận sản phẩm mới có thể đánh giá.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Loading message="Đang tải chi tiết trái cây..." minHeight="min-h-96" />
      </PageContainer>
    );
  }

  if (error || !product) {
    return (
      <PageContainer>
        <div className="py-8">
          <Link to="/products" className="inline-flex items-center gap-2 text-sm font-bold text-brand-700 hover:text-brand-500 mb-6">
            <ArrowLeft size={16} /> Quay lại danh sách
          </Link>
          <ErrorMessage message={error || 'Không tìm thấy sản phẩm.'} />
        </div>
      </PageContainer>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const imageFallback = product.slug === 'le-han-quoc'
    ? 'https://images.unsplash.com/photo-1612100616857-c056b93628b4?auto=format&fit=crop&w=900&q=85'
    : null;
  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <PageContainer>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs font-semibold text-ink-muted">
        <Link to="/" className="hover:text-brand-500">Trang chủ</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-brand-500">Sản phẩm</Link>
        <span>/</span>
        {product.category?.name && (
          <>
            <Link to={`/products?category=${product.category.slug || ''}`} className="hover:text-brand-500">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-ink font-bold truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Product Info Grid */}
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Left: Product Images Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-surface-border bg-surface-subtle shadow-subtle">
            <img
              src={selectedImage || images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-all duration-300"
              onError={(event) => {
                if (imageFallback && event.currentTarget.src !== imageFallback) {
                  event.currentTarget.src = imageFallback;
                  setSelectedImage(imageFallback);
                }
              }}
            />
            {discountPercent && (
              <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white shadow-sm">
                Tiết kiệm {discountPercent}%
              </span>
            )}
            {isOutOfStock && (
              <span className="absolute left-4 top-4 rounded-full bg-ink/80 px-3 py-1 text-xs font-bold text-white shadow-sm">
                Tạm hết hàng
              </span>
            )}
          </div>

          {/* Thumbnails if multiple images */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                    selectedImage === img ? 'border-brand-500 shadow-sm' : 'border-surface-border hover:border-brand-200'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Buying */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-700">
                {product.category?.name || 'Trái cây sạch'}
              </span>
              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`grid h-10 w-10 place-items-center rounded-full border border-surface-border bg-white transition-all hover:scale-105 ${
                  isWished ? 'text-red-500 fill-red-500' : 'text-ink-muted hover:text-red-500'
                }`}
                title={isWished ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
              >
                <Heart size={20} className={isWished ? 'fill-red-500' : ''} />
              </button>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink">
              {product.name}
            </h1>

            {/* Rating summary */}
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center text-accent">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.round(averageRating || 5) ? 'fill-accent text-accent' : 'text-surface-border'}
                  />
                ))}
              </div>
              <span className="font-bold text-ink">
                {averageRating ? `${averageRating} / 5` : 'Chưa có đánh giá'}
              </span>
              <span className="text-ink-muted">•</span>
              <span className="text-ink-muted">{reviews.length} đánh giá</span>
            </div>

            {/* Pricing */}
            <div className="rounded-2xl border border-surface-border bg-surface-subtle p-5">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="font-display text-3xl sm:text-4xl font-extrabold text-brand-700">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-base text-ink-light line-through font-semibold">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
                {product.unit && (
                  <span className="text-sm font-semibold text-ink-muted">
                    / 1 {product.unit}
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-ink-muted">
                {product.origin && (
                  <span>Xuất xứ: <strong className="text-ink">{product.origin}</strong></span>
                )}
                <span>•</span>
                <span>
                  Tồn kho:{' '}
                  <strong className={product.stock > 0 ? 'text-brand-700' : 'text-red-600'}>
                    {product.stock > 0 ? `Còn ${product.stock} ${product.unit}` : 'Tạm hết hàng'}
                  </strong>
                </span>
              </div>
            </div>

            {/* Short Description */}
            <p className="text-sm leading-relaxed text-ink-muted">
              {product.description || 'Trái cây tươi ngon thu hoạch trực tiếp, an toàn vệ sinh thực phẩm, giàu vitamin tốt cho sức khỏe.'}
            </p>

            {/* Quantity Selector & Add to Cart */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
                Chọn số lượng
              </label>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center rounded-full border border-surface-border bg-white p-1 shadow-subtle">
                  <button
                    type="button"
                    disabled={quantity <= 1 || isOutOfStock}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="grid h-9 w-9 place-items-center rounded-full text-ink hover:bg-surface-subtle disabled:opacity-40"
                    aria-label="Giảm số lượng"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-ink">{quantity}</span>
                  <button
                    type="button"
                    disabled={quantity >= product.stock || isOutOfStock}
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="grid h-9 w-9 place-items-center rounded-full text-ink hover:bg-surface-subtle disabled:opacity-40"
                    aria-label="Tăng số lượng"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || cartLoading}
                  loading={cartLoading}
                  size="lg"
                  className="flex-1 min-w-[200px]"
                >
                  <ShoppingBag size={18} />
                  <span>{isOutOfStock ? 'Sản phẩm tạm hết hàng' : 'Thêm vào giỏ hàng'}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Guarantees Box */}
          <div className="mt-8 grid grid-cols-3 gap-3 rounded-2xl border border-surface-border bg-white p-4 text-center text-xs">
            <div className="flex flex-col items-center gap-1.5 p-2">
              <Truck size={20} className="text-brand-500" />
              <span className="font-bold text-ink">Giao nhanh 2h</span>
              <span className="text-[11px] text-ink-muted">Nội thành TP.HCM</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 border-x border-surface-border p-2">
              <ShieldCheck size={20} className="text-brand-500" />
              <span className="font-bold text-ink">Chuẩn VietGAP</span>
              <span className="text-[11px] text-ink-muted">100% tự nhiên</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2">
              <RotateCcw size={20} className="text-brand-500" />
              <span className="font-bold text-ink">Đổi trả 24h</span>
              <span className="text-[11px] text-ink-muted">Nếu không hài lòng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="mt-16 border-t border-surface-border pt-12">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Reviews List */}
          <div className="lg:col-span-7">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">
              Đánh giá từ khách hàng ({reviews.length})
            </h2>

            <div className="mt-6 space-y-4">
              {reviews.length > 0 ? (
                reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="rounded-2xl border border-surface-border bg-white p-5 shadow-subtle"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-50 text-brand-700 font-bold text-xs">
                          {rev.user?.fullName ? rev.user.fullName[0] : 'K'}
                        </div>
                        <div>
                          <strong className="block text-sm text-ink">
                            {rev.user?.fullName || 'Khách hàng ẩn danh'}
                          </strong>
                          <span className="text-[11px] text-ink-muted">
                            {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('vi-VN') : 'Đã mua hàng'}
                          </span>
                        </div>
                      </div>
                      <div className="flex text-accent">
                        {[...Array(rev.rating || 5)].map((_, idx) => (
                          <Star key={idx} size={14} className="fill-accent text-accent" />
                        ))}
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                      {rev.comment}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-surface-border bg-surface-subtle p-8 text-center text-sm text-ink-muted">
                  Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên chia sẻ cảm nhận!
                </div>
              )}
            </div>
          </div>

          {/* Submit Review Form */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-surface-border bg-white p-6 sm:p-8 shadow-card">
              <h3 className="font-display text-xl font-bold text-ink">
                Viết nhận xét của bạn
              </h3>
              <p className="mt-1 text-xs text-ink-muted">
                Chia sẻ đánh giá thực tế giúp người mua sau có thêm thông tin hữu ích
              </p>

              {reviewError && (
                <div className="mt-4">
                  <ErrorMessage message={reviewError} />
                </div>
              )}

              <form onSubmit={submitReview} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                    Đánh giá độ ngon
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          size={24}
                          className={star <= rating ? 'fill-accent text-accent' : 'text-slate-200'}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-bold text-ink-muted">{rating} / 5 sao</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="review-comment" className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                    Nội dung nhận xét *
                  </label>
                  <textarea
                    id="review-comment"
                    rows={4}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Trái cây ngọt hay chua, độ tươi thế nào, bạn có thích cách đóng gói không?..."
                    className="w-full rounded-2xl border border-surface-border p-3 text-sm text-ink outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-50"
                  />
                </div>

                <Button
                  type="submit"
                  loading={submittingReview}
                  disabled={!comment.trim() || submittingReview}
                  className="w-full"
                >
                  Gửi nhận xét
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t border-surface-border pt-12">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <span className="eyebrow">Có thể bạn thích</span>
              <h2 className="font-display text-2xl font-bold text-ink mt-1">Sản phẩm tương tự</h2>
            </div>
            <Link to="/products" className="section-link">
              <span>Xem thêm</span>
              <ArrowLeft size={16} className="rotate-180" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {relatedProducts.map((relProduct) => (
              <ProductCard key={relProduct._id} product={relProduct} />
            ))}
          </div>
        </section>
      )}
    </PageContainer>
  );
}
