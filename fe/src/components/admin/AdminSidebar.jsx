import { Link, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Users,
  Star,
  Ticket,
  Boxes,
  Leaf,
  X,
} from 'lucide-react';

const GROUPS = [
  {
    label: 'Tổng quan',
    items: [['/admin', 'Dashboard', LayoutDashboard]],
  },
  {
    label: 'Quản lý',
    items: [
      ['/admin/products', 'Sản phẩm', Package],
      ['/admin/categories', 'Danh mục', Tags],
      ['/admin/orders', 'Đơn hàng', ShoppingCart],
      ['/admin/inventory', 'Kho hàng', Boxes],
    ],
  },
  {
    label: 'Khách hàng',
    items: [
      ['/admin/users', 'Người dùng', Users],
      ['/admin/reviews', 'Đánh giá', Star],
    ],
  },
  {
    label: 'Marketing',
    items: [['/admin/vouchers', 'Voucher', Ticket]],
  },
];

export default function AdminSidebar({ open = false, onClose }) {
  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-surface-border bg-white transition-transform duration-200 md:static md:z-auto md:w-60 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
          <Link to="/admin" className="flex items-center gap-2.5" onClick={onClose}>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-white">
              <Leaf size={18} />
            </span>
            <div>
              <p className="font-display text-base font-bold leading-tight text-forest">Fresh Fruit</p>
              <p className="text-[11px] text-ink-muted">Quản trị hệ thống</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-ink-muted hover:bg-surface-subtle md:hidden"
            aria-label="Đóng menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {GROUPS.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-ink-light">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map(([to, label, Icon]) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={to === '/admin'}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                          isActive
                            ? 'bg-brand-50 text-brand-700'
                            : 'text-ink-muted hover:bg-surface-subtle hover:text-ink'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-500" />
                          )}
                          <Icon size={17} className="shrink-0" />
                          <span className="truncate">{label}</span>
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer mini */}
        <div className="border-t border-surface-border px-5 py-3">
          <p className="text-[11px] text-ink-light">Fresh Fruit Admin v1.0</p>
        </div>
      </aside>
    </>
  );
}
