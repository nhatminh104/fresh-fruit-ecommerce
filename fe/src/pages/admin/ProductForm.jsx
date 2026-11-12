import { useEffect, useState } from 'react';
import EntityForm from '../../components/admin/EntityForm';
import { listAdmin } from '../../services/adminService';

const toNumber = (value) => (value === '' || value === undefined || value === null ? undefined : Number(value));

export default function ProductForm() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    listAdmin('categories').then((data) => setCategories(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  const fields = [
    { key: 'name', label: 'Tên sản phẩm', required: true },
    { key: 'slug', label: 'Slug', required: true, placeholder: 'vi-du:-tao-ngot-ngap', helpText: 'Chữ thường, gạch ngang, không dấu.' },
    { key: 'category', label: 'Danh mục', type: 'select', required: true, options: categories.map((c) => ({ value: c._id, label: c.name })) },
    { key: 'price', label: 'Giá bán (VND)', type: 'number', required: true },
    { key: 'originalPrice', label: 'Giá gốc (VND)', type: 'number' },
    { key: 'unit', label: 'Đơn vị', required: true, placeholder: 'VD: kg, hộp 500g' },
    { key: 'origin', label: 'Xuất xứ', required: true },
    { key: 'stock', label: 'Tồn kho', type: 'number', required: true },
    { key: 'images', label: 'Hình ảnh (URL, cách nhau bởi dấu phẩy)', type: 'text', toForm: (value) => (Array.isArray(value) ? value.join(', ') : value || '') },
    { key: 'description', label: 'Mô tả', type: 'textarea' },
    { key: 'isFeatured', label: 'Sản phẩm nổi bật', type: 'checkbox' },
    { key: 'isActive', label: 'Đang kinh doanh', type: 'checkbox' }
  ];

  const toPayload = (form) => ({
    ...form,
    price: toNumber(form.price),
    originalPrice: toNumber(form.originalPrice),
    stock: toNumber(form.stock),
    images: String(form.images || '').split(',').map((url) => url.trim()).filter(Boolean),
    isFeatured: Boolean(form.isFeatured),
    isActive: form.isActive === undefined ? true : Boolean(form.isActive)
  });

  return (
    <EntityForm
      title="Sản phẩm"
      resource="products"
      fields={fields}
      initial={{ unit: 'kg', stock: '0', isActive: true, isFeatured: false }}
      toPayload={toPayload}
    />
  );
}
