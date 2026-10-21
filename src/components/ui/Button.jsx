import React from 'react';

export function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-control gap-1.5 h-8',
    md: 'text-sm px-4 py-2.5 rounded-control gap-2 h-11',
    lg: 'text-base px-5 py-3 rounded-control gap-2.5 h-12',
  };

  const variantStyles = {
    primary: 'bg-forest text-white hover:bg-forest-hover shadow-subtle active:translate-y-px',
    secondary: 'bg-white text-ink border border-border hover:bg-canvas active:translate-y-px',
    ghost: 'bg-transparent text-ink hover:bg-surface-soft active:translate-y-px',
    danger: 'bg-danger text-white hover:bg-opacity-90 shadow-subtle active:translate-y-px',
    gold: 'bg-gold text-white hover:bg-gold-hover shadow-subtle active:translate-y-px',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-0.5 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
