'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { useMemo } from 'react';
import { TimeSeriesPoint } from '@/types/system';
import ChartWrapper from './ChartWrapper';
import ChartTooltip from './ChartTooltip';

interface CombinedChartProps {
  cpuData: TimeSeriesPoint[];
  memoryData: TimeSeriesPoint[];
  cpuCurrent: number;
  memoryCurrent: number;
}

interface CombinedDataPoint {
  time: string;
  timestamp: number;
  cpu: number;
  memory: number;
}

/**
 * Combined CPU + Memory overlay chart
 * - Both metrics visible in one view
 * - Dual gradient fills
 * - Perfect for quick comparison
 */
export default function CombinedChart({
  cpuData,
  memoryData,
  cpuCurrent,
  memoryCurrent,
}: CombinedChartProps) {
  // Merge CPU and Memory data into single array
  const combinedData: CombinedDataPoint[] = useMemo(() => {
    const maxLen = Math.max(cpuData.length, memoryData.length);
    const result: CombinedDataPoint[] = [];

    for (let i = 0; i < maxLen; i++) {
      const cpuPoint = cpuData[i];
      const memPoint = memoryData[i];

      result.push({
        time: cpuPoint?.time || memPoint?.time || '',
        timestamp: cpuPoint?.timestamp || memPoint?.timestamp || 0,
        cpu: cpuPoint?.value ?? 0,
        memory: memPoint?.value ?? 0,
      });
    }

    return result;
  }, [cpuData, memoryData]);

  /**
   * Custom legend renderer matching our design system
   */
  const renderLegend = () => (
    <div className="flex items-center justify-center gap-6 mt-2">
      <div className="flex items-center gap-2">
        <span className="w-3 h-0.5 rounded-full bg-blue-400" />
        <span className="text-[10px] text-gray-400 font-mono">
          CPU {(cpuCurrent ?? 0).toFixed(1)}%
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-0.5 rounded-full bg-purple-400" />
        <span className="text-[10px] text-gray-400 font-mono">
          MEM {(memoryCurrent ?? 0).toFixed(1)}%
        </span>
      </div>
    </div>
  );

  return (
    <ChartWrapper
      title="System Overview"
      subtitle="CPU & Memory combined view"
      icon={
        <svg
          className="w-4 h-4 text-cyan-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
          />
        </svg>
      }
      iconBgColor="bg-cyan-500/10"
      iconBorderColor="border-cyan-500/20"
      headerRight={
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-600 font-mono">
            {combinedData.length}pts
          </span>
        </div>
      }
      minHeight={320}
    >
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={combinedData}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <defs>
            {/* CPU gradient */}
            <linearGradient id="combinedCpuGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
            {/* Memory gradient */}
            <linearGradient id="combinedMemGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#a855f7" stopOpacity={0.02} />
            </linearGradient>
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
              stroke: '#6b7280',
              strokeWidth: 1,
              strokeDasharray: '4 4',
            }}
          />

          <Legend content={renderLegend} />

          {/* Warning line */}
          <ReferenceLine
            y={75}
            stroke="#f59e0b"
            strokeDasharray="6 4"
            strokeOpacity={0.3}
          />

          {/* CPU area */}
          <Area
            type="monotone"
            dataKey="cpu"
            name="CPU"
            stroke="#3b82f6"
            strokeWidth={1.5}
            fill="url(#combinedCpuGradient)"
            dot={false}
            activeDot={{
              r: 3,
              fill: '#3b82f6',
              stroke: '#1e3a5f',
              strokeWidth: 2,
            }}
            isAnimationActive={false}
          />

          {/* Memory area */}
          <Area
            type="monotone"
            dataKey="memory"
            name="Memory"
            stroke="#a855f7"
            strokeWidth={1.5}
            fill="url(#combinedMemGradient)"
            dot={false}
            activeDot={{
              r: 3,
              fill: '#a855f7',
              stroke: '#3b1d6e',
              strokeWidth: 2,
            }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}