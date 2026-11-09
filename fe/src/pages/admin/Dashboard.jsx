import { useEffect, useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { formatCurrency } from '../../utils/formatCurrency';
import api from '../../services/api';
import { getErrorMessage } from '../../utils/errorMessage';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/admin/dashboard').then((response) => setData(response.data.data)).catch((requestError) => setError(getErrorMessage(requestError, 'Không thể tải tổng quan quản trị.'))); }, []);
  if (error) return <PageContainer><ErrorMessage message={error} /></PageContainer>;
  if (!data) return <PageContainer><Loading /></PageContainer>;
  const cards = [['Người dùng', data.users], ['Sản phẩm đang bán', data.products], ['Đơn hàng', data.orders], ['Doanh thu', formatCurrency(data.revenue)]];
  return <PageContainer><p className="eyebrow">Fresh admin</p><h1 className="mt-3 font-display text-5xl text-forest">Tổng quan</h1><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label, value]) => <article key={label} className="rounded-2xl bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">{label}</p><strong className="mt-3 block text-2xl text-forest">{value}</strong></article>)}</div></PageContainer>;
}
