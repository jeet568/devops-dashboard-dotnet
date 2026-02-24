'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TimeSeriesPoint } from '@/types/system';
import ChartWrapper from './ChartWrapper';
import ChartTooltip from './ChartTooltip';

interface CpuChartProps {
  data: TimeSeriesPoint[];
  currentValue: number;
}

/**
 * Real-time CPU usage area chart
 * - Gradient fill with severity-based coloring
 * - Reference lines at 75% (warning) and 90% (critical)
 * - Smooth data streaming without chart recreation
 */
export default function CpuChart({ data, currentValue }: CpuChartProps) {
  return (
    <ChartWrapper
      title="CPU Usage"
      subtitle="Real-time processor load"
      icon={
        <svg
          className="w-4 h-4 text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
          />
        </svg>
      }
      iconBgColor="bg-blue-500/10"
      iconBorderColor="border-blue-500/20"
      headerRight={
        <div className="flex items-center gap-3">
          {/* Live value badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-800 border border-gray-700">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-blue-400">
              {(currentValue ?? 0).toFixed(1)}%
            </span>
          </div>
          {/* Data points count */}
          <span className="text-[10px] text-gray-600 font-mono">
            {data.length}pts
          </span>
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <defs>
            {/* Blue gradient fill */}
            <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.1} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
            {/* Glow filter */}
            <filter id="cpuGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1f2937"
            vertical={false}
          />

          <XAxis
            dataKey="time"
            stroke="#374151"
            tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={{ stroke: '#1f2937' }}
            interval="preserveStartEnd"
            minTickGap={40}
          />

          <YAxis
            domain={[0, 100]}
            stroke="#374151"
            tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={{ stroke: '#1f2937' }}
            tickFormatter={(value) => `${value}%`}
            width={45}
          />

          <Tooltip
            content={<ChartTooltip unit="%" />}
            cursor={{
              stroke: '#3b82f6',
              strokeWidth: 1,
              strokeDasharray: '4 4',
            }}
          />

          {/* Warning threshold line */}
          <ReferenceLine
            y={75}
            stroke="#f59e0b"
            strokeDasharray="6 4"
            strokeOpacity={0.4}
            label={{
              value: 'WARN 75%',
              position: 'right',
              fill: '#f59e0b',
              fontSize: 9,
              fontFamily: 'monospace',
              opacity: 0.6,
            }}
          />

          {/* Critical threshold line */}
          <ReferenceLine
            y={90}
            stroke="#ef4444"
            strokeDasharray="6 4"
            strokeOpacity={0.4}
            label={{
              value: 'CRIT 90%',
              position: 'right',
              fill: '#ef4444',
              fontSize: 9,
              fontFamily: 'monospace',
              opacity: 0.6,
            }}
          />

          <Area
            type="monotone"
            dataKey="value"
            name="CPU"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#cpuGradient)"
            dot={false}
            activeDot={{
              r: 4,
              fill: '#3b82f6',
              stroke: '#1e3a5f',
              strokeWidth: 2,
            }}
            isAnimationActive={false}
            filter="url(#cpuGlow)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}