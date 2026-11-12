import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import { getMyReviews } from '../../services/reviewService';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyReviews()
      .then(({ data }) => setReviews(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageContainer>
      <p className="eyebrow">Tài khoản</p>
      <h1 className="mt-3 font-display text-5xl text-forest">Đánh giá của tôi</h1>
      {loading ? (
        <Loading />
      ) : reviews.length ? (
        <div className="mt-8 space-y-4">
          {reviews.map((review) => (
            <article className="rounded-2xl border border-surface-border bg-white p-6 shadow-sm" key={review._id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link
                  to={`/products/${review.product?._id || review.product}`}
                  className="font-bold text-forest hover:text-leaf"
                >
                  {review.product?.name || 'Sản phẩm'}
                </Link>
                <span className="inline-flex items-center gap-1 text-accent">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < review.rating ? 'fill-accent text-accent' : 'text-slate-200'}
                    />
                  ))}
                </span>
              </div>
              <p className="mt-3 text-slate-600">{review.comment || 'Không có nhận xét.'}</p>
              <p className="mt-3 text-xs text-slate-400">
                {review.isApproved ? 'Đã hiển thị công khai' : 'Đang chờ quản trị viên duyệt'}
                {review.createdAt ? ` · ${new Date(review.createdAt).toLocaleDateString('vi-VN')}` : ''}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState title="Bạn chưa có đánh giá nào" />
        </div>
      )}
    </PageContainer>
  );
}
