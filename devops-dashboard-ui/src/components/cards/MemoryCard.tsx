'use client';

import { SystemStatus, TimeSeriesPoint } from '@/types/system';
import MetricGauge from '@/components/ui/MetricGauge';
import StatusIndicator from '@/components/ui/StatusIndicator';
import ProgressBar from '@/components/ui/ProgressBar';
import MiniSparkline from '@/components/charts/MiniSparkline';

interface MemoryCardProps {
  status: SystemStatus;
  sparklineData?: TimeSeriesPoint[];
}

function getMemoryLevel(value: number): 'healthy' | 'warning' | 'critical' {
  if (value >= 90) return 'critical';
  if (value >= 75) return 'warning';
  return 'healthy';
}

function formatMB(mb: number | undefined): string {
  if (mb === undefined || mb === null) {
    return '0 MB';
  }
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(1)} GB`;
  }
  return `${mb.toFixed(0)} MB`;
}

export default function MemoryCard({ status, sparklineData = [] }: MemoryCardProps) {
  const memoryUsage = status.memoryUsagePercent ?? 0;
  const level = getMemoryLevel(memoryUsage);

  return (
    <div className="metric-card group">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20">
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
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-200">Memory</h3>
            <p className="text-[10px] text-gray-500 font-mono">RAM Utilization</p>
          </div>
        </div>
        <StatusIndicator level={level} label={level.toUpperCase()} />
      </div>

      {/* Gauge */}
      <div className="flex justify-center py-2">
        <MetricGauge
          value={memoryUsage}
          color="#a855f7"
          label="Memory"
          subtitle={formatMB(status.totalMemoryMB)}
        />
      </div>

      {/* Mini sparkline */}
      <div className="mt-3 px-1">
        <MiniSparkline data={sparklineData} color="#a855f7" height={35} />
      </div>

      {/* Memory breakdown */}
      <div className="mt-3 pt-3 border-t border-gray-800 space-y-3">
        {/* Usage bar */}
        <ProgressBar
          value={status.usedMemoryMB}
          maxValue={status.totalMemoryMB}
          showLabel
          showValue
          label="Used"
          color="bg-purple-500"
        />

        {/* Details grid */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-[10px] text-gray-500 font-mono uppercase">Used</p>
            <p className="text-xs text-purple-400 font-mono font-medium">
              {formatMB(status.usedMemoryMB)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-mono uppercase">Free</p>
            <p className="text-xs text-emerald-400 font-mono font-medium">
              {formatMB(status.availableMemoryMB)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-mono uppercase">Total</p>
            <p className="text-xs text-gray-400 font-mono font-medium">
              {formatMB(status.totalMemoryMB)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}