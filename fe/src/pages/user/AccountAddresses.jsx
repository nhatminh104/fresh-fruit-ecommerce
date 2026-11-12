import { useEffect, useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import * as addressService from '../../services/addressService';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../contexts/ToastContext';

const empty = { recipientName: '', phone: '', province: '', district: '', ward: '', streetAddress: '', isDefault: false };
const FIELDS = [
  ['recipientName', 'Người nhận'],
  ['phone', 'Số điện thoại'],
  ['province', 'Tỉnh/Thành phố'],
  ['district', 'Quận/Huyện'],
  ['ward', 'Phường/Xã'],
  ['streetAddress', 'Địa chỉ cụ thể']
];

export default function AccountAddresses() {
  const toast = useToast();
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => addressService.getAddresses()
    .then((response) => setAddresses(response.data.data))
    .catch((requestError) => setError(getErrorMessage(requestError, 'Không thể tải địa chỉ.')))
    .finally(() => setLoading(false));

  useEffect(load, []);

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));

  const reset = () => { setForm(empty); setEditingId(null); };

  const startEdit = (address) => {
    setEditingId(address._id);
    setForm({ ...empty, ...address });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) await addressService.updateAddress(editingId, form);
      else await addressService.createAddress(form);
      toast.success(editingId ? 'Đã cập nhật địa chỉ.' : 'Đã thêm địa chỉ mới.');
      reset();
      await load();
    } catch (saveError) {
      setError(getErrorMessage(saveError, editingId ? 'Không thể cập nhật địa chỉ.' : 'Không thể thêm địa chỉ.'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Xóa địa chỉ này?')) return;
    try {
      await addressService.deleteAddress(id);
      if (editingId === id) reset();
      await load();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, 'Không thể xóa địa chỉ.'));
    }
  };

  return (
    <PageContainer>
      <p className="eyebrow">Tài khoản</p>
      <h1 className="mt-3 font-display text-5xl text-forest">Địa chỉ giao hàng</h1>
      {error && <div className="mt-6"><ErrorMessage message={error} /></div>}
      {loading ? <Loading /> : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <form className="space-y-4 rounded-2xl bg-white p-6" onSubmit={submit}>
            <h2 className="font-display text-3xl text-forest">{editingId ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ'}</h2>
            {FIELDS.map(([field, label]) => (
              <Input key={field} label={label} value={form[field]} onChange={update(field)} required />
            ))}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isDefault} onChange={update('isDefault')} /> Đặt làm mặc định
            </label>
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>{saving ? 'Đang lưu...' : editingId ? 'Lưu thay đổi' : 'Thêm địa chỉ'}</Button>
              {editingId && <Button type="button" variant="secondary" onClick={reset}>Hủy</Button>}
            </div>
          </form>
          <div className="space-y-4">
            {addresses.length === 0 ? (
              <p className="rounded-2xl bg-white p-6 text-slate-500">Bạn chưa có địa chỉ nào.</p>
            ) : addresses.map((address) => (
              <article className="rounded-2xl bg-white p-6 shadow-sm" key={address._id}>
                <div className="flex justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-forest">{address.recipientName} · {address.phone}</h2>
                    <p className="mt-2 text-sm text-slate-500">{address.streetAddress}, {address.ward}, {address.district}, {address.province}</p>
                    {address.isDefault && <span className="mt-3 inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">Mặc định</span>}
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 text-right">
                    <button className="text-sm font-semibold text-leaf" onClick={() => startEdit(address)}>Sửa</button>
                    <button className="text-sm font-semibold text-red-600" onClick={() => remove(address._id)}>Xóa</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
