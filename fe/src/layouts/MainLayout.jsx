import { Outlet } from 'react-router-dom';
import { Header, Footer } from './sharedUIHome';
export default function MainLayout() { return <><Header /><Outlet /><Footer /></>; }
