import { Link } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
export default function PageShell({ title, description = 'Nội dung sẽ được triển khai theo lộ trình Task 02–10.' }) { return <PageContainer><p className="eyebrow">Fresh market</p><h1 className="mt-3 font-display text-5xl text-forest">{title}</h1><p className="mt-4 max-w-xl text-slate-500">{description}</p><Link className="btn-primary mt-7 inline-flex" to="/">Về trang chủ</Link></PageContainer>; }
