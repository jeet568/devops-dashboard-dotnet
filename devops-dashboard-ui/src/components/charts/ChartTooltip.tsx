'use client';

import { TooltipProps } from 'recharts';

interface CustomTooltipProps extends TooltipProps<number, string> {
  accentColor?: string;
  unit?: string;
}

/**
 * Grafana-style dark tooltip for all charts
 * Displays timestamp + metric values with color indicators
 */
export default function ChartTooltip({
  active,
  payload,
  label,
  unit = '%',
}: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl shadow-black/50 px-3 py-2.5 min-w-[160px]">
      {/* Timestamp header */}
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-800">
        <svg
          className="w-3 h-3 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-[10px] text-gray-400 font-mono">{label}</span>
      </div>

      {/* Metric values */}
      <div className="space-y-1.5">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-[11px] text-gray-400">
                {entry.name || entry.dataKey}
              </span>
            </div>
            <span
              className="text-[11px] font-mono font-bold"
              style={{ color: entry.color }}
            >
              {typeof entry.value === 'number'
                ? entry.value.toFixed(1)
                : entry.value}
              {unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}