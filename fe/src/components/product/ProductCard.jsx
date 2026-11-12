import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Heart, Leaf, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { addWishlistItem, removeWishlistItem } from '../../services/wishlistService';
import { useToast } from '../../contexts/ToastContext';

function SafeImage({ src, fallbackSrc, alt, className }) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return (
      <div
        aria-label={alt}
        className={`${className} flex flex-col items-center justify-center bg-surface-subtle text-brand-500`}
      >
        <Leaf size={28} className="text-brand-500/70" aria-hidden="true" />
        <span className="mt-1 text-[11px] font-bold text-ink-muted">Fresh Fruit</span>
      </div>
    );
  }
  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        if (fallbackSrc && currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
        else setFailed(true);
      }}
    />
  );
}

const KOREAN_PEAR_FALLBACK =
  'https://images.unsplash.com/photo-1612100616857-c056b93628b4?auto=format&fit=crop&w=900&q=85';

export default function ProductCard({ product, className = '', inWishlist = false, onWishlistChange }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const toast = useToast();

  const [adding, setAdding] = useState(false);
  const [isWished, setIsWished] = useState(inWishlist);
  const [wishLoading, setWishLoading] = useState(false);

  if (!product) return null;

  const productId = product._id || product.id;
  const image = product.images?.[0] || product.image;
  const imageFallback = product.slug === 'le-han-quoc' ? KOREAN_PEAR_FALLBACK : null;
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    if (!user) {
      navigate('/login');
      return;
    }
    setAdding(true);
    try {
      const res = await addItem({ ...product, id: productId, quantity: 1 });
      if (res?.requiresAuth) {
        navigate('/login');
      }
    } catch {
      // CartContext handles error toast
    } finally {
      setTimeout(() => setAdding(false), 700);
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (wishLoading) return;
    setWishLoading(true);
    try {
      if (isWished) {
        await removeWishlistItem(productId);
        setIsWished(false);
        toast.info('Đã xóa khỏi danh sách yêu thích');
        onWishlistChange?.(productId, false);
      } else {
        await addWishlistItem(productId);
        setIsWished(true);
        toast.success('Đã thêm vào danh sách yêu thích');
        onWishlistChange?.(productId, true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể cập nhật danh sách yêu thích');
    } finally {
      setWishLoading(false);
    }
  };

  return (
    <article className={`product-card ${className}`}>
      {/* Image Container */}
      <div className="product-image-wrap group/img">
        <Link to={`/products/${productId}`} className="block h-full w-full">
          <SafeImage src={image} fallbackSrc={imageFallback} alt={product.name} className="product-image" />
        </Link>

        {/* Tags */}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5 z-10">
          {discountPercent && (
            <span className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {isOutOfStock ? (
            <span className="rounded-full bg-ink/80 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm backdrop-blur-sm">
              Hết hàng
            </span>
          ) : (
            product.origin && <span className="product-tag">{product.origin}</span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          disabled={wishLoading}
          aria-label={isWished ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
          className={`absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-110 ${
            isWished ? 'text-red-500 fill-red-500' : 'text-ink-muted hover:text-red-500'
          }`}
        >
          <Heart size={16} className={isWished ? 'fill-red-500 text-red-500' : ''} />
        </button>

        {/* Quick Add To Cart Button */}
        {!isOutOfStock && (
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding}
            aria-label={`Thêm ${product.name} vào giỏ hàng`}
            className="add-button"
            title="Thêm vào giỏ"
          >
            {adding ? <Check size={18} strokeWidth={2.5} /> : <ShoppingBag size={18} />}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mt-3 flex flex-1 flex-col justify-between">
        <div>
          {product.category?.name && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-light">
              {product.category.name}
            </span>
          )}
          <Link to={`/products/${productId}`} className="mt-0.5 block">
            <h3 className="product-name text-sm sm:text-base font-bold text-ink" title={product.name}>
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-2 border-t border-surface-border/60 pt-2.5">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base font-extrabold text-brand-700">{formatCurrency(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-ink-light line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>
          {product.unit && <span className="text-xs font-medium text-ink-muted">/{product.unit}</span>}
        </div>
      </div>
    </article>
  );
}
