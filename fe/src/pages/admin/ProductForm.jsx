import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ErrorMessage from '../../components/common/ErrorMessage';
import * as adminService from '../../services/adminService';
import { getErrorMessage } from '../../utils/errorMessage';

export default function ProductForm() {
  const navigate = useNavigate(); const [form, setForm] = useState({ name: '', slug: '', category: '', price: '', unit: 'kg', origin: '', stock: '0' }); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const submit = async (event) => { event.preventDefault(); setSaving(true); setError(''); try { await adminService.createAdmin('products', { ...form, price: Number(form.price), stock: Number(form.stock) }); navigate('/admin/products'); } catch (saveError) { setError(getErrorMessage(saveError, 'Không thể tạo sản phẩm.')); } finally { setSaving(false); } };
  return <PageContainer><p className="eyebrow">Fresh admin</p><h1 className="mt-3 font-display text-5xl text-forest">Tạo sản phẩm</h1>{error && <div className="mt-6"><ErrorMessage message={error} /></div>}<form className="mt-8 grid max-w-2xl gap-4 rounded-2xl bg-white p-6 sm:grid-cols-2" onSubmit={submit}><Input label="Tên sản phẩm" value={form.name} onChange={update('name')} required /><Input label="Slug" value={form.slug} onChange={update('slug')} required /><Input label="Category ID" value={form.category} onChange={update('category')} required /><Input label="Giá" type="number" min="0" value={form.price} onChange={update('price')} required /><Input label="Đơn vị" value={form.unit} onChange={update('unit')} required /><Input label="Xuất xứ" value={form.origin} onChange={update('origin')} required /><Input label="Tồn kho" type="number" min="0" value={form.stock} onChange={update('stock')} required /><Button type="submit" disabled={saving} className="sm:col-span-2">{saving ? 'Đang lưu...' : 'Tạo sản phẩm'}</Button></form></PageContainer>;
}
