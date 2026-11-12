import AdminDataPage from '../../components/admin/AdminDataPage';
import { formatCurrency } from '../../utils/formatCurrency';

export default function Vouchers() {
  return (
    <AdminDataPage
      title="Quản lý voucher"
      resource="vouchers"
      createPath="/admin/vouchers/new"
      editPath={(item) => `/admin/vouchers/${item._id}/edit`}
      columns={[
        { key: 'code', label: 'Mã' },
        { key: 'discountType', label: 'Loại', render: (item) => (item.discountType === 'percent' ? 'Phần trăm' : 'Cố định') },
        { key: 'discountValue', label: 'Giá trị', render: (item) => (item.discountType === 'percent' ? `${item.discountValue}%` : formatCurrency(item.discountValue)) },
        { key: 'usedCount', label: 'Đã dùng' },
        { key: 'endDate', label: 'Hết hạn', type: 'date' },
        { key: 'isActive', label: 'Đang áp dụng' }
      ]}
      actions={[
        { label: 'Tắt voucher', hidden: (item) => item.isActive === false, run: (item, service) => service.updateAdmin('vouchers', item._id, { isActive: false }) },
        { label: 'Bật lại', hidden: (item) => item.isActive !== false, run: (item, service) => service.updateAdmin('vouchers', item._id, { isActive: true }) }
      ]}
    />
  );
}
