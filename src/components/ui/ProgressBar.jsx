import React from 'react';

export function ProgressBar({
  value = 0, // current value
  max = 100, // total max
  label,
  sublabel,
  height = 'h-2.5',
  variant = 'forest', // 'forest' | 'gold' | 'warning'
  showPercentage = true,
  className = '',
}) {
  const percentage = Math.min(Math.max(Math.round((value / (max || 1)) * 100), 0), 100);

  const variantStyles = {
    forest: 'bg-forest',
    gold: 'bg-gold',
    warning: 'bg-warning',
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
          {label && <span className="text-muted">{label}</span>}
          {showPercentage && (
            <span className="text-ink font-semibold ml-auto">{percentage}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-surface-soft rounded-full overflow-hidden border border-border/50 ${height}`}>
        <div
          className={`${height} rounded-full transition-all duration-500 ease-out ${
            variantStyles[variant] || variantStyles.forest
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {sublabel && (
        <div className="text-[11px] text-muted mt-1.5 text-right">{sublabel}</div>
      )}
    </div>
  );
}
