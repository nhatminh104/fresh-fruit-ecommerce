import EntityForm from '../../components/admin/EntityForm';

const fields = [
  { key: 'name', label: 'Tên danh mục', required: true },
  {
    key: 'slug',
    label: 'Slug',
    required: true,
    placeholder: 'vi-du:-trai-cay-nhiet-doi',
    helpText: 'Chữ thường, gạch ngang, không dấu.',
  },
  { key: 'description', label: 'Mô tả', type: 'textarea' },
  { key: 'image', label: 'Hình ảnh (URL)', type: 'images' },
  { key: 'isActive', label: 'Đang hiển thị', type: 'checkbox' },
];

const toPayload = (form) => ({
  ...form,
  isActive: form.isActive === undefined ? true : Boolean(form.isActive),
});

export default function CategoryForm() {
  return (
    <EntityForm
      title="Danh mục"
      resource="categories"
      fields={fields}
      initial={{ isActive: true }}
      toPayload={toPayload}
    />
  );
}
