import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Heart, Instagram, Leaf, Mail, MapPin, Phone, ShieldCheck, Truck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-surface-border bg-surface-subtle text-ink">
      {/* Value props banner */}
      <div className="border-b border-surface-border bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                <Leaf size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink">100% Tươi ngon tự nhiên</h4>
                <p className="text-xs text-ink-muted mt-0.5">Thu hoạch chuẩn hữu cơ VietGAP</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                <Truck size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink">Giao nhanh trong 2h</h4>
                <p className="text-xs text-ink-muted mt-0.5">Miễn phí ship đơn từ 500k</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink">Đổi trả tận nơi</h4>
                <p className="text-xs text-ink-muted mt-0.5">Đổi mới trong 24h nếu hư hỏng</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                <Heart size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink">Tận tâm phục vụ</h4>
                <p className="text-xs text-ink-muted mt-0.5">Hotline hỗ trợ 1900 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 4-column Footer */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Cột 1: Thương hiệu */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 text-white shadow-sm">
                <Leaf size={20} strokeWidth={2.2} />
              </div>
              <span className="font-display text-2xl font-black text-ink">
                Fresh<span className="text-brand-500">.</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-ink-muted">
              Hệ thống cung cấp trái cây tươi ngon, tuyển chọn tận vườn với quy trình bảo quản lạnh hiện đại.
              Mang đến hương vị thiên nhiên ngọt lành trọn vẹn cho gia đình bạn.
            </p>
            <div className="flex gap-2.5 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="grid h-9 w-9 place-items-center rounded-full border border-surface-border bg-white text-ink-muted hover:border-brand-500 hover:text-brand-500 transition-colors"
                aria-label="Facebook Fresh Fruit"
              >
                <Facebook size={16} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="grid h-9 w-9 place-items-center rounded-full border border-surface-border bg-white text-ink-muted hover:border-brand-500 hover:text-brand-500 transition-colors"
                aria-label="Instagram Fresh Fruit"
              >
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Cột 2: Hỗ trợ khách hàng */}
          <div>
            <h3 className="footer-title text-brand-700">Hỗ trợ khách hàng</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/products" className="footer-link">
                  Tất cả sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/categories" className="footer-link">
                  Danh mục trái cây
                </Link>
              </li>
              <li>
                <Link to="/vouchers" className="footer-link">
                  Voucher & Khuyến mãi
                </Link>
              </li>
              <li>
                <Link to="/faq" className="footer-link">
                  Câu hỏi thường gặp (FAQ)
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="footer-link">
                  Chính sách giao hàng
                </Link>
              </li>
              <li>
                <Link to="/return-policy" className="footer-link">
                  Chính sách đổi trả & hoàn tiền
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Về Fresh */}
          <div>
            <h3 className="footer-title text-brand-700">Thông tin & Chính sách</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/about" className="footer-link">
                  Giới thiệu về Fresh
                </Link>
              </li>
              <li>
                <Link to="/contact" className="footer-link">
                  Liên hệ hợp tác
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="footer-link">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link to="/terms" className="footer-link">
                  Điều khoản dịch vụ
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="footer-link">
                  Đánh giá từ khách hàng
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Liên hệ */}
          <div>
            <h3 className="footer-title text-brand-700">Liên hệ đặt hàng</h3>
            <ul className="mt-4 space-y-3 text-sm text-ink-muted">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="shrink-0 text-brand-500 mt-0.5" />
                <span>Số 1 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="shrink-0 text-brand-500" />
                <span>
                  Hotline: <strong className="text-ink">1900 2025</strong> (8:00 - 21:00)
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="shrink-0 text-brand-500" />
                <span>hello@freshfruit.vn</span>
              </li>
            </ul>
            <div className="mt-5 rounded-2xl border border-surface-border bg-white p-3.5">
              <p className="text-xs font-bold text-ink">Thanh toán an toàn</p>
              <p className="text-[11px] text-ink-muted mt-0.5">
                Hỗ trợ COD (Tiền mặt) & Thanh toán thẻ Online
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-surface-border bg-white py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-xs text-ink-muted sm:flex-row sm:px-6 lg:px-8">
          <p>© 2026 Fresh Fruit Ecommerce. Tất cả các quyền được bảo lưu.</p>
          <div className="flex gap-4">
            <Link to="/privacy-policy" className="hover:text-brand-500">
              Chính sách bảo mật
            </Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-brand-500">
              Điều khoản
            </Link>
            <span>•</span>
            <Link to="/shipping-policy" className="hover:text-brand-500">
              Vận chuyển
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
