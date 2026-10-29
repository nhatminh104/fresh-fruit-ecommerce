export default function OrderStatusBadge({ status = 'pending' }) { return <span className="rounded-full bg-orange/15 px-3 py-1 text-xs font-bold text-orange">{status}</span>; }
