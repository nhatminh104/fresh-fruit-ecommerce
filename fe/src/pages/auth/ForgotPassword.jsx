import { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import Button from '../../components/common/Button';
import ErrorMessage from '../../components/common/ErrorMessage';
import Input from '../../components/common/Input';
import * as authService from '../../services/authService';
import { getErrorMessage } from '../../utils/errorMessage';
import { isEmail } from '../../utils/validators';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isEmail(email)) {
      setError('Vui lòng nhập email hợp lệ.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      setResult(await authService.forgotPassword(email.trim()));
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Không thể gửi yêu cầu đặt lại mật khẩu.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-sm sm:p-9">
      <p className="eyebrow">Fresh account</p>
      <h1 className="mt-2 font-display text-4xl text-forest">Quên mật khẩu</h1>
      <p className="mt-2 text-sm text-slate-500">Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu.</p>

      {error && <div className="mt-5"><ErrorMessage message={error} /></div>}

      {result ? (
        <div className="mt-6 space-y-4">
          <p role="status" className="rounded-xl bg-green-50 p-4 text-sm text-green-800">{result.message}</p>
          {result.resetToken && (
            <div className="rounded-xl border border-orange/40 bg-orange/10 p-4 text-sm text-slate-700">
              <p className="font-semibold text-forest">Môi trường phát triển</p>
              <p className="mt-1">Email chưa được cấu hình, dùng liên kết bên dưới để đặt lại mật khẩu. Liên kết hết hạn sau {result.expiresInMinutes} phút.</p>
              <Link
                className="mt-3 inline-flex font-semibold text-forest hover:text-leaf"
                to={`/reset-password?token=${encodeURIComponent(result.resetToken)}`}
              >
                Đặt lại mật khẩu ngay
              </Link>
            </div>
          )}
          <Link className="inline-flex text-sm font-semibold text-forest hover:text-leaf" to="/login">Quay lại đăng nhập</Link>
        </div>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="ban@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Button type="submit" disabled={submitting} className="w-full justify-center disabled:cursor-not-allowed disabled:opacity-60">
            <KeyRound size={17} aria-hidden="true" />
            {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </Button>
          <Link className="inline-flex text-sm font-semibold text-forest hover:text-leaf" to="/login">Quay lại đăng nhập</Link>
        </form>
      )}
    </div>
  );
}
