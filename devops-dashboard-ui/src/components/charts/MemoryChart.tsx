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

interface MemoryChartProps {
  data: TimeSeriesPoint[];
  currentValue: number;
  usedMB: number;
  totalMB: number;
}

function formatMB(mb: number | undefined): string {
  if (mb === undefined || mb === null || mb === 0) return '0MB';
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)}GB`;
  return `${mb.toFixed(0)}MB`;
}

/**
 * Real-time memory usage area chart
 * - Purple gradient fill
 * - Shows used/total in header
 * - Reference lines at warning/critical thresholds
 */
export default function MemoryChart({
  data,
  currentValue,
  usedMB,
  totalMB,
}: MemoryChartProps) {
  return (
    <ChartWrapper
      title="Memory Usage"
      subtitle="RAM utilization over time"
      icon={
        <svg
          className="w-4 h-4 text-purple-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      }
      iconBgColor="bg-purple-500/10"
      iconBorderColor="border-purple-500/20"
      headerRight={
        <div className="flex items-center gap-3">
          {/* Memory usage badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-800 border border-gray-700">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-purple-400">
              {(currentValue ?? 0).toFixed(1)}%
            </span>
          </div>
          {/* Used / Total */}
          <span className="text-[10px] text-gray-600 font-mono hidden sm:inline">
            {formatMB(usedMB)}/{formatMB(totalMB)}
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
            {/* Purple gradient fill */}
            <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
              <stop offset="50%" stopColor="#a855f7" stopOpacity={0.1} />
              <stop offset="100%" stopColor="#a855f7" stopOpacity={0.02} />
            </linearGradient>
            {/* Glow filter */}
            <filter id="memGlow">
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
              stroke: '#a855f7',
              strokeWidth: 1,
              strokeDasharray: '4 4',
            }}
          />

          {/* Warning threshold */}
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

          {/* Critical threshold */}
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
            name="Memory"
            stroke="#a855f7"
            strokeWidth={2}
            fill="url(#memoryGradient)"
            dot={false}
            activeDot={{
              r: 4,
              fill: '#a855f7',
              stroke: '#3b1d6e',
              strokeWidth: 2,
            }}
            isAnimationActive={false}
            filter="url(#memGlow)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}