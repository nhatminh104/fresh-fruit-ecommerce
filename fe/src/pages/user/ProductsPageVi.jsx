import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import ProductCard from '../../components/product/ProductCard';
import ProductFilters from '../../components/product/ProductFilters';
import { getProducts } from '../../services/productService';

const categories = [['', 'Tất cả'], ['trai-cay-nhiet-doi', 'Trái cây nhiệt đới'], ['trai-cay-nhap-khau', 'Trái cây nhập khẩu'], ['rau-cu', 'Rau củ']];

export default function ProductsPageVi() {
  const [params, setParams] = useSearchParams();
  const [result, setResult] = useState({ items: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const sort = params.get('sort') || 'newest';
  const page = Number(params.get('page') || 1);

  useEffect(() => {
    setLoading(true);
    setError('');
    getProducts({ search, category, minPrice, maxPrice, sort, page, limit: 12 })
      .then(({ data }) => setResult(data.data))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Không thể tải sản phẩm.'))
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

  const setPage = (value) => setParams((current) => {
    const next = new URLSearchParams(current);
    next.set('page', value);
    return next;
  });

  return <PageContainer>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="eyebrow">Chợ Fresh</p><h1 className="mt-3 font-display text-5xl text-forest">Trái cây tươi</h1></div>
      <input className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 outline-none focus:border-leaf sm:w-72" placeholder="Tìm sản phẩm..." value={search} onChange={(event) => update('search', event.target.value)} />
    </div>
    <div className="mt-8 flex flex-wrap gap-3">{categories.map(([slug, label]) => <button type="button" key={slug || 'all'} className={`rounded-full px-4 py-2 text-sm ${category === slug ? 'bg-forest text-white' : 'bg-white text-slate-600'}`} onClick={() => update('category', slug)}>{label}</button>)}</div>
    <div className="mt-5"><ProductFilters value={{ minPrice, maxPrice, sort }} onChange={updateFilters} /></div>
    {error && <div className="mt-6"><ErrorMessage message={error} /></div>}
    {loading ? <Loading /> : result.items.length ? <><div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{result.items.map((product) => <ProductCard key={product._id} product={product} />)}</div><div className="mt-8 flex justify-center gap-3">{page > 1 && <button type="button" className="btn-secondary" onClick={() => setPage(page - 1)}>Trước</button>}{page < (result.pagination.totalPages || 1) && <button type="button" className="btn-primary" onClick={() => setPage(page + 1)}>Sau</button>}</div></> : <p className="mt-8 rounded-2xl bg-white p-10 text-center text-slate-500">Không tìm thấy sản phẩm phù hợp.</p>}
  </PageContainer>;
}
