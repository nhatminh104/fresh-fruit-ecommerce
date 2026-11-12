import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import { getCategories } from '../../services/categoryService';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then(({ data }) => setCategories(data.data || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageContainer>
      <div className="pb-6 border-b border-surface-border">
        <span className="eyebrow">
          <Leaf size={14} /> Khám phá thực đơn
        </span>
        <h1 className="section-title mt-2">Danh mục trái cây</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Tìm kiếm dễ dàng các loại trái cây nội địa và nhập khẩu theo từng nhóm sở thích
        </p>
      </div>

      {loading ? (
        <Loading message="Đang tải danh mục..." minHeight="min-h-80" />
      ) : categories.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category._id}
              to={`/products?category=${category.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-surface-border bg-white p-6 shadow-subtle transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-card"
            >
              <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl bg-surface-subtle mb-5">
                <img
                  src={
                    category.image ||
                    'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80'
                  }
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-2xl font-bold text-ink group-hover:text-brand-500 transition-colors">
                    {category.name}
                  </h3>
                  <p className="mt-2 text-sm text-ink-muted line-clamp-2 leading-relaxed">
                    {category.description || 'Trái cây tươi ngon được tuyển chọn kỹ lưỡng mỗi ngày.'}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-surface-border/60 pt-4 text-xs font-bold text-brand-700">
                  <span>Xem sản phẩm</span>
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-brand-50 text-brand-700 transition-transform group-hover:translate-x-1">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState title="Chưa có danh mục nào" />
        </div>
      )}
    </PageContainer>
  );
}
