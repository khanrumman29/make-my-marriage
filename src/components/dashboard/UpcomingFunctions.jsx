import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, MapPin } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { formatTime } from '../../utils/formatters';

export function UpcomingFunctions({ functions = [] }) {
  const displayFunctions = functions.slice(0, 3);

  const getDayAndMonth = (dateStr) => {
    if (!dateStr) return { day: '18', month: 'DEC' };
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    return { day, month };
  };

  return (
    <Card className="rounded-2xl p-6 shadow-sm">
      <CardHeader
        title="Upcoming functions"
        subtitle="Key celebrations & event timelines"
        action={
          <Link
            to="/functions"
            className="text-xs font-semibold text-forest hover:text-forest-hover flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

      <div className="divide-y divide-border/60">
        {displayFunctions.length === 0 ? (
          <p className="text-xs text-muted text-center py-4">No functions added yet.</p>
        ) : (
          displayFunctions.map((fn, idx) => {
            const { day, month } = getDayAndMonth(fn.eventDate);
            const isMainEvent = idx === 2 || fn.name.toLowerCase().includes('nikah') || fn.name.toLowerCase().includes('wedding');

            return (
              <div
                key={fn.id}
                className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Calendar Date Block */}
                  <div className={`rounded-xl p-2.5 text-center min-w-[54px] shrink-0 border ${
                    isMainEvent
                      ? 'bg-gold-tint/70 border-gold/40 text-gold-hover'
                      : 'bg-surface-soft border-border text-forest'
                  }`}>
                    <div className="font-serif text-lg font-bold leading-tight">
                      {day}
                    </div>
                    <div className="text-[10px] font-semibold tracking-wider uppercase leading-none">
                      {month}
                    </div>
                  </div>

                  {/* Function Title & Details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-ink group-hover:text-forest transition-colors">
                        {fn.name}
                      </span>
                      {isMainEvent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-gold-tint text-gold-hover font-semibold">
                          Main Event
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted truncate mt-0.5">
                      {fn.venue ? `${fn.venue}` : 'Venue TBD'} {fn.startTime && `• ${formatTime(fn.startTime)}`}
                    </div>
                  </div>
                </div>

                <Link
                  to="/functions"
                  className="w-8 h-8 rounded-lg bg-surface-soft text-muted group-hover:bg-forest group-hover:text-white transition-all flex items-center justify-center shrink-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
