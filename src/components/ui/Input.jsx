import React from 'react';

export function Input({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  type = 'text',
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          className={`w-full h-11 px-3.5 ${
            Icon ? 'pl-10' : ''
          } bg-surface border rounded-control text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest-tint transition-all ${
            error ? 'border-danger focus:border-danger focus:ring-danger-tint' : 'border-border'
          }`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger mt-1.5">{error}</p>}
      {helperText && !error && <p className="text-xs text-muted mt-1.5">{helperText}</p>}
    </div>
  );
}

export function Select({
  label,
  error,
  options = [],
  className = '',
  id,
  children,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full h-11 px-3.5 bg-surface border rounded-control text-sm text-ink focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest-tint transition-all ${
          error ? 'border-danger focus:border-danger focus:ring-danger-tint' : 'border-border'
        }`}
        {...props}
      >
        {children ||
          options.map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
      </select>
      {error && <p className="text-xs text-danger mt-1.5">{error}</p>}
    </div>
  );
}
