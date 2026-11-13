import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import * as userService from '../../services/userService';
import * as authService from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../utils/errorMessage';

export default function AccountProfile() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [loggingOutAll, setLoggingOutAll] = useState(false);
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
  const updatePassword = (field) => (event) => setPasswordForm((current) => ({ ...current, [field]: event.target.value }));
  const changePassword = async (event) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordMessage('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Mật khẩu mới và xác nhận không khớp.');
      return;
    }
    setPasswordSaving(true);
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordMessage('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');
      setTimeout(async () => {
        await logout();
        navigate('/login');
      }, 1500);
    } catch (saveError) {
      setPasswordError(getErrorMessage(saveError, 'Không thể đổi mật khẩu.'));
    } finally {
      setPasswordSaving(false);
    }
  };
  const logoutAllSessions = async () => {
    setLoggingOutAll(true);
    try {
      await authService.logoutAll();
    } catch {
      // Vẫn đăng xuất local dù API lỗi
    } finally {
      await logout();
      navigate('/login');
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

      <div className="mt-8 max-w-2xl">
        <h2 className="font-display text-2xl text-forest">Bảo mật</h2>
        {passwordError && (
          <div className="mt-4">
            <ErrorMessage message={passwordError} />
          </div>
        )}
        {passwordMessage && (
          <p role="status" className="mt-4 rounded-xl bg-green-50 p-4 text-green-800">
            {passwordMessage}
          </p>
        )}
        <form className="mt-4 grid gap-4 rounded-2xl border border-surface-border bg-white p-6 shadow-subtle" onSubmit={changePassword}>
          <Input label="Mật khẩu hiện tại" type="password" value={passwordForm.currentPassword} onChange={updatePassword('currentPassword')} required autoComplete="current-password" />
          <Input label="Mật khẩu mới" type="password" value={passwordForm.newPassword} onChange={updatePassword('newPassword')} required autoComplete="new-password" />
          <Input label="Xác nhận mật khẩu mới" type="password" value={passwordForm.confirmPassword} onChange={updatePassword('confirmPassword')} required autoComplete="new-password" />
          <Button type="submit" variant="secondary" disabled={passwordSaving}>
            {passwordSaving ? 'Đang đổi...' : 'Đổi mật khẩu'}
          </Button>
        </form>

        <div className="mt-4 rounded-2xl border border-surface-border bg-white p-6 shadow-subtle">
          <h3 className="font-semibold text-forest">Đăng xuất mọi thiết bị</h3>
          <p className="mt-1 text-sm text-gray-600">Thu hồi toàn bộ phiên đăng nhập của tài khoản, kể cả thiết bị khác.</p>
          <Button className="mt-4" variant="danger" disabled={loggingOutAll} onClick={logoutAllSessions}>
            {loggingOutAll ? 'Đang xử lý...' : 'Đăng xuất tất cả'}
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
