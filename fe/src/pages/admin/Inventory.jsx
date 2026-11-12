import { useEffect, useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { listAdmin, updateAdmin } from '../../services/adminService';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../contexts/ToastContext';

export default function Inventory() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ quantity: '', lowStockAt: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listAdmin('inventory');
      setItems(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Không thể tải tồn kho.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (item) => {
    setEditing(item);
    setForm({ quantity: String(item.quantity ?? ''), lowStockAt: String(item.lowStockAt ?? 5) });
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateAdmin('inventory', editing.product?._id || editing.product, {
        quantity: Number(form.quantity),
        lowStockAt: Number(form.lowStockAt),
      });
      toast.success('Đã cập nhật tồn kho.');
      setEditing(null);
      await load();
    } catch (saveError) {
      toast.error(getErrorMessage(saveError, 'Không thể cập nhật tồn kho.'));
    } finally {
      setSaving(false);
    }
  };

  const filtered = items.filter((item) => {
    const q = search.trim().toLowerCase();
    if (q && !(item.product?.name || '').toLowerCase().includes(q)) return false;
    const low = item.quantity <= (item.lowStockAt ?? 5);
    if (stockFilter === 'low' && !low) return false;
    if (stockFilter === 'ok' && low) return false;
    return true;
  });

  return (
    <PageContainer>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Fresh admin</p>
          <h1 className="mt-3 font-display text-5xl text-forest">Quản lý tồn kho</h1>
        </div>
        <Button type="button" variant="secondary" onClick={load}>
          Làm mới
        </Button>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên sản phẩm..."
          className="w-full max-w-xs rounded-xl border border-surface-border bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-50"
        />
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="rounded-xl border border-surface-border bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500"
        >
          <option value="">Tất cả tồn kho</option>
          <option value="low">Sắp hết hàng</option>
          <option value="ok">Đủ hàng</option>
        </select>
      </div>
      {error && (
        <div className="mt-6">
          <ErrorMessage message={error} />
        </div>
      )}
      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-surface-border bg-white p-6 text-slate-500 shadow-subtle">
          {items.length === 0 ? 'Chưa có sản phẩm nào.' : 'Không có sản phẩm phù hợp bộ lọc.'}
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-surface-border bg-white shadow-subtle">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-surface-border bg-cream-alt text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-5 py-4">Sản phẩm</th>
                <th className="px-5 py-4">Tồn kho</th>
                <th className="px-5 py-4">Mức cảnh báo</th>
                <th className="px-5 py-4">Trạng thái</th>
                <th className="px-5 py-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const low = item.quantity <= (item.lowStockAt ?? 5);
                return (
                  <tr className="border-b last:border-0" key={item.product?._id || item.product}>
                    <td className="px-5 py-4 font-semibold text-forest">{item.product?.name || '-'}</td>
                    <td className="px-5 py-4">{item.quantity}</td>
                    <td className="px-5 py-4">{item.lowStockAt ?? 5}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${low ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}
                      >
                        {low ? 'Sắp hết' : 'Đủ hàng'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Button
                        type="button"
                        className="px-3 py-1.5 text-xs"
                        variant="secondary"
                        onClick={() => openEdit(item)}
                      >
                        Cập nhật
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Cập nhật tồn kho">
        {editing && (
          <form className="space-y-4" onSubmit={save}>
            <p className="text-sm font-semibold text-ink">{editing.product?.name}</p>
            <Input
              label="Số lượng tồn kho"
              type="number"
              min="0"
              required
              value={form.quantity}
              onChange={(e) => setForm((c) => ({ ...c, quantity: e.target.value }))}
            />
            <Input
              label="Mức cảnh báo hết hàng"
              type="number"
              min="0"
              required
              value={form.lowStockAt}
              onChange={(e) => setForm((c) => ({ ...c, lowStockAt: e.target.value }))}
            />
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
                Hủy
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </PageContainer>
  );
}
