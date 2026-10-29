import { Outlet } from 'react-router-dom';
import AdminHeader from '../components/admin/AdminHeader';
import AdminSidebar from '../components/admin/AdminSidebar';
export default function AdminLayout() { return <div className="min-h-screen bg-cream"><AdminHeader /><div className="flex"><AdminSidebar /><main className="flex-1 p-6"><Outlet /></main></div></div>; }
