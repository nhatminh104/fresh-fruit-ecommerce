import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import Button from '../../components/common/Button';
import ErrorMessage from '../../components/common/ErrorMessage';
import Input from '../../components/common/Input';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../utils/errorMessage';
import { isEmail, isRequired } from '../../utils/validators';

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,128}$/;

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isRequired(form.fullName) || form.fullName.trim().length < 2) {
      setError('Họ tên cần ít nhất 2 ký tự.');
      return;
    }
    if (!isEmail(form.email)) {
      setError('Email chưa đúng định dạng.');
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
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
      navigate('/', { replace: true });
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Đăng ký không thành công.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-sm sm:p-9">
      <p className="eyebrow">Fresh account</p>
      <h1 className="mt-2 font-display text-4xl text-forest">Tạo tài khoản</h1>
      <p className="mt-2 text-sm text-slate-500">Nhận ưu đãi, lưu địa chỉ và theo dõi đơn hàng dễ dàng.</p>

      {error && (
        <div className="mt-5">
          <ErrorMessage message={error} />
        </div>
      )}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        <Input
          label="Họ và tên"
          name="fullName"
          autoComplete="name"
          placeholder="Nguyễn Văn A"
          value={form.fullName}
          onChange={update('fullName')}
          required
        />
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
          label="Số điện thoại (không bắt buộc)"
          type="tel"
          name="phone"
          autoComplete="tel"
          placeholder="0901234567"
          value={form.phone}
          onChange={update('phone')}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Mật khẩu"
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="Tối thiểu 8 ký tự"
            value={form.password}
            onChange={update('password')}
            required
          />
          <Input
            label="Xác nhận mật khẩu"
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Nhập lại mật khẩu"
            value={form.confirmPassword}
            onChange={update('confirmPassword')}
            required
          />
        </div>
        <Button
          type="submit"
          disabled={submitting}
          className="w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UserPlus size={17} aria-hidden="true" />
          {submitting ? 'Đang tạo tài khoản...' : 'Đăng ký'}
        </Button>
      </form>

      <p className="mt-5 text-sm text-slate-500">
        Đã có tài khoản?{' '}
        <Link className="font-semibold text-forest hover:text-leaf" to="/login">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
