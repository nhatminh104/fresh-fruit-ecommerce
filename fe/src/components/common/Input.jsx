import React from 'react';

export default function Input({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  required,
  ...props
}) {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`w-full text-left ${className}`}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-muted">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <span className="pointer-events-none absolute left-3.5 text-ink-light">
            <Icon size={18} aria-hidden="true" />
          </span>
        )}
        <input
          id={inputId}
          required={required}
          className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-ink outline-none transition-all duration-200 placeholder:text-ink-light ${
            Icon ? 'pl-10' : ''
          } ${
            error
              ? 'border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-100'
              : 'border-surface-border hover:border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-50'
          }`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-ink-muted">{helperText}</p>}
    </div>
  );
}
