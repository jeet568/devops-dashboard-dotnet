'use client';

import { SystemStatus } from '@/types/system';
import MetricGauge from '@/components/ui/MetricGauge';
import StatusIndicator from '@/components/ui/StatusIndicator';

interface CpuCardProps {
  status: SystemStatus;
}

function getCpuLevel(value: number): 'healthy' | 'warning' | 'critical' {
  if (value >= 90) return 'critical';
  if (value >= 75) return 'warning';
  return 'healthy';
}

export default function CpuCard({ status }: CpuCardProps) {
  const cpuUsage = status?.cpuUsagePercent ?? 0;
  const level = getCpuLevel(cpuUsage);

  return (
    <div className="metric-card group">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20">
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
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-200">CPU Usage</h3>
            <p className="text-[10px] text-gray-500 font-mono">Processor Load</p>
          </div>
        </div>
        <StatusIndicator level={level} label={level.toUpperCase()} />
      </div>

      {/* Gauge */}
      <div className="flex justify-center py-2">
        <MetricGauge
          value={cpuUsage}
          color="#3b82f6"
          label="CPU Load"
          subtitle={`${status?.processorCount ?? 0} cores`}
        />
      </div>

      {/* Footer details */}
      <div className="mt-4 pt-3 border-t border-gray-800">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-gray-500 font-mono uppercase">Cores</p>
            <p className="text-sm text-gray-300 font-mono font-medium">
              {status?.processorCount ?? 0}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-mono uppercase">Usage</p>
            <p className="text-sm font-mono font-medium" style={{
              color: level === 'critical' ? '#ef4444' : level === 'warning' ? '#f59e0b' : '#3b82f6'
            }}>
              {cpuUsage.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}