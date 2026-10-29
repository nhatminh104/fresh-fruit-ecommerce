import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, ChevronRight, CircleHelp, Facebook, Leaf, Menu, PackageCheck, Search, ShoppingBag, Sparkles, UserRound, X } from 'lucide-react';
import { homeData } from '../../data/homeData';
import { CartContext } from '../../contexts/CartContext';

const formatPrice = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);

function SafeImage({ src, alt, className, eager = false }) {
  const [failed, setFailed] = React.useState(false);
  if (failed) return <div aria-label={alt} className={`${className} grid place-items-center bg-[#e8eee4] text-leaf`}><Leaf size={30} aria-hidden="true" /></div>;
  return <img src={src} alt={alt} className={className} loading={eager ? 'eager' : 'lazy'} onError={() => setFailed(true)} />;
}

function SiteHeader({ cartCount }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const navigate = useNavigate();
  const links = [['Trang chủ', '/'], ['Trái cây', '/products'], ['Danh mục', '/categories'], ['Về Fresh', '/about']];
  const submitSearch = (event) => { event.preventDefault(); const value = query.trim(); if (value) navigate(`/search?q=${encodeURIComponent(value)}`); };
  return <>
    <div className="announcement-bar"><span>Giao hàng miễn phí cho đơn từ 500.000đ</span><span className="hidden sm:inline" aria-hidden="true">•</span><span className="hidden sm:inline">Tươi ngon mỗi ngày</span></div>
    <header className="sticky top-0 z-40 border-b border-forest/10 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-3 px-5 lg:px-8">
        <Link to="/" className="brand-mark shrink-0" aria-label="Fresh, trang chủ"><span className="brand-icon"><Leaf size={21} /></span><span>fresh<span className="text-leaf">.</span></span></Link>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Điều hướng chính">{links.map(([label, to]) => <Link key={to} to={to} className="nav-link">{label}</Link>)}</nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <form className="header-search" onSubmit={submitSearch} role="search"><Search size={17} aria-hidden="true" /><input aria-label="Tìm kiếm sản phẩm" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm trái cây..." /></form>
          <button className="icon-button hidden sm:grid" aria-label="Tài khoản" onClick={() => navigate('/login')}><UserRound size={19} /></button>
          <button className="icon-button relative" aria-label={`Giỏ hàng, ${cartCount} sản phẩm`} onClick={() => navigate('/cart')}><ShoppingBag size={19} /><span className="cart-badge">{cartCount}</span></button>
          <button className="icon-button md:hidden" aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'} aria-expanded={mobileOpen} onClick={() => setMobileOpen((value) => !value)}>{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
      {mobileOpen && <nav className="mobile-nav md:hidden" aria-label="Điều hướng di động">{links.map(([label, to]) => <Link key={to} to={to} onClick={() => setMobileOpen(false)}>{label}</Link>)}<Link to="/login" onClick={() => setMobileOpen(false)}>Tài khoản</Link></nav>}
    </header>
  </>;
}

function ProductCard({ product, onAdd }) {
  const [adding, setAdding] = React.useState(false);
  const add = () => { setAdding(true); onAdd(product); window.setTimeout(() => setAdding(false), 700); };
  return <article className="product-card group">
    <Link to={`/products/${product.id}`} className="product-image-wrap"><SafeImage src={product.image} alt={product.name} className="product-image" /><span className="product-tag">{product.tag}</span><button type="button" aria-label={`Thêm ${product.name} vào giỏ`} onClick={(event) => { event.preventDefault(); add(); }} className="add-button">{adding ? <Check size={17} /> : <ShoppingBag size={17} />}</button></Link>
    <div className="mt-4 flex min-h-[68px] items-start justify-between gap-3"><div><Link to={`/products/${product.id}`} className="product-name">{product.name}</Link><p className="mt-1 text-xs text-slate-400">{product.unit}</p></div><p className="shrink-0 font-bold text-forest">{formatPrice(product.price)}</p></div>
  </article>;
}

function SiteFooter() {
  return <footer className="bg-[#173d29] px-5 py-14 text-white lg:px-8"><div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
    <div><div className="brand-mark text-white"><span className="brand-icon bg-white text-forest"><Leaf size={21} /></span><span>fresh<span className="text-orange">.</span></span></div><p className="mt-5 max-w-sm text-sm leading-7 text-white/65">Những mùa quả ngon nhất đến căn bếp của bạn — tự nhiên, minh bạch và được chọn lựa bằng sự tử tế.</p><p className="mt-5 text-sm text-white/70">Hotline <strong className="text-white">1900 2025</strong><br />hello@fresh.vn · TP. Hồ Chí Minh</p><div className="mt-6 flex gap-3"><a className="social" href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook size={16} /></a><a className="social" href="https://www.instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><Sparkles size={16} /></a></div></div>
    <div><h3 className="footer-title">Khám phá</h3><Link className="footer-link" to="/products">Trái cây tươi</Link><Link className="footer-link" to="/categories">Danh mục</Link><Link className="footer-link" to="/about">Về Fresh</Link><Link className="footer-link" to="/faq">Câu hỏi thường gặp</Link></div>
    <div><h3 className="footer-title">Hỗ trợ</h3><Link className="footer-link" to="/shipping-policy">Chính sách giao hàng</Link><Link className="footer-link" to="/return-policy">Đổi trả & hoàn tiền</Link><Link className="footer-link" to="/terms">Điều khoản sử dụng</Link><Link className="footer-link" to="/contact">Liên hệ</Link></div>
  </div><div className="mx-auto mt-12 flex max-w-7xl flex-col gap-2 border-t border-white/10 pt-5 text-xs text-white/45 sm:flex-row sm:justify-between"><span>© 2025 Fresh. All rights reserved.</span><span>Thanh toán an toàn · Giao hàng thuận tiện</span></div></footer>;
}

export default function Home() {
  const { items, addItem } = React.useContext(CartContext);
  const [notice, setNotice] = React.useState('');
  const cartCount = items.reduce((total, item) => total + (item.quantity || 1), 0);
  const addToCart = (product) => { addItem({ ...product, quantity: 1 }); setNotice(`${product.name} đã được thêm vào giỏ hàng`); window.setTimeout(() => setNotice(''), 2600); };
  return <div className="min-h-screen bg-cream"><SiteHeader cartCount={cartCount} />{notice && <div role="status" className="toast-message">{notice}</div>}<main>
    <section className="hero-wrap"><div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 lg:grid-cols-[.88fr_1.12fr] lg:px-8 lg:py-16"><div className="relative z-10"><p className="eyebrow"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-orange" /> Mùa ngon đang đến</p><h1 className="mt-5 max-w-xl font-display text-5xl leading-[1.04] text-forest sm:text-6xl lg:text-7xl">Tươi lành,<br /><em>tự nhiên</em> hơn.</h1><p className="mt-6 max-w-md text-base leading-7 text-slate-500">Trái cây được chọn từ những vườn trồng tử tế, giao đến bạn thuận tiện để giữ trọn vị ngon.</p><div className="mt-8 flex flex-wrap gap-3"><Link to="/products" className="btn-primary">Khám phá trái cây <ArrowRight size={17} /></Link><Link to="/about" className="btn-secondary">Câu chuyện Fresh</Link></div><div className="mt-10 flex gap-8 border-t border-forest/10 pt-5"><div><p className="font-display text-2xl text-forest">24h</p><p className="text-xs text-slate-500">từ vườn đến tay</p></div><div><p className="font-display text-2xl text-forest">Tận tâm</p><p className="text-xs text-slate-500">trong từng đơn hàng</p></div></div></div><div className="relative lg:pl-4"><div className="hero-orbit" /><SafeImage src={homeData.hero.image} alt={homeData.hero.alt} eager className="hero-image" /><div className="hero-note"><div className="grid h-10 w-10 place-items-center rounded-full bg-[#e9f2e5] text-leaf"><Check size={18} /></div><div><p className="text-xs font-bold text-forest">Chọn kỹ từng ngày</p><p className="text-[11px] text-slate-400">Tươi ngon, rõ nguồn gốc</p></div></div></div></div></section>
    <section className="section-shell"><div className="section-heading"><div><p className="eyebrow">Chọn theo khẩu vị</p><h2 className="section-title">Có gì ngon hôm nay?</h2></div><Link className="section-link" to="/categories">Xem tất cả <ChevronRight className="ml-1 inline" size={15} /></Link></div><div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">{homeData.categories.map((category) => <Link to={`/products?category=${category.slug}`} key={category.slug} className="category-card"><SafeImage src={category.image} alt={category.name} className="aspect-[.95] w-full object-cover transition duration-500" /><div><h3>{category.name}</h3><p>{category.description}</p></div></Link>)}</div></section>
    <section className="bg-white px-5 py-20 lg:px-8"><div className="mx-auto max-w-7xl"><div className="section-heading"><div><p className="eyebrow">Được yêu thích</p><h2 className="section-title">Món ngon trong tuần</h2></div><Link className="section-link" to="/products">Xem cửa hàng <ArrowRight className="ml-1 inline" size={15} /></Link></div><div className="mt-8 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{homeData.products.map((product) => <ProductCard key={product.id} product={product} onAdd={addToCart} />)}</div></div></section>
    <section className="section-shell"><div className="season-banner"><div className="relative z-10 max-w-md"><p className="eyebrow text-orange">Gợi ý theo mùa</p><h2 className="mt-4 font-display text-4xl leading-tight text-white sm:text-5xl">Vị ngọt của<br /><em>mùa hè</em></h2><p className="mt-4 text-sm leading-6 text-white/70">Khám phá những loại quả mọng nước đang vào mùa và chọn món hợp khẩu vị.</p><Link to="/products?category=trai-cay-nhiet-doi" className="mt-7 inline-flex items-center gap-2 rounded-full bg-orange px-5 py-3 text-sm font-bold text-white transition hover:bg-[#e68f45]">Khám phá ngay <ArrowRight size={16} /></Link></div><SafeImage src={homeData.seasonal.image} alt={homeData.seasonal.alt} className="season-image" /></div></section>
    <section className="border-y border-slate-100 bg-[#f4f6ef] px-5 py-16 lg:px-8"><div className="mx-auto max-w-7xl"><div className="text-center"><p className="eyebrow justify-center">Vì sao chọn Fresh?</p><h2 className="section-title">Tươi từ tâm, ngon từ vườn.</h2></div><div className="mt-10 grid gap-8 sm:grid-cols-3">{homeData.benefits.map((benefit) => <div className="text-center" key={benefit.title}><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-forest">{benefit.icon === 'origin' ? <Leaf size={21} /> : benefit.icon === 'package' ? <PackageCheck size={21} /> : <CircleHelp size={21} />}</div><h3 className="mt-4 font-bold text-forest">{benefit.title}</h3><p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">{benefit.text}</p></div>)}</div></div></section>
    <section className="section-shell"><div className="origin-panel"><div className="origin-image" role="img" aria-label="Vườn cây xanh mát" /><div className="flex flex-col justify-center p-8 sm:p-12"><p className="eyebrow">Từ nông trại đến bàn ăn</p><h2 className="mt-3 font-display text-4xl leading-tight text-forest sm:text-5xl">Biết rõ mình đang ăn gì.</h2><p className="mt-5 text-sm leading-7 text-slate-500">Fresh xây dựng trải nghiệm mua sắm minh bạch: thông tin sản phẩm rõ ràng, lựa chọn vừa đủ và chăm chút trong từng khâu giao hàng.</p><div className="mt-6 grid grid-cols-2 gap-4 text-sm font-bold text-forest"><span className="flex items-center gap-2"><Check size={16} className="text-leaf" /> Thông tin rõ ràng</span><span className="flex items-center gap-2"><Check size={16} className="text-leaf" /> Chọn lọc mỗi ngày</span><span className="flex items-center gap-2"><Check size={16} className="text-leaf" /> Đóng gói cẩn thận</span><span className="flex items-center gap-2"><Check size={16} className="text-leaf" /> Hỗ trợ tận tâm</span></div><Link to="/about" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-forest">Tìm hiểu câu chuyện Fresh <ArrowRight size={16} /></Link></div></div></section>
    <section className="bg-cream px-5 pb-16 pt-2 lg:px-8"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 rounded-3xl bg-[#e9f0e4] p-8 sm:flex-row sm:items-center sm:p-10"><div><p className="eyebrow">Sẵn sàng cho bữa ăn tươi hơn?</p><h2 className="mt-2 font-display text-3xl text-forest">Chọn món ngon cho hôm nay.</h2></div><Link to="/products" className="btn-primary shrink-0 self-start sm:self-auto">Đi đến cửa hàng <ArrowRight size={16} /></Link></div></section>
  </main><SiteFooter /></div>;
}
