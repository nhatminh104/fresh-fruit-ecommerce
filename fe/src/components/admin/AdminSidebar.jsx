import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, ShoppingCart, Users, Star, Ticket, Boxes } from 'lucide-react';

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
    <aside className="w-full shrink-0 bg-forest p-3 text-white md:w-56 md:p-5">
      <nav className="flex gap-1.5 overflow-x-auto md:flex-col md:space-y-1.5 md:overflow-visible">
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
