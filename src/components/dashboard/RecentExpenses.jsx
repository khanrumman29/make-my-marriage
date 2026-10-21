import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  UtensilsCrossed,
  Flower2,
  Camera,
  Shirt,
  Sparkles,
  Receipt,
} from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { formatINR, getPaymentStatus } from '../../utils/formatters';

const categoryIcons = {
  Venue: Building2,
  Catering: UtensilsCrossed,
  Decoration: Flower2,
  'Photography & Videography': Camera,
  Clothing: Shirt,
  Jewellery: Sparkles,
};

export function RecentExpenses({ expenses = [] }) {
  const displayExpenses = expenses.slice(0, 4);

  return (
    <Card className="rounded-2xl p-6 shadow-sm">
      <CardHeader
        title="Recent expenses"
        subtitle="Latest invoices and vendor payments"
        action={
          <Link
            to="/expenses"
            className="text-xs font-semibold text-forest hover:text-forest-hover flex items-center gap-1 transition-colors"
          >
            <span>View all expenses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

      <div className="divide-y divide-border/60">
        {displayExpenses.length === 0 ? (
          <p className="text-xs text-muted text-center py-4">No expenses recorded yet.</p>
        ) : (
          displayExpenses.map((exp) => {
            const status = getPaymentStatus(exp.amount, exp.amountPaid);
            const Icon = categoryIcons[exp.category] || Receipt;

            return (
              <div
                key={exp.id}
                className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-forest-tint text-forest flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-sm text-ink block truncate">
                      {exp.title}
                    </span>
                    <span className="text-xs text-muted block truncate mt-0.5">
                      {exp.paidByName ? `Paid by ${exp.paidByName}` : exp.category}{' '}
                      {exp.vendorName ? `• ${exp.vendorName}` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 shrink-0">
                  <span className="font-semibold text-sm text-ink font-mono">
                    {formatINR(exp.amount)}
                  </span>
                  <StatusBadge status={status} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
