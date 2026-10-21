import React from 'react';
import { Button } from './Button';

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`text-center py-12 px-4 rounded-card border border-dashed border-border bg-surface/50 ${className}`}>
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-forest-tint text-forest flex items-center justify-center mx-auto mb-3.5">
          <Icon className="w-6 h-6 stroke-[1.75]" />
        </div>
      )}
      <h3 className="font-serif text-lg text-ink font-normal">{title}</h3>
      {description && (
        <p className="text-sm text-muted max-w-sm mx-auto mt-1 mb-5">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
