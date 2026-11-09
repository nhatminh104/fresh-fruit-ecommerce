const labels = { pending: 'Chờ xử lý', confirmed: 'Đã xác nhận', shipping: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy' };
export default function OrderStatusBadge({ status = 'pending' }) { return <span className="rounded-full bg-orange/15 px-3 py-1 text-xs font-bold text-orange">{labels[status] || status}</span>; }
