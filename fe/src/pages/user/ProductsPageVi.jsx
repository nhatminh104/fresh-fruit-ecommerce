import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Leaf, Search } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import ProductCard from '../../components/product/ProductCard';
import ProductFilters from '../../components/product/ProductFilters';
import { getProducts } from '../../services/productService';
import { getCategories } from '../../services/categoryService';

export default function ProductsPageVi() {
  const [params, setParams] = useSearchParams();
  const [result, setResult] = useState({ items: [], pagination: {} });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const search = params.get('search') || params.get('q') || '';
  const category = params.get('category') || '';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const sort = params.get('sort') || 'newest';
  const page = Number(params.get('page') || 1);

  // Load categories once
  useEffect(() => {
    getCategories()
      .then(({ data }) => setCategories(data.data || []))
      .catch(() => setCategories([]));
  }, []);

  // Fetch products whenever params change
  useEffect(() => {
    setLoading(true);
    setError('');
    getProducts({ search, category, minPrice, maxPrice, sort, page, limit: 12 })
      .then(({ data }) => setResult(data.data || { items: [], pagination: {} }))
      .catch((err) => setError(err.response?.data?.message || 'Không thể tải danh sách sản phẩm.'))
      .finally(() => setLoading(false));
  }, [search, category, minPrice, maxPrice, sort, page]);

  const update = (key, value) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete('page');
      return next;
    });
  };

  const updateFilters = (nextFilters) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      ['minPrice', 'maxPrice', 'sort'].forEach((key) => {
        if (nextFilters[key]) next.set(key, nextFilters[key]);
        else next.delete(key);
      });
      next.delete('page');
      return next;
    });
  };

  const setPage = (value) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      next.set('page', value);
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = result.pagination?.totalPages || 1;

  return (
    <PageContainer>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-surface-border">
        <div>
          <span className="eyebrow">
            <Leaf size={14} /> Chợ trái cây tươi
          </span>
          <h1 className="section-title mt-1.5">
            {category
              ? (categories.find((c) => c.slug === category)?.name || 'Danh mục sản phẩm')
              : search
              ? `Kết quả tìm kiếm cho "${search}"`
              : 'Tất cả sản phẩm'}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {result.pagination?.total !== undefined
              ? `Hiển thị ${result.items.length} trên tổng số ${result.pagination.total} sản phẩm`
              : 'Chọn lọc kỹ càng, tươi ngon chuẩn vị mỗi ngày'}
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => update('search', e.target.value)}
            placeholder="Tìm theo tên trái cây..."
            className="w-full rounded-full border border-surface-border bg-surface-subtle py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-50"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => update('category', '')}
          className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
            !category
              ? 'bg-brand-500 text-white shadow-sm'
              : 'border border-surface-border bg-white text-ink hover:border-brand-200 hover:bg-surface-subtle'
          }`}
        >
          Tất cả danh mục
        </button>
        {categories.map((cat) => (
          <button
            type="button"
            key={cat._id}
            onClick={() => update('category', cat.slug)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
              category === cat.slug
                ? 'bg-brand-500 text-white shadow-sm'
                : 'border border-surface-border bg-white text-ink hover:border-brand-200 hover:bg-surface-subtle'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Filters (Price & Sort) */}
      <div className="mt-4">
        <ProductFilters value={{ minPrice, maxPrice, sort }} onChange={updateFilters} />
      </div>

      {/* Error state */}
      {error && (
        <div className="mt-6">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Product List */}
      {loading ? (
        <Loading message="Đang tải danh sách trái cây..." minHeight="min-h-96" />
      ) : result.items.length > 0 ? (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {result.items.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="inline-flex items-center gap-1 rounded-full border border-surface-border bg-white px-4 py-2 text-xs font-bold text-ink transition-colors hover:border-brand-500 hover:text-brand-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                <span>Trước</span>
              </button>

              <div className="flex items-center gap-1 px-3 text-xs font-bold text-ink-muted">
                <span>Trang <strong className="text-ink">{page}</strong> / {totalPages}</span>
              </div>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="inline-flex items-center gap-1 rounded-full border border-surface-border bg-white px-4 py-2 text-xs font-bold text-ink transition-colors hover:border-brand-500 hover:text-brand-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span>Sau</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="mt-8">
          <EmptyState
            title="Không tìm thấy sản phẩm phù hợp"
            description="Hãy thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh khoảng giá trong bộ lọc."
            action={
              <button
                type="button"
                onClick={() => setParams(new URLSearchParams())}
                className="btn-primary text-xs"
              >
                Xem tất cả sản phẩm
              </button>
            }
          />
        </div>
      )}
    </PageContainer>
  );
}
