import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Loading from '../../components/common/Loading';
import { getCategories } from '../../services/categoryService';
export default function CategoriesPage() { const [categories, setCategories] = useState([]); const [loading, setLoading] = useState(true); useEffect(() => { getCategories().then(({ data }) => setCategories(data.data || [])).finally(() => setLoading(false)); }, []); return <PageContainer><p className="eyebrow">Khám phá</p><h1 className="mt-3 font-display text-5xl text-forest">Danh mục</h1>{loading ? <Loading /> : <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{categories.map((category) => <Link key={category._id} to={`/products?category=${category.slug}`} className="rounded-2xl bg-white p-6 transition hover:-translate-y-1"><h2 className="font-display text-3xl text-forest">{category.name}</h2><p className="mt-3 text-sm text-slate-500">Khám phá sản phẩm trong danh mục</p></Link>)}</div>}</PageContainer>; }
