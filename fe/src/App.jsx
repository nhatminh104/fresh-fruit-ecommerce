import React from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import HomePage from './pages/user/Home';
import { appRoutes } from './routes';

function NotFound() {
  return <main className="grid min-h-[60vh] place-items-center px-5 text-center"><div><p className="eyebrow justify-center">Fresh market</p><h1 className="mt-4 font-display text-5xl text-forest">Không tìm thấy trang</h1><Link className="btn-primary mt-7 inline-flex" to="/">Về trang chủ</Link></div></main>;
}

export default function App() {
  return <Routes><Route path="/" element={<HomePage />} />{appRoutes.map(([path, Component]) => <Route key={path} path={path} element={<Component />} />)}<Route path="*" element={<NotFound />} /></Routes>;
}
