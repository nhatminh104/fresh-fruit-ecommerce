import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  icon: Icon,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 select-none';

  const variants = {
    primary: 'bg-brand-500 text-white hover:bg-brand-700 shadow-sm hover:shadow',
    secondary: 'border border-surface-border bg-white text-ink hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700',
    outline: 'border border-brand-500 bg-transparent text-brand-500 hover:bg-brand-50',
    ghost: 'bg-transparent text-ink-muted hover:bg-surface-subtle hover:text-brand-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    warning: 'bg-accent text-white hover:bg-amber-600 shadow-sm',
  };

  const sizes = {
    sm: 'rounded-full px-3.5 py-1.5 text-xs gap-1.5',
    md: 'rounded-full px-5 py-2.5 text-sm gap-2',
    lg: 'rounded-full px-6 py-3.5 text-base gap-2.5',
    icon: 'h-10 w-10 rounded-full p-0',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 14 : 17} aria-hidden="true" />}
          {children}
        </>
      )}
    </button>
  );
}
