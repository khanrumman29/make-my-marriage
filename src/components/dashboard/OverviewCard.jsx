import React from 'react';
import { Card } from '../ui/Card';

export function OverviewCard({
  title,
  amount,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default', // 'default' | 'forest' | 'gold' | 'warning'
}) {
  const variantStyles = {
    default: 'text-forest bg-forest-tint/60',
    forest: 'text-forest bg-forest-tint',
    gold: 'text-gold bg-gold-tint',
    warning: 'text-warning bg-warning-tint',
  };

  return (
    <Card className="flex flex-col justify-between h-full">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`w-8 h-8 rounded-control flex items-center justify-center shrink-0 ${variantStyles[variant] || variantStyles.default}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div>
        <div className="font-serif text-2xl sm:text-3xl text-ink font-normal tracking-tight">
          {amount}
        </div>
        {subtitle && (
          <div className="text-xs text-muted mt-1.5 flex items-center gap-1.5 font-normal">
            {subtitle}
          </div>
        )}
      </div>
    </Card>
  );
}
