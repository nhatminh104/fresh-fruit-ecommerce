import AdminDataPage from '../../components/admin/AdminDataPage';

export default function Users() {
  return (
    <AdminDataPage
      title="Quản lý người dùng"
      resource="users"
      searchFields={['fullName', 'email', 'phone']}
      filters={[
        { key: 'role', label: 'Vai trò', options: [{ value: 'customer', label: 'Khách hàng' }, { value: 'admin', label: 'Admin' }] },
        { key: 'status', label: 'Trạng thái', options: [{ value: 'active', label: 'Hoạt động' }, { value: 'blocked', label: 'Đã khóa' }] },
      ]}
      columns={[
        { key: 'fullName', label: 'Họ tên' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Điện thoại' },
        { key: 'role', label: 'Vai trò' },
        { key: 'status', label: 'Trạng thái' },
      ]}
      actions={[
        {
          label: 'Khóa / Mở khóa',
          confirm: (item) =>
            `Đổi trạng thái tài khoản của ${item.fullName || item.email}?`,
          confirmLabel: 'Đổi trạng thái',
          run: (item, service) =>
            service.updateAdmin('users', item._id, {
              status: item.status === 'blocked' ? 'active' : 'blocked',
            }),
        },
        {
          label: 'Đổi vai trò',
          confirm: (item) =>
            `Đổi vai trò của ${item.fullName || item.email} sang ${item.role === 'admin' ? 'Khách hàng' : 'Admin'}?`,
          confirmLabel: 'Đổi vai trò',
          run: (item, service) =>
            service.updateAdmin('users', item._id, { role: item.role === 'admin' ? 'customer' : 'admin' }),
        },
      ]}
    />
  );
}
