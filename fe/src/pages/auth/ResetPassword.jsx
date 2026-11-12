import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import Button from '../../components/common/Button';
import ErrorMessage from '../../components/common/ErrorMessage';
import Input from '../../components/common/Input';
import * as authService from '../../services/authService';
import { getErrorMessage } from '../../utils/errorMessage';

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,128}$/;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token) {
      setError('Liên kết đặt lại mật khẩu không hợp lệ.');
      return;
    }
    if (!PASSWORD_PATTERN.test(form.password)) {
      setError('Mật khẩu cần 8-128 ký tự, gồm ít nhất một chữ cái và một chữ số.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      setResult(
        await authService.resetPassword({
          token,
          password: form.password,
          confirmPassword: form.confirmPassword,
        })
      );
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Không thể đặt lại mật khẩu.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-sm sm:p-9">
      <p className="eyebrow">Fresh account</p>
      <h1 className="mt-2 font-display text-4xl text-forest">Đặt lại mật khẩu</h1>
      <p className="mt-2 text-sm text-slate-500">Chọn mật khẩu mới cho tài khoản của bạn.</p>

      {error && (
        <div className="mt-5">
          <ErrorMessage message={error} />
        </div>
      )}

      {result ? (
        <div className="mt-6 space-y-4">
          <p role="status" className="rounded-xl bg-green-50 p-4 text-sm text-green-800">
            {result.message}
          </p>
          <Link className="btn-primary inline-flex" to="/login">
            Đăng nhập
          </Link>
        </div>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          {!token && <ErrorMessage message="Thiếu token đặt lại mật khẩu trong liên kết." />}
          <Input
            label="Mật khẩu mới"
            type="password"
            name="password"
            autoComplete="new-password"
            value={form.password}
            onChange={update('password')}
            required
          />
          <Input
            label="Xác nhận mật khẩu mới"
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={update('confirmPassword')}
            required
          />
          <Button
            type="submit"
            disabled={submitting || !token}
            className="w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShieldCheck size={17} aria-hidden="true" />
            {submitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
          </Button>
          <Link
            className="inline-flex text-sm font-semibold text-forest hover:text-leaf"
            to="/forgot-password"
          >
            Gửi lại yêu cầu
          </Link>
        </form>
      )}
    </div>
  );
}
