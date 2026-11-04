import { useEffect, useState } from 'react';
import PageContainer from '../layout/PageContainer';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import Button from '../common/Button';
import * as adminService from '../../services/adminService';
import { getErrorMessage } from '../../utils/errorMessage';

const display = (value) => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'object') return value.name || value.fullName || value.email || value.code || JSON.stringify(value);
  return String(value);
};

export default function AdminDataPage({ title, resource, columns, actions = [] }) {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = async () => { setLoading(true); setError(''); try { const data = await adminService.listAdmin(resource); setItems(Array.isArray(data) ? data : data.items || []); } catch (loadError) { setError(getErrorMessage(loadError, 'Không thể tải dữ liệu quản trị.')); } finally { setLoading(false); } };
  useEffect(() => { load(); }, [resource]);
  const runAction = async (action, item) => { try { await action(item, adminService); await load(); } catch (actionError) { setError(getErrorMessage(actionError, 'Thao tác thất bại.')); } };
  return <PageContainer><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Fresh admin</p><h1 className="mt-3 font-display text-5xl text-forest">{title}</h1></div><Button type="button" onClick={load}>Làm mới</Button></div>{error && <div className="mt-6"><ErrorMessage message={error} /></div>}{loading ? <Loading /> : items.length === 0 ? <p className="mt-8 rounded-2xl bg-white p-6 text-slate-500">Chưa có dữ liệu.</p> : <div className="mt-8 overflow-x-auto rounded-2xl bg-white shadow-sm"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b bg-cream text-xs uppercase text-slate-500"><tr>{columns.map((column) => <th className="px-5 py-4" key={column.key}>{column.label}</th>)}{actions.length > 0 && <th className="px-5 py-4">Thao tác</th>}</tr></thead><tbody>{items.map((item) => <tr className="border-b last:border-0" key={item._id || item.id}>{columns.map((column) => <td className="px-5 py-4 text-slate-700" key={column.key}>{column.render ? column.render(item) : display(item[column.key])}</td>)}{actions.length > 0 && <td className="px-5 py-4"><div className="flex flex-wrap gap-2">{actions.map((action) => <Button type="button" className="px-3 py-2 text-xs" key={action.label} onClick={() => runAction(action.run, item)}>{action.label}</Button>)}</div></td>}</tr>)}</tbody></table></div>}</PageContainer>;
}
