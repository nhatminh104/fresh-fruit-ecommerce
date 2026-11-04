import AdminDataPage from '../../components/admin/AdminDataPage';
export default function Dashboard() { return <AdminDataPage title="Admin Dashboard" resource="dashboard" columns={[{ key: 'users', label: 'Người dùng' }, { key: 'products', label: 'Sản phẩm' }, { key: 'orders', label: 'Đơn hàng' }, { key: 'revenue', label: 'Doanh thu' }]} />; }
