import { Link } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import CartItem from '../../components/cart/CartItem';
import CartSummary from '../../components/cart/CartSummary';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';
import { useCart } from '../../hooks/useCart';

export default function CartPage() {
  const { items, loading, removeItem, updateQuantity, clear } = useCart();
  if (loading && !items.length)
    return (
      <PageContainer>
        <Loading />
      </PageContainer>
    );
  return (
    <PageContainer>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Mua sắm</p>
          <h1 className="mt-3 font-display text-5xl text-forest">Giỏ hàng</h1>
        </div>
        {items.length > 0 && (
          <button className="text-sm font-semibold text-red-600" onClick={clear}>
            Xóa tất cả
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <EmptyState
          title="Giỏ hàng đang trống"
          description="Hãy chọn những loại quả tươi ngon cho đơn hàng của bạn."
          action={
            <Link className="btn-primary" to="/products">
              Xem sản phẩm
            </Link>
          }
        />
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-surface-border bg-white px-6 shadow-subtle">
            {items.map((item) => (
              <CartItem key={item.id} item={item} onRemove={removeItem} onQuantityChange={updateQuantity} />
            ))}
          </div>
          <CartSummary items={items} />
        </div>
      )}
    </PageContainer>
  );
}
