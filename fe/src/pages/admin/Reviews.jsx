import { Star } from 'lucide-react';
import AdminDataPage from '../../components/admin/AdminDataPage';

export default function Reviews() {
  return (
    <AdminDataPage
      title="Quản lý đánh giá"
      resource="reviews"
      columns={[
        { key: 'product', label: 'Sản phẩm' },
        { key: 'user', label: 'Người dùng' },
        { key: 'rating', label: 'Điểm', render: (item) => (
          <span className="inline-flex items-center gap-0.5 text-accent">
            <Star size={14} className="fill-accent" /> {item.rating}
          </span>
        ) },
        { key: 'comment', label: 'Nội dung', render: (item) => <span className="line-clamp-2 max-w-xs">{item.comment || '-'}</span> },
        { key: 'isApproved', label: 'Đã duyệt' }
      ]}
      actions={[
        { label: 'Duyệt', run: (item, service) => service.updateAdmin('reviews', item._id, { isApproved: true }) },
        { label: 'Bỏ duyệt', run: (item, service) => service.updateAdmin('reviews', item._id, { isApproved: false }) },
        { label: 'Xóa', run: (item, service) => service.deleteAdmin('reviews', item._id) }
      ]}
    />
  );
}
