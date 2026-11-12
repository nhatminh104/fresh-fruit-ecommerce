import { useState } from 'react';
import { Star } from 'lucide-react';
import AdminDataPage from '../../components/admin/AdminDataPage';
import Modal from '../../components/common/Modal';

function ReviewCommentCell({ item }) {
  const [open, setOpen] = useState(false);
  const comment = item.comment || '';
  const isLong = comment.length > 80;
  return (
    <>
      <span className="line-clamp-2 max-w-xs">{comment || '-'}</span>
      {isLong && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="ml-1 text-xs font-bold text-leaf hover:underline"
        >
          Xem thêm
        </button>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={`Đánh giá — ${item.product?.name || ''}`}>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-0.5 text-accent">
              <Star size={14} className="fill-accent" /> {item.rating}/5
            </span>
            <span>· {item.user?.fullName || item.user?.email || 'Khách'}</span>
            <span className="text-ink-muted">
              · {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : ''}
            </span>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{comment || 'Không có nội dung.'}</p>
        </div>
      </Modal>
    </>
  );
}

export default function Reviews() {
  return (
    <AdminDataPage
      title="Quản lý đánh giá"
      resource="reviews"
      searchFields={['comment', 'product.name', 'user.fullName', 'user.email']}
      filters={[
        { key: 'rating', label: 'Số sao', options: [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n} sao` })) },
        { key: 'isApproved', label: 'Duyệt', options: [{ value: 'true', label: 'Đã duyệt' }, { value: 'false', label: 'Chưa duyệt' }] },
      ]}
      columns={[
        { key: 'product', label: 'Sản phẩm' },
        { key: 'user', label: 'Người dùng' },
        {
          key: 'rating',
          label: 'Điểm',
          render: (item) => (
            <span className="inline-flex items-center gap-0.5 text-accent">
              <Star size={14} className="fill-accent" /> {item.rating}
            </span>
          ),
        },
        { key: 'comment', label: 'Nội dung', render: (item) => <ReviewCommentCell item={item} /> },
        { key: 'isApproved', label: 'Đã duyệt' },
      ]}
      actions={[
        {
          label: 'Duyệt',
          run: (item, service) => service.updateAdmin('reviews', item._id, { isApproved: true }),
        },
        {
          label: 'Bỏ duyệt',
          run: (item, service) => service.updateAdmin('reviews', item._id, { isApproved: false }),
        },
        {
          label: 'Xóa',
          variant: 'danger',
          confirm: () => 'Xóa đánh giá này? Hành động không thể hoàn tác.',
          run: (item, service) => service.deleteAdmin('reviews', item._id),
        },
      ]}
    />
  );
}
