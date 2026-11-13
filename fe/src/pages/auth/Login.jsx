import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import Button from '../../components/common/Button';
import ErrorMessage from '../../components/common/ErrorMessage';
import Input from '../../components/common/Input';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../utils/errorMessage';
import { isEmail, isRequired } from '../../utils/validators';

export default function Login({ portal = 'customer' }) {
  const isAdminPortal = portal === 'admin';
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isEmail(form.email) || !isRequired(form.password)) {
      setError('Vui lòng nhập email hợp lệ và mật khẩu.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const currentUser = await login({ email: form.email.trim(), password: form.password, role: portal });
      const from = location.state?.from;
      const destination = from ? `${from.pathname || ''}${from.search || ''}` : null;
      navigate(destination || (currentUser.role === 'admin' ? '/admin' : '/'), { replace: true });
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Đăng nhập không thành công.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-surface-border bg-white p-7 shadow-card sm:p-9">
      <p className="eyebrow">Fresh account</p>
      <h1 className="mt-2 font-display text-4xl text-forest">{isAdminPortal ? 'Đăng nhập Admin' : 'Đăng nhập'}</h1>
      <p className="mt-2 text-sm text-slate-500">
        {isAdminPortal ? 'Khu vực quản trị dành cho quản trị viên.' : 'Tiếp tục mua sắm và theo dõi đơn hàng của bạn.'}
      </p>

      {error && (
        <div className="mt-5">
          <ErrorMessage message={error} />
        </div>
      )}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="ban@example.com"
          value={form.email}
          onChange={update('email')}
          required
        />
        <Input
          label="Mật khẩu"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Nhập mật khẩu"
          value={form.password}
          onChange={update('password')}
          required
        />
        <Button
          type="submit"
          disabled={submitting}
          className="w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogIn size={17} aria-hidden="true" />
          {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
        <Link className="font-semibold text-forest hover:text-leaf" to="/forgot-password">
          Quên mật khẩu?
        </Link>
        {!isAdminPortal && (
          <span>
            Chưa có tài khoản?{' '}
            <Link className="font-semibold text-forest hover:text-leaf" to="/register">
              Đăng ký
            </Link>
          </span>
        )}
      </div>
    </div>
  );
}
