'use client';

import { SystemStatus } from '@/types/system';
import { ChartData } from '@/types/system';

interface QuickStatsBarProps {
  status: SystemStatus;
  chartData: ChartData;
}

interface QuickStat {
  label: string;
  value: string;
  color: string;
  dotColor: string;
}

export default function QuickStatsBar({ status, chartData }: QuickStatsBarProps) {
  // Calculate averages from chart data
  const cpuAvg =
    chartData.cpu.length > 0
      ? chartData.cpu.reduce((sum, p) => sum + p.value, 0) / chartData.cpu.length
      : 0;

  const memAvg =
    chartData.memory.length > 0
      ? chartData.memory.reduce((sum, p) => sum + p.value, 0) / chartData.memory.length
      : 0;

  // Find peaks
  const cpuPeak =
    chartData.cpu.length > 0
      ? Math.max(...chartData.cpu.map((p) => p.value))
      : 0;

  const memPeak =
    chartData.memory.length > 0
      ? Math.max(...chartData.memory.map((p) => p.value))
      : 0;

  const stats: QuickStat[] = [
    {
      label: 'CPU Current',
      value: `${(status?.cpuUsagePercent ?? 0).toFixed(1)}%`,
      color: 'text-blue-400',
      dotColor: 'bg-blue-400',
    },
    {
      label: 'CPU Avg',
      value: `${cpuAvg.toFixed(1)}%`,
      color: 'text-blue-300',
      dotColor: 'bg-blue-300',
    },
    {
      label: 'CPU Peak',
      value: `${cpuPeak.toFixed(1)}%`,
      color: 'text-blue-200',
      dotColor: 'bg-blue-200',
    },
    {
      label: 'MEM Current',
      value: `${(status?.memoryUsagePercent ?? 0).toFixed(1)}%`,
      color: 'text-purple-400',
      dotColor: 'bg-purple-400',
    },
    {
      label: 'MEM Avg',
      value: `${memAvg.toFixed(1)}%`,
      color: 'text-purple-300',
      dotColor: 'bg-purple-300',
    },
    {
      label: 'MEM Peak',
      value: `${memPeak.toFixed(1)}%`,
      color: 'text-purple-200',
      dotColor: 'bg-purple-200',
    },
    {
      label: 'Data Points',
      value: `${chartData.cpu.length}/60`,
      color: 'text-gray-400',
      dotColor: 'bg-gray-400',
    },
  ];

  return (
    <div className="w-full overflow-x-auto scrollbar-thin">
      <div className="flex items-center gap-4 min-w-max px-1 py-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-800/50"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${stat.dotColor}`} />
            <span className="text-[10px] text-gray-500 font-mono uppercase whitespace-nowrap">
              {stat.label}
            </span>
            <span className={`text-xs font-mono font-bold ${stat.color}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}