import AdminDataPage from '../../components/admin/AdminDataPage';

const confirmRun = (message, run) => async (item, service) => {
  if (!window.confirm(message)) return undefined;
  return run(item, service);
};

export default function Users() {
  return (
    <AdminDataPage
      title="Quản lý người dùng"
      resource="users"
      columns={[
        { key: 'fullName', label: 'Họ tên' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Điện thoại' },
        { key: 'role', label: 'Vai trò' },
        { key: 'status', label: 'Trạng thái' }
      ]}
      actions={[
        {
          label: 'Khóa / Mở khóa',
          run: confirmRun('Đổi trạng thái khóa tài khoản này?', (item, service) =>
            service.updateAdmin('users', item._id, { status: item.status === 'blocked' ? 'active' : 'blocked' }))
        },
        {
          label: 'Đổi vai trò',
          run: confirmRun('Đổi vai trò của người dùng này?', (item, service) =>
            service.updateAdmin('users', item._id, { role: item.role === 'admin' ? 'customer' : 'admin' }))
        }
      ]}
    />
  );
}
