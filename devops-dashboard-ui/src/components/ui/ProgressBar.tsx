'use client';

import { useMemo } from 'react';

interface ProgressBarProps {
  value: number;
  maxValue?: number;
  height?: number;
  showLabel?: boolean;
  showValue?: boolean;
  label?: string;
  color?: string;
  animated?: boolean;
}

export default function ProgressBar({
  value,
  maxValue = 100,
  height = 6,
  showLabel = false,
  showValue = false,
  label,
  color,
  animated = true,
}: ProgressBarProps) {
  const percentage = useMemo(() => {
    return Math.min(Math.max((value / maxValue) * 100, 0), 100);
  }, [value, maxValue]);

  const barColor = useMemo(() => {
    if (color) return color;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-amber-500';
    if (percentage >= 50) return 'bg-blue-500';
    return 'bg-emerald-500';
  }, [percentage, color]);

  const glowColor = useMemo(() => {
    if (percentage >= 90) return 'shadow-red-500/30';
    if (percentage >= 75) return 'shadow-amber-500/30';
    if (percentage >= 50) return 'shadow-blue-500/30';
    return 'shadow-emerald-500/30';
  }, [percentage]);

  return (
    <div className="w-full">
      {(showLabel || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {showLabel && label && (
            <span className="text-xs text-gray-400 font-medium">{label}</span>
          )}
          {showValue && (
            <span className="text-xs text-gray-500 font-mono">
              {percentage.toFixed(1)}%
            </span>
          )}
        </div>
      )}
      <div
        className="w-full bg-gray-800 rounded-full overflow-hidden"
        style={{ height }}
      >
        <div
          className={`h-full rounded-full ${barColor} ${animated ? 'transition-all duration-500 ease-out' : ''} shadow-lg ${glowColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}