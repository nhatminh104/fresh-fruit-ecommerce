import { Outlet } from 'react-router-dom';
import AdminHeader from '../components/admin/AdminHeader';
import AdminSidebar from '../components/admin/AdminSidebar';
export default function AdminLayout() { return <div className="min-h-screen bg-cream"><AdminHeader /><div className="flex flex-col md:flex-row"><AdminSidebar /><main className="min-w-0 flex-1 p-4 sm:p-6"><Outlet /></main></div></div>; }
