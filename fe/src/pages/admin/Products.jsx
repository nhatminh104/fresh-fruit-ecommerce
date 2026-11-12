import AdminDataPage from '../../components/admin/AdminDataPage';

export default function Products() {
  return (
    <AdminDataPage
      title="Quản lý sản phẩm"
      resource="products"
      createPath="/admin/products/new"
      editPath={(item) => `/admin/products/${item._id}/edit`}
      columns={[
        { key: 'name', label: 'Tên' },
        { key: 'category', label: 'Danh mục' },
        { key: 'price', label: 'Giá', type: 'currency' },
        { key: 'stock', label: 'Tồn kho' },
        { key: 'isActive', label: 'Đang bán' },
      ]}
      actions={[
        {
          label: 'Ẩn sản phẩm',
          hidden: (item) => item.isActive === false,
          run: (item, service) => service.updateAdmin('products', item._id, { isActive: false }),
        },
        {
          label: 'Hiện lại',
          hidden: (item) => item.isActive !== false,
          run: (item, service) => service.updateAdmin('products', item._id, { isActive: true }),
        },
      ]}
    />
  );
}
