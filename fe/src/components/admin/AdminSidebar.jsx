import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, ShoppingCart, Users, Star, Ticket, Boxes, Leaf } from 'lucide-react';

const links = [
  ['/admin', 'Dashboard', LayoutDashboard],
  ['/admin/products', 'Sản phẩm', Package],
  ['/admin/categories', 'Danh mục', Tags],
  ['/admin/orders', 'Đơn hàng', ShoppingCart],
  ['/admin/users', 'Người dùng', Users],
  ['/admin/reviews', 'Đánh giá', Star],
  ['/admin/vouchers', 'Voucher', Ticket],
  ['/admin/inventory', 'Kho hàng', Boxes],
];

export default function AdminSidebar() {
  return (
    <aside className="w-full shrink-0 bg-gradient-to-b from-forest to-[#1e4d2b] p-3 text-white md:sticky md:top-0 md:h-screen md:w-60 md:overflow-y-auto md:p-5">
      <div className="mb-4 hidden items-center gap-2.5 px-2 md:flex">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
          <Leaf size={18} className="text-leaf" />
        </span>
        <div>
          <p className="text-sm font-bold leading-tight">Fresh Fruit</p>
          <p className="text-[11px] text-white/60">Quản trị hệ thống</p>
        </div>
      </div>
      <nav className="flex gap-1.5 overflow-x-auto md:flex-col md:space-y-1 md:overflow-visible">
        {links.map(([to, label, Icon]) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
