import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Heart,
  Leaf,
  LogOut,
  Menu,
  PhoneCall,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  User,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { items } = useCart();

  const [query, setQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const cartCount = items?.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0) || 0;

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname, location.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    const cleanQuery = query.trim();
    if (cleanQuery) {
      navigate(`/search?search=${encodeURIComponent(cleanQuery)}`);
    } else {
      navigate('/products');
    }
  };

  const navLinks = [
    { label: 'Trang chủ', to: '/' },
    { label: 'Tất cả sản phẩm', to: '/products' },
    { label: 'Danh mục', to: '/categories' },
    { label: 'Ưu đãi & Voucher', to: '/vouchers' },
    { label: 'Về chúng tôi', to: '/about' },
    { label: 'Liên hệ', to: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-surface-border shadow-subtle">
      {/* 1. Topbar */}
      <div className="border-b border-surface-border bg-surface-subtle py-1.5 px-4 text-xs font-semibold text-ink-muted">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-brand-700">
              <Truck size={14} className="text-brand-500" />
              <span>Miễn phí giao hàng cho đơn từ 500.000đ</span>
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-ink-muted">
              <ShieldCheck size={14} className="text-brand-500" />
              <span>100% Trái cây sạch, nguồn gốc rõ ràng</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="tel:19002025"
              className="flex items-center gap-1 text-ink-muted hover:text-brand-500 transition-colors"
            >
              <PhoneCall size={13} className="text-brand-500" />
              <span>Hotline: <strong className="text-ink">1900 2025</strong></span>
            </a>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="hidden sm:inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold text-brand-700 hover:bg-brand-100 transition-colors"
              >
                Trang quản trị
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[72px] items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="Fresh Fruit Trang chủ">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-500 text-white shadow-sm transition-transform duration-200 group-hover:scale-105 group-hover:bg-brand-700">
              <Leaf size={22} strokeWidth={2.2} />
            </div>
            <div>
              <span className="font-display text-2xl font-black tracking-tight text-ink">
                Fresh<span className="text-brand-500">.</span>
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-600 -mt-1">
                Trái cây tươi sạch
              </span>
            </div>
          </Link>

          {/* Search bar (desktop & tablet) */}
          <form
            onSubmit={handleSearch}
            className="hidden sm:flex flex-1 max-w-lg items-center header-search"
            role="search"
          >
            <Search size={18} className="shrink-0 text-ink-muted" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm táo, xoài, cam, dâu tây..."
              aria-label="Tìm kiếm sản phẩm"
            />
            <button
              type="submit"
              className="rounded-full bg-brand-500 px-3.5 py-1 text-xs font-bold text-white hover:bg-brand-700 transition-colors"
            >
              Tìm
            </button>
          </form>

          {/* User actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Wishlist */}
            <Link
              to={user ? '/wishlist' : '/login'}
              className="icon-button"
              aria-label="Danh sách yêu thích"
              title="Yêu thích"
            >
              <Heart size={20} />
            </Link>

            {/* Cart */}
            <Link
              to={user ? '/cart' : '/login'}
              className="icon-button relative"
              aria-label={`Giỏ hàng (${cartCount} sản phẩm)`}
              title="Giỏ hàng"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="cart-badge animate-in zoom-in-50 duration-150">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Account dropdown / Login button */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-surface-border bg-surface-subtle p-1.5 pr-3 text-sm font-bold text-ink hover:border-brand-500 hover:bg-white transition-all"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-brand-50 text-brand-700 font-bold text-xs">
                    {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden md:inline max-w-[100px] truncate text-xs">
                    {user.fullName || 'Tài khoản'}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-surface-border bg-white p-2 shadow-elevated animate-in fade-in zoom-in-95 duration-150"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="border-b border-surface-border px-3 py-2">
                      <p className="text-xs text-ink-muted">Xin chào,</p>
                      <p className="truncate text-sm font-bold text-ink">{user.fullName || user.email}</p>
                    </div>
                    <div className="py-1">
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-brand-700 hover:bg-brand-50 transition-colors"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <Sparkles size={16} />
                          <span>Trang quản trị</span>
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-ink hover:bg-surface-subtle hover:text-brand-500 transition-colors"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <User size={16} />
                        <span>Hồ sơ tài khoản</span>
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-ink hover:bg-surface-subtle hover:text-brand-500 transition-colors"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <ShoppingBag size={16} />
                        <span>Đơn hàng của tôi</span>
                      </Link>
                    </div>
                    <div className="border-t border-surface-border pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center justify-center rounded-full bg-brand-500 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700 transition-all shadow-sm"
              >
                Đăng nhập
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="icon-button lg:hidden"
              aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Search bar on mobile */}
        <div className="pb-3 sm:hidden">
          <form onSubmit={handleSearch} className="flex items-center header-search w-full" role="search">
            <Search size={16} className="shrink-0 text-ink-muted" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm trái cây..."
              className="text-xs"
            />
          </form>
        </div>

        {/* 3. Navigation (desktop) */}
        <nav className="hidden lg:flex items-center gap-8 py-3 border-t border-surface-border text-sm font-semibold">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `transition-colors duration-150 ${
                  isActive
                    ? 'font-bold text-brand-700 underline decoration-brand-500 decoration-2 underline-offset-8'
                    : 'text-ink-muted hover:text-brand-500'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* 4. Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-surface-border bg-white px-5 py-4 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col divide-y divide-surface-border text-sm font-semibold text-ink">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="py-3 hover:text-brand-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="py-3 text-ink hover:text-brand-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Tài khoản cá nhân
                </Link>
                <Link
                  to="/orders"
                  className="py-3 text-ink hover:text-brand-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đơn hàng của tôi
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="py-3 font-bold text-brand-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Vào trang Quản trị (Admin)
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="py-3 text-left font-bold text-red-600 hover:text-red-700"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <div className="pt-4 flex gap-3">
                <Link
                  to="/login"
                  className="flex-1 text-center btn-secondary py-2.5 text-xs"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="flex-1 text-center btn-primary py-2.5 text-xs"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
