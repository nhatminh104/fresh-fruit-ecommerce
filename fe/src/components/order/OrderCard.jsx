export default function OrderCard({ order }) { return <article className="rounded-2xl bg-white p-5"><strong>Đơn hàng {order?.id || 'mới'}</strong></article>; }
