'use client';

import { SystemStatus } from '@/types/system';
import StatusIndicator from '@/components/ui/StatusIndicator';

interface UptimeCardProps {
  status: SystemStatus;
}

/**
 * Parse uptime string and extract days/hours/minutes/seconds
 * Handles formats like "5.03:22:41" or "03:22:41"
 */
function parseUptime(uptime: string | undefined): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  if (!uptime) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  let days = 0;
  let timePart = uptime;

  // Check for days separator (dot before time)
  if (uptime.includes('.')) {
    const parts = uptime.split('.');
    // Could be "5.03:22:41" or "03:22:41.1234567"
    if (parts[0].includes(':')) {
      // No days, dot is fractional seconds
      timePart = parts[0];
    } else {
      days = parseInt(parts[0], 10) || 0;
      timePart = parts[1] || '00:00:00';
      // Remove fractional seconds if present
      if (timePart.includes('.')) {
        timePart = timePart.split('.')[0];
      }
    }
  }

  // Remove fractional seconds if still present
  if (timePart.includes('.')) {
    timePart = timePart.split('.')[0];
  }

  const timeParts = timePart.split(':');
  const hours = parseInt(timeParts[0], 10) || 0;
  const minutes = parseInt(timeParts[1], 10) || 0;
  const seconds = parseInt(timeParts[2], 10) || 0;

  return { days, hours, minutes, seconds };
}

export default function UptimeCard({ status }: UptimeCardProps) {
  const uptime = parseUptime(status?.uptime);
  const machineName = status?.machineName ?? 'Unknown';

  return (
    <div className="metric-card group">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <svg
              className="w-4 h-4 text-emerald-400"
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
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-200">Uptime</h3>
            <p className="text-[10px] text-gray-500 font-mono">System Runtime</p>
          </div>
        </div>
        <StatusIndicator level="healthy" label="RUNNING" />
      </div>

      {/* Uptime display */}
      <div className="flex justify-center py-4">
        <div className="flex items-baseline gap-1">
          {uptime.days > 0 && (
            <>
              <span className="mono-value text-3xl font-bold text-emerald-400">
                {uptime.days}
              </span>
              <span className="text-xs text-gray-500 font-mono mr-2">d</span>
            </>
          )}
          <span className="mono-value text-3xl font-bold text-emerald-400">
            {String(uptime.hours).padStart(2, '0')}
          </span>
          <span className="text-lg text-gray-600 font-mono animate-pulse">:</span>
          <span className="mono-value text-3xl font-bold text-emerald-400">
            {String(uptime.minutes).padStart(2, '0')}
          </span>
          <span className="text-lg text-gray-600 font-mono animate-pulse">:</span>
          <span className="mono-value text-3xl font-bold text-emerald-400">
            {String(uptime.seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Machine info */}
      <div className="mt-4 pt-3 border-t border-gray-800">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-gray-500 font-mono uppercase">Host</p>
            <p className="text-sm text-gray-300 font-mono font-medium truncate">
              {machineName}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-mono uppercase">Status</p>
            <p className="text-sm text-emerald-400 font-mono font-medium">
              Online
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}