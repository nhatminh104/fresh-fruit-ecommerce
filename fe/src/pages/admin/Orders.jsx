import AdminDataPage from '../../components/admin/AdminDataPage';
export default function Orders() { return <AdminDataPage title="Quản lý đơn hàng" resource="orders" columns={[{ key: 'orderCode', label: 'Mã đơn' }, { key: 'user', label: 'Khách hàng' }, { key: 'totalAmount', label: 'Tổng tiền' }, { key: 'status', label: 'Trạng thái' }, { key: 'paymentStatus', label: 'Thanh toán' }]} />; }
