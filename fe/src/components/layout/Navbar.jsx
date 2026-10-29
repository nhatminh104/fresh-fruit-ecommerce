import { Link } from 'react-router-dom';
export default function Navbar() { return <nav className="mx-auto flex max-w-7xl gap-6 px-5 py-3 text-sm font-semibold text-slate-600 lg:px-8"><Link to="/products">Trái cây</Link><Link to="/categories">Danh mục</Link><Link to="/about">Về Fresh</Link></nav>; }
