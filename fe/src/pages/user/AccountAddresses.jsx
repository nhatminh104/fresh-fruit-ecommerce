import { useEffect, useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import * as addressService from '../../services/addressService';
import { getErrorMessage } from '../../utils/errorMessage';

const empty = { recipientName: '', phone: '', province: '', district: '', ward: '', streetAddress: '', isDefault: false };
export default function AccountAddresses() {
  const [addresses, setAddresses] = useState([]); const [form, setForm] = useState(empty); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  const load = () => addressService.getAddresses().then((response) => setAddresses(response.data.data)).catch((requestError) => setError(getErrorMessage(requestError, 'Không thể tải địa chỉ.'))).finally(() => setLoading(false));
  useEffect(load, []);
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));
  const submit = async (event) => { event.preventDefault(); setSaving(true); setError(''); try { await addressService.createAddress(form); setForm(empty); await load(); } catch (saveError) { setError(getErrorMessage(saveError, 'Không thể thêm địa chỉ.')); } finally { setSaving(false); } };
  const remove = async (id) => { try { await addressService.deleteAddress(id); await load(); } catch (deleteError) { setError(getErrorMessage(deleteError, 'Không thể xóa địa chỉ.')); } };
  const fields = [['recipientName', 'Người nhận'], ['phone', 'Số điện thoại'], ['province', 'Tỉnh/Thành phố'], ['district', 'Quận/Huyện'], ['ward', 'Phường/Xã'], ['streetAddress', 'Địa chỉ cụ thể']];
  return <PageContainer><p className="eyebrow">Tài khoản</p><h1 className="mt-3 font-display text-5xl text-forest">Địa chỉ giao hàng</h1>{error && <div className="mt-6"><ErrorMessage message={error} /></div>}{loading ? <Loading /> : <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]"><form className="space-y-4 rounded-2xl bg-white p-6" onSubmit={submit}><h2 className="font-display text-3xl text-forest">Thêm địa chỉ</h2>{fields.map(([field, label]) => <Input key={field} label={label} value={form[field]} onChange={update(field)} required />)}<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isDefault} onChange={update('isDefault')} /> Đặt làm mặc định</label><Button type="submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Thêm địa chỉ'}</Button></form><div className="space-y-4">{addresses.length === 0 ? <p className="rounded-2xl bg-white p-6 text-slate-500">Bạn chưa có địa chỉ nào.</p> : addresses.map((address) => <article className="rounded-2xl bg-white p-6 shadow-sm" key={address._id}><div className="flex justify-between gap-4"><div><h2 className="font-bold text-forest">{address.recipientName} · {address.phone}</h2><p className="mt-2 text-sm text-slate-500">{address.streetAddress}, {address.ward}, {address.district}, {address.province}</p>{address.isDefault && <span className="mt-3 inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">Mặc định</span>}</div><button className="text-sm font-semibold text-red-600" onClick={() => remove(address._id)}>Xóa</button></div></article>)}</div></div>}</PageContainer>;
}
