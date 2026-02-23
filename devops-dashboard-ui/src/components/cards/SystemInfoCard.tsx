'use client';

import { SystemStatus } from '@/types/system';

interface SystemInfoCardProps {
  status: SystemStatus;
}

interface InfoRow {
  label: string;
  value: string;
  icon: string;
  color: string;
}

export default function SystemInfoCard({ status }: SystemInfoCardProps) {
  const infoRows: InfoRow[] = [
    {
      label: 'Machine Name',
      value: status.machineName,
      icon: '🖥️',
      color: 'text-blue-400',
    },
    {
      label: 'Operating System',
      value: status.osVersion,
      icon: '💻',
      color: 'text-cyan-400',
    },
    {
      label: 'Processors',
      value: `${status.processorCount} logical cores`,
      icon: '⚡',
      color: 'text-amber-400',
    },
    {
      label: 'Total Memory',
      value: status.totalMemoryMB >= 1024
        ? `${(status.totalMemoryMB / 1024).toFixed(1)} GB`
        : `${status.totalMemoryMB} MB`,
      icon: '🧠',
      color: 'text-purple-400',
    },
    {
      label: 'Available Memory',
      value: status.availableMemoryMB >= 1024
        ? `${(status.availableMemoryMB / 1024).toFixed(1)} GB`
        : `${status.availableMemoryMB} MB`,
      icon: '📊',
      color: 'text-emerald-400',
    },
    {
      label: 'Timestamp',
      value: new Date(status.timestamp).toLocaleString(),
      icon: '🕐',
      color: 'text-gray-400',
    },
  ];

  return (
    <div className="metric-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-200">System Information</h3>
            <p className="text-[10px] text-gray-500 font-mono">Host Details</p>
          </div>
        </div>
      </div>

      {/* Info rows */}
      <div className="space-y-3">
        {infoRows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-950/50 border border-gray-800/50 hover:border-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">{row.icon}</span>
              <span className="text-xs text-gray-400">{row.label}</span>
            </div>
            <span className={`text-xs font-mono font-medium ${row.color} text-right max-w-[60%] truncate`}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}