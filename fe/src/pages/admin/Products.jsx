import AdminDataPage from '../../components/admin/AdminDataPage';
import ProductImage from '../../components/common/ProductImage';

export default function Products() {
  return (
    <AdminDataPage
      title="Quản lý sản phẩm"
      resource="products"
      createPath="/admin/products/new"
      editPath={(item) => `/admin/products/${item._id}/edit`}
      searchFields={['name', 'slug']}
      filters={[{ key: 'isActive', label: 'Trạng thái', options: [{ value: 'true', label: 'Đang bán' }, { value: 'false', label: 'Đã ẩn' }] }]}
      columns={[
        {
          key: 'images',
          label: '',
          render: (item) => (
            <ProductImage
              className="h-12 w-12 rounded-xl border border-surface-border bg-surface-subtle"
              src={item.images?.[0] || item.image}
              alt={item.name}
            />
          ),
        },
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
