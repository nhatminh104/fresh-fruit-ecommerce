import AdminDataPage from '../../components/admin/AdminDataPage';
export default function Inventory() { return <AdminDataPage title="Quản lý tồn kho" resource="inventory" columns={[{ key: 'product', label: 'Sản phẩm' }, { key: 'quantity', label: 'Số lượng' }, { key: 'lowStockAt', label: 'Mức cảnh báo' }]} />; }
