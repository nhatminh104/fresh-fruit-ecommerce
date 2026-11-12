import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageContainer from '../layout/PageContainer';
import Input from '../common/Input';
import Button from '../common/Button';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import api from '../../services/api';
import * as adminService from '../../services/adminService';
import { getErrorMessage } from '../../utils/errorMessage';
import ProductImage from '../common/ProductImage';

function ImageUrlsField({ field, value, onChange }) {
  const urls = String(value ?? '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);
  return (
    <div className="block text-sm font-medium text-slate-600 sm:col-span-2">
      <label htmlFor={`field-${field.key}`}>
        {field.label}
        {field.required && ' *'}
      </label>
      <input
        id={`field-${field.key}`}
        type="text"
        className="mt-1 w-full rounded-xl border border-surface-border bg-white px-4 py-2.5 text-sm outline-none focus:border-leaf"
        value={value ?? ''}
        onChange={(event) => onChange(field.key, event.target.value)}
        placeholder={field.placeholder || 'https://... , https://...'}
      />
      {field.helpText && <p className="mt-1 text-xs text-slate-400">{field.helpText}</p>}
      {urls.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {urls.slice(0, 6).map((url, index) => (
            <ProductImage
              key={`${url}-${index}`}
              src={url}
              alt={`Ảnh ${index + 1}`}
              className="h-20 w-20 rounded-xl border border-surface-border bg-surface-subtle"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ field, value, onChange }) {
  const update = (event) =>
    onChange(field.key, event.target.type === 'checkbox' ? event.target.checked : event.target.value);

  if (field.type === 'images') {
    return <ImageUrlsField field={field} value={value} onChange={onChange} />;
  }

  if (field.type === 'textarea') {
    return (
      <label className="block text-sm font-medium text-slate-600 sm:col-span-2">
        {field.label}
        {field.required && ' *'}
        <textarea
          className="mt-1 w-full rounded-xl border border-surface-border px-4 py-2.5 text-sm outline-none focus:border-leaf"
          rows={3}
          required={field.required}
          value={value ?? ''}
          onChange={update}
          placeholder={field.placeholder}
        />
      </label>
    );
  }

  if (field.type === 'select') {
    return (
      <label className="block text-sm font-medium text-slate-600">
        {field.label}
        {field.required && ' *'}
        <select
          className="mt-1 w-full rounded-xl border border-surface-border bg-white px-4 py-2.5 text-sm outline-none focus:border-leaf"
          required={field.required}
          value={value ?? ''}
          onChange={update}
        >
          <option value="">-- Chọn --</option>
          {(field.options || []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === 'checkbox') {
    return (
      <label className="flex items-center gap-2 text-sm font-semibold text-ink sm:col-span-2">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={update}
          className="h-4 w-4 accent-brand-600"
        />
        {field.label}
      </label>
    );
  }

  return (
    <Input
      label={field.label}
      type={field.type || 'text'}
      required={field.required}
      value={value ?? ''}
      onChange={update}
      placeholder={field.placeholder}
      helperText={field.helpText}
    />
  );
}

export default function EntityForm({ title, resource, fields, initial = {}, toPayload, afterSave }) {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return undefined;
    let active = true;
    api
      .get(`/admin/${resource}/${id}`)
      .then((response) => {
        if (!active) return;
        const item = response.data.data;
        const next = {};
        for (const field of fields)
          next[field.key] = field.toForm ? field.toForm(item[field.key], item) : item[field.key];
        setForm(next);
      })
      .catch((requestError) => setError(getErrorMessage(requestError, 'Không thể tải dữ liệu.')))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, resource]);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = toPayload ? toPayload(form) : form;
      const saved = isEdit
        ? await adminService.updateAdmin(resource, id, payload)
        : await adminService.createAdmin(resource, payload);
      navigate(afterSave ? afterSave(saved) : `/admin/${resource}`);
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Không thể lưu dữ liệu.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <PageContainer>
        <Loading />
      </PageContainer>
    );

  return (
    <PageContainer>
      <p className="eyebrow">Fresh admin</p>
      <h1 className="mt-3 font-display text-5xl text-forest">
        {title}
        {isEdit ? ' — chỉnh sửa' : ''}
      </h1>
      {error && (
        <div className="mt-6">
          <ErrorMessage message={error} />
        </div>
      )}
      <form className="mt-8 grid max-w-3xl gap-4 rounded-2xl bg-white p-6 sm:grid-cols-2" onSubmit={submit}>
        {(() => {
          const groups = [];
          fields.forEach((field) => {
            const section = field.section || '';
            const last = groups[groups.length - 1];
            if (last && last.section === section) last.items.push(field);
            else groups.push({ section, items: [field] });
          });
          return groups.map((group, groupIndex) => (
            <div key={group.section || groupIndex} className="contents">
              {group.section && (
                <h2 className="font-display text-base font-bold text-forest sm:col-span-2">{group.section}</h2>
              )}
              {group.items.map((field) => (
                <Field key={field.key} field={field} value={form[field.key]} onChange={setField} />
              ))}
            </div>
          ));
        })()}
        <div className="flex gap-3 sm:col-span-2">
          <Button type="submit" disabled={saving}>
            {saving ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo mới'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(`/admin/${resource}`)}>
            Hủy
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
