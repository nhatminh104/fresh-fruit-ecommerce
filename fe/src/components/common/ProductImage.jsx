import React, { useState } from 'react';
import { Leaf } from 'lucide-react';

/**
 * Component ảnh sản phẩm dùng chung:
 * - Khung cố định qua className của wrapper, ảnh không bao giờ làm vỡ layout.
 * - fit='contain' (mặc định) giữ nguyên hình dáng trái cây; 'cover' cho banner/lifestyle.
 * - Tự fallback về icon khi thiếu ảnh hoặc link lỗi; hỗ trợ lazy loading.
 */
export default function ProductImage({
  src,
  alt = '',
  className = '',
  imgClassName = '',
  fit = 'contain',
  eager = false,
  fallback,
}) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  React.useEffect(() => {
    setCurrentSrc(src);
    setFailed(false);
  }, [src]);

  const fitClass = fit === 'cover' ? 'object-cover' : 'object-contain';

  if (failed || !currentSrc) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`${className} flex flex-col items-center justify-center bg-gradient-to-br from-brand-50 to-surface-subtle text-brand-500`}
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
      className={`${className} ${fitClass} ${imgClassName}`}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => {
        if (fallback && currentSrc !== fallback) setCurrentSrc(fallback);
        else setFailed(true);
      }}
    />
  );
}
