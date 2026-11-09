import { useEffect, useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import VoucherCard from '../../components/voucher/VoucherCardV2';
import { getVouchers } from '../../services/voucherService';
export default function VouchersPage() { const [vouchers, setVouchers] = useState([]); const [loading, setLoading] = useState(true); useEffect(() => { getVouchers().then(({ data }) => setVouchers(data.data || [])).finally(() => setLoading(false)); }, []); return <PageContainer><p className="eyebrow">Ưu đãi</p><h1 className="mt-3 font-display text-5xl text-forest">Voucher</h1>{loading ? <Loading /> : vouchers.length ? <div className="mt-8 grid gap-5 md:grid-cols-2">{vouchers.map((voucher) => <VoucherCard key={voucher._id} voucher={voucher} />)}</div> : <div className="mt-8"><EmptyState title="Hiện chưa có voucher" /></div>}</PageContainer>; }
