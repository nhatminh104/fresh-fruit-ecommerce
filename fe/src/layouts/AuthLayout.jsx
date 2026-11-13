import { Outlet } from 'react-router-dom';
export default function AuthLayout() {
  return (
    <main className="grid min-h-screen place-items-center bg-cream-alt p-5">
      <Outlet />
    </main>
  );
}
