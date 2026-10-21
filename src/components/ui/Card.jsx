import React from 'react';

export function Card({
  children,
  className = '',
  hoverEffect = false,
  as: Component = 'div',
  ...props
}) {
  return (
    <Component
      className={`bg-surface border border-border rounded-card p-5 sm:p-6 shadow-subtle ${
        hoverEffect ? 'hover:border-gold/40 transition-colors duration-200' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
      <div>
        <h3 className="font-semibold text-ink text-base tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs sm:text-sm text-muted mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
