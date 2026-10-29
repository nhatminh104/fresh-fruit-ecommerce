import { Outlet } from 'react-router-dom';
import { Header, Footer } from './shared';
export default function MainLayout() { return <><Header /><Outlet /><Footer /></>; }
