'use client';

import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { TimeSeriesPoint } from '@/types/system';

interface MiniSparklineProps {
  data: TimeSeriesPoint[];
  color: string;
  height?: number;
}

/**
 * Tiny inline sparkline chart for compact metric displays
 * No axes, no labels — pure data visualization
 */
export default function MiniSparkline({
  data,
  color,
  height = 40,
}: MiniSparklineProps) {
  if (data.length < 2) {
    return (
      <div
        className="flex items-center justify-center text-[10px] text-gray-600 font-mono"
        style={{ height }}
      >
        Collecting...
      </div>
    );
  }

  const gradientId = `sparkline-${color.replace('#', '')}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#${gradientId})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}   