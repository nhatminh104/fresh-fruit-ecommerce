import { Link } from 'react-router-dom';
export function Header() { return <header className="border-b bg-cream px-5 py-5"><Link className="font-display text-3xl text-forest" to="/">fresh<span className="text-leaf">.</span></Link></header>; }
export function Footer() { return <footer className="bg-[#173d29] px-5 py-10 text-sm text-white/70"><div className="mx-auto max-w-7xl">© Fresh. Trái cây tươi mỗi ngày.</div></footer>; }
