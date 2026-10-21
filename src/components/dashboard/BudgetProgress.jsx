import React from 'react';
import { Card, CardHeader } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { formatINR } from '../../utils/formatters';

export function BudgetProgress({ budget = 2500000, spent = 1650000 }) {
  const percentage = Math.min(Math.round((spent / (budget || 1)) * 100), 100);
  const remaining = Math.max(budget - spent, 0);

  return (
    <Card>
      <CardHeader
        title="Budget Overview"
        subtitle="Tracking total expenses against estimated budget"
      />

      <div className="space-y-4">
        <ProgressBar
          value={spent}
          max={budget}
          variant={percentage > 90 ? 'warning' : 'forest'}
          height="h-3.5"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 bg-surface-soft/80 rounded-control border border-border/50">
            <span className="text-muted block mb-0.5">Total Budget</span>
            <span className="text-sm font-semibold text-ink">{formatINR(budget)}</span>
          </div>
          <div className="p-3 bg-surface-soft/80 rounded-control border border-border/50">
            <span className="text-muted block mb-0.5">Total Spent</span>
            <span className="text-sm font-semibold text-forest">{formatINR(spent)}</span>
          </div>
          <div className="p-3 bg-surface-soft/80 rounded-control border border-border/50 col-span-2 sm:col-span-1">
            <span className="text-muted block mb-0.5">Remaining</span>
            <span className="text-sm font-semibold text-ink">{formatINR(remaining)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
