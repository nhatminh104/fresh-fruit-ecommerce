import EntityForm from '../../components/admin/EntityForm';

const toNumber = (value) =>
  value === '' || value === undefined || value === null ? undefined : Number(value);

const fields = [
  {
    key: 'code',
    label: 'Mã voucher',
    required: true,
    placeholder: 'Vd: TET2026',
    helpText: 'Chữ hoa, số, gạch dưới và gạch ngang.',
  },
  { key: 'description', label: 'Mô tả', type: 'textarea' },
  {
    key: 'discountType',
    label: 'Loại giảm giá',
    type: 'select',
    required: true,
    options: [
      { value: 'percent', label: 'Phần trăm (%)' },
      { value: 'fixed', label: 'Số tiền cố định (VND)' },
    ],
  },
  { key: 'discountValue', label: 'Giá trị giảm', type: 'number', required: true },
  { key: 'minOrderValue', label: 'Đơn tối thiểu (VND)', type: 'number' },
  { key: 'maxDiscount', label: 'Giảm tối đa (VND)', type: 'number' },
  {
    key: 'startDate',
    label: 'Ngày bắt đầu',
    type: 'date',
    required: true,
    toForm: (value) => (value ? String(value).slice(0, 10) : ''),
  },
  {
    key: 'endDate',
    label: 'Ngày kết thúc',
    type: 'date',
    required: true,
    toForm: (value) => (value ? String(value).slice(0, 10) : ''),
  },
  { key: 'usageLimit', label: 'Giới hạn lượt dùng', type: 'number' },
  { key: 'isActive', label: 'Đang áp dụng', type: 'checkbox' },
];

const toPayload = (form) => ({
  ...form,
  code: String(form.code || '')
    .trim()
    .toUpperCase(),
  discountValue: toNumber(form.discountValue),
  minOrderValue: toNumber(form.minOrderValue) ?? 0,
  maxDiscount: toNumber(form.maxDiscount),
  usageLimit: toNumber(form.usageLimit),
  startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
  endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
  isActive: form.isActive === undefined ? true : Boolean(form.isActive),
});

export default function VoucherForm() {
  return (
    <EntityForm
      title="Voucher"
      resource="vouchers"
      fields={fields}
      initial={{ discountType: 'percent', minOrderValue: '0', isActive: true }}
      toPayload={toPayload}
    />
  );
}
