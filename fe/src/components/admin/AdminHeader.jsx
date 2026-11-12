import { Link } from 'react-router-dom';
import { Leaf, LogOut, Menu, Store } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function AdminHeader({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-surface-border bg-white/90 px-4 py-3 backdrop-blur sm:px-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="grid h-9 w-9 place-items-center rounded-xl border border-surface-border text-ink hover:bg-surface-subtle md:hidden"
          aria-label="Mở menu"
        >
          <Menu size={18} />
        </button>
        <Link to="/admin" className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-white">
          <Leaf size={18} />
        </span>
        <span className="font-display text-xl font-bold text-forest">Fresh Admin</span>
      </Link>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-ink-muted sm:inline">{user?.fullName || user?.email}</span>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-surface-border px-3 py-1.5 text-xs font-bold text-ink hover:border-leaf hover:text-leaf"
        >
          <Store size={14} /> Về cửa hàng
        </Link>
        <button
          type="button"
          onClick={async () => {
            await logout();
            navigate('/login');
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
        >
          <LogOut size={14} /> Đăng xuất
        </button>
      </div>
      </div>
    </header>
  );
}
