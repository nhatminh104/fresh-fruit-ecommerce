import AdminDataPage from '../../components/admin/AdminDataPage';

export default function Categories() {
  return (
    <AdminDataPage
      title="Quản lý danh mục"
      resource="categories"
      createPath="/admin/categories/new"
      editPath={(item) => `/admin/categories/${item._id}/edit`}
      searchFields={['name', 'slug']}
      filters={[{ key: 'isActive', label: 'Trạng thái', options: [{ value: 'true', label: 'Đang hiển thị' }, { value: 'false', label: 'Đã ẩn' }] }]}
      columns={[
        { key: 'name', label: 'Tên' },
        { key: 'slug', label: 'Slug' },
        { key: 'isActive', label: 'Đang hiển thị' },
      ]}
      actions={[
        {
          label: 'Ẩn danh mục',
          hidden: (item) => item.isActive === false,
          run: (item, service) => service.updateAdmin('categories', item._id, { isActive: false }),
        },
        {
          label: 'Hiện lại',
          hidden: (item) => item.isActive !== false,
          run: (item, service) => service.updateAdmin('categories', item._id, { isActive: true }),
        },
      ]}
    />
  );
}
