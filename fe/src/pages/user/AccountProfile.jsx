import { useEffect, useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import * as userService from '../../services/userService';
import { getErrorMessage } from '../../utils/errorMessage';

export default function AccountProfile() {
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    userService
      .getProfile()
      .then((user) =>
        setForm({ fullName: user.fullName || '', phone: user.phone || '', email: user.email || '' })
      )
      .catch((requestError) => setError(getErrorMessage(requestError, 'Không thể tải hồ sơ.')));
  }, []);
  if (!form && !error) return <Loading />;
  if (error)
    return (
      <PageContainer>
        <ErrorMessage message={error} />
      </PageContainer>
    );
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const user = await userService.updateProfile({ fullName: form.fullName, phone: form.phone });
      setForm((current) => ({ ...current, fullName: user.fullName, phone: user.phone }));
      setMessage('Cập nhật hồ sơ thành công.');
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Không thể cập nhật hồ sơ.'));
    } finally {
      setSaving(false);
    }
  };
  return (
    <PageContainer>
      <p className="eyebrow">Tài khoản</p>
      <h1 className="mt-3 font-display text-5xl text-forest">Hồ sơ cá nhân</h1>
      {error && (
        <div className="mt-6">
          <ErrorMessage message={error} />
        </div>
      )}
      {message && (
        <p role="status" className="mt-6 rounded-xl bg-green-50 p-4 text-green-800">
          {message}
        </p>
      )}
      <form className="mt-8 grid max-w-2xl gap-4 rounded-2xl border border-surface-border bg-white p-6 shadow-subtle" onSubmit={submit}>
        <Input label="Email" value={form.email} readOnly />
        <Input label="Họ và tên" value={form.fullName} onChange={update('fullName')} required />
        <Input label="Số điện thoại" value={form.phone} onChange={update('phone')} />
        <Button type="submit" disabled={saving}>
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </form>
    </PageContainer>
  );
}
