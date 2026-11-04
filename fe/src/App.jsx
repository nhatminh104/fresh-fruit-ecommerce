import { Route, Routes } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/admin/Dashboard';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import HomePage from './pages/user/Home';
import { RequireAdmin, RequireAuth, adminRoutes, authRoutes, protectedRoutes, publicRoutes } from './routes';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route element={<MainLayout />}>
        {publicRoutes.map(([path, Component]) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
        {protectedRoutes.map(([path, Component]) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
      </Route>

      <Route element={<AuthLayout />}>
        {authRoutes.map(([path, Component]) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
      </Route>

      <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route index element={<Dashboard />} />
        {adminRoutes.map(([path, Component]) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
