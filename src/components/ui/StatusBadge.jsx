import React from 'react';

const statusConfig = {
  // Expense Payment Statuses
  paid: {
    bg: 'bg-success-tint',
    text: 'text-success',
    dot: 'bg-success',
    label: 'Paid',
  },
  partially_paid: {
    bg: 'bg-warning-tint',
    text: 'text-warning',
    dot: 'bg-warning',
    label: 'Partially Paid',
  },
  pending: {
    bg: 'bg-danger-tint',
    text: 'text-danger',
    dot: 'bg-danger',
    label: 'Pending',
  },

  // Function / Task Statuses
  upcoming: {
    bg: 'bg-gold-tint',
    text: 'text-gold-hover',
    dot: 'bg-gold',
    label: 'Upcoming',
  },
  in_progress: {
    bg: 'bg-info-tint',
    text: 'text-info',
    dot: 'bg-info',
    label: 'In Progress',
  },
  completed: {
    bg: 'bg-success-tint',
    text: 'text-success',
    dot: 'bg-success',
    label: 'Completed',
  },
  todo: {
    bg: 'bg-surface-soft',
    text: 'text-muted',
    dot: 'bg-muted',
    label: 'To Do',
  },

  // Member Roles
  owner: {
    bg: 'bg-forest-tint',
    text: 'text-forest',
    dot: 'bg-forest',
    label: 'Owner',
  },
  admin: {
    bg: 'bg-gold-tint',
    text: 'text-gold-hover',
    dot: 'bg-gold',
    label: 'Admin',
  },
  family_member: {
    bg: 'bg-surface-soft',
    text: 'text-ink',
    dot: 'bg-muted',
    label: 'Family Member',
  },
  viewer: {
    bg: 'bg-canvas',
    text: 'text-muted',
    dot: 'bg-border',
    label: 'Viewer',
  },
};

export function StatusBadge({ status, label, className = '' }) {
  const config = statusConfig[status] || {
    bg: 'bg-surface-soft',
    text: 'text-ink',
    dot: 'bg-muted',
    label: status || 'Unknown',
  };

  const displayLabel = label || config.label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium tracking-tight ${config.bg} ${config.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{displayLabel}</span>
    </span>
  );
}
