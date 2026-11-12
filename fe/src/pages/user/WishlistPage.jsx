import { useEffect, useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import ProductCard from '../../components/product/ProductCard';
import { getWishlist, removeWishlistItem } from '../../services/wishlistService';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../contexts/ToastContext';

export default function WishlistPage() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getWishlist()
      .then(({ data }) => setProducts(data.data?.products || []))
      .catch((err) => setError(err.response?.data?.message || 'Không thể tải danh sách yêu thích.'))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (id) => {
    try {
      await removeWishlistItem(id);
      setProducts((current) => current.filter((product) => product._id !== id));
    } catch (err) {
      toast.error(getErrorMessage(err, 'Không thể xóa khỏi yêu thích.'));
    }
  };

  return (
    <PageContainer>
      <p className="eyebrow">Tài khoản</p>
      <h1 className="mt-3 font-display text-5xl text-forest">Yêu thích</h1>
      {loading ? <Loading /> : error ? (
        <div className="mt-6"><ErrorMessage message={error} /></div>
      ) : products.length ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div key={product._id}>
              <ProductCard product={product} />
              <button className="mt-2 text-sm font-semibold text-red-600 hover:text-red-700" onClick={() => remove(product._id)}>
                Xóa khỏi yêu thích
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8"><EmptyState title="Bạn chưa có sản phẩm yêu thích" /></div>
      )}
    </PageContainer>
  );
}
