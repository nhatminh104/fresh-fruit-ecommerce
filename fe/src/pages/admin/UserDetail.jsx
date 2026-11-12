import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Mail, Phone, Shield, User as UserIcon } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';
import { updateAdmin } from '../../services/adminService';
import { getErrorMessage } from '../../utils/errorMessage';

const STATUS_LABEL = { active: 'Hoạt động', blocked: 'Đã khóa' };
const ROLE_LABEL = { customer: 'Khách hàng', admin: 'Quản trị viên' };

export default function UserDetail() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const response = await api.get(`/admin/users/${id}`);
      setData(response.data.data);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Không thể tải chi tiết người dùng.'));
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const isSelf = currentUser && String(currentUser._id) === String(id);

  const toggleStatus = async () => {
    setBusy(true);
    try {
      await updateAdmin('users', id, { status: data.status === 'blocked' ? 'active' : 'blocked' });
      toast.success('Đã cập nhật trạng thái tài khoản.');
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Không thể cập nhật.'));
    } finally {
      setBusy(false);
      setPendingAction(null);
    }
  };

  const toggleRole = async () => {
    setBusy(true);
    try {
      await updateAdmin('users', id, { role: data.role === 'admin' ? 'customer' : 'admin' });
      toast.success('Đã cập nhật vai trò.');
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Không thể cập nhật vai trò.'));
    } finally {
      setBusy(false);
      setPendingAction(null);
    }
  };

  const confirmPending = () => (pendingAction === 'status' ? toggleStatus() : toggleRole());

  return (
    <PageContainer>
      <Link className="text-sm font-semibold text-forest hover:text-leaf" to="/admin/users">
        ← Quay lại danh sách
      </Link>
      <h1 className="mt-4 font-display text-4xl text-forest sm:text-5xl">Chi tiết người dùng</h1>

      {error ? (
        <div className="mt-6">
          <ErrorMessage message={error} />
          <Button type="button" variant="secondary" className="mt-3" onClick={load}>
            Thử lại
          </Button>
        </div>
      ) : !data ? (
        <Loading />
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-1">
            <div className="flex items-center gap-4">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <UserIcon size={28} />
              </span>
              <div className="min-w-0">
                <h2 className="truncate font-display text-xl font-bold text-forest">
                  {data.fullName || 'Chưa đặt tên'}
                </h2>
                <p className="truncate text-sm text-ink-muted">{data.email}</p>
              </div>
            </div>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-2.5 text-slate-600">
                <Mail size={15} className="text-ink-muted" /> {data.email}
              </div>
              {data.phone && (
                <div className="flex items-center gap-2.5 text-slate-600">
                  <Phone size={15} className="text-ink-muted" /> {data.phone}
                </div>
              )}
              <div className="flex items-center gap-2.5 text-slate-600">
                <Shield size={15} className="text-ink-muted" /> {ROLE_LABEL[data.role] || data.role}
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  data.status === 'blocked' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-leaf'
                }`}
              >
                {STATUS_LABEL[data.status] || data.status}
              </span>
              <span className="rounded-full bg-cream px-3 py-1 text-xs font-bold text-forest">
                Tham gia {new Date(data.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
            {!isSelf && (
              <div className="mt-6 space-y-2 border-t border-slate-100 pt-5">
                <Button
                  type="button"
                  variant={data.status === 'blocked' ? 'primary' : 'secondary'}
                  className="w-full"
                  disabled={busy}
                  onClick={() => setPendingAction('status')}
                >
                  {data.status === 'blocked' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  disabled={busy}
                  onClick={() => setPendingAction('role')}
                >
                  Đổi vai trò → {ROLE_LABEL[data.role === 'admin' ? 'customer' : 'admin']}
                </Button>
              </div>
            )}
            {isSelf && (
              <p className="mt-5 rounded-xl bg-cream px-3 py-2 text-xs text-ink-muted">
                Bạn không thể tự thay đổi vai trò hoặc trạng thái tài khoản của chính mình.
              </p>
            )}
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
            <h3 className="font-display text-lg font-bold text-forest">Thông tin tài khoản</h3>
            <dl className="mt-4 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase text-ink-muted">Họ tên</dt>
                <dd className="mt-1 text-slate-700">{data.fullName || '-'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-ink-muted">Email</dt>
                <dd className="mt-1 text-slate-700">{data.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-ink-muted">Điện thoại</dt>
                <dd className="mt-1 text-slate-700">{data.phone || '-'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-ink-muted">Vai trò</dt>
                <dd className="mt-1 text-slate-700">{ROLE_LABEL[data.role] || data.role}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-ink-muted">Trạng thái</dt>
                <dd className="mt-1 text-slate-700">{STATUS_LABEL[data.status] || data.status}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-ink-muted">Ngày tạo</dt>
                <dd className="mt-1 text-slate-700">
                  {new Date(data.createdAt).toLocaleString('vi-VN')}
                </dd>
              </div>
              {data.updatedAt && (
                <div>
                  <dt className="text-xs font-semibold uppercase text-ink-muted">Cập nhật lần cuối</dt>
                  <dd className="mt-1 text-slate-700">
                    {new Date(data.updatedAt).toLocaleString('vi-VN')}
                  </dd>
                </div>
              )}
            </dl>
          </section>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingAction)}
        onClose={() => setPendingAction(null)}
        onConfirm={confirmPending}
        title={pendingAction === 'status' ? 'Đổi trạng thái tài khoản' : 'Đổi vai trò'}
        message={
          pendingAction === 'status'
            ? `Đổi trạng thái tài khoản của ${data?.fullName || data?.email}?`
            : `Đổi vai trò của ${data?.fullName || data?.email} sang ${ROLE_LABEL[data?.role === 'admin' ? 'customer' : 'admin']}?`
        }
        confirmLabel={pendingAction === 'status' ? 'Đổi trạng thái' : 'Đổi vai trò'}
        danger={pendingAction === 'status' && data?.status !== 'blocked'}
      />
    </PageContainer>
  );
}
