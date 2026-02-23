'use client';

import { ConnectionState } from '@/types/system';
import { format } from 'date-fns';

interface ConnectionStatusProps {
  state: ConnectionState;
  failureCount: number;
  lastUpdated: number | null;
  onRetry?: () => void;
}

const STATUS_CONFIG: Record<
  ConnectionState,
  { label: string; dotColor: string; badgeClass: string; animate: boolean }
> = {
  connected: {
    label: 'LIVE',
    dotColor: 'bg-emerald-400',
    badgeClass: 'connection-badge connected',
    animate: true,
  },
  connecting: {
    label: 'CONNECTING',
    dotColor: 'bg-yellow-400',
    badgeClass: 'connection-badge connecting',
    animate: true,
  },
  disconnected: {
    label: 'RECONNECTING',
    dotColor: 'bg-yellow-400',
    badgeClass: 'connection-badge connecting',
    animate: true,
  },
  error: {
    label: 'OFFLINE',
    dotColor: 'bg-red-400',
    badgeClass: 'connection-badge disconnected',
    animate: false,
  },
};

export default function ConnectionStatus({
  state,
  failureCount,
  lastUpdated,
  onRetry,
}: ConnectionStatusProps) {
  const config = STATUS_CONFIG[state];

  return (
    <div className="flex items-center gap-3">
      {/* Last updated time */}
      {lastUpdated && state === 'connected' && (
        <span className="text-[11px] text-gray-500 font-mono hidden sm:inline">
          Updated {format(new Date(lastUpdated), 'HH:mm:ss')}
        </span>
      )}

      {/* Failure count indicator */}
      {failureCount > 0 && state !== 'connected' && (
        <span className="text-[11px] text-red-400/70 font-mono hidden sm:inline">
          Retries: {failureCount}
        </span>
      )}

      {/* Connection badge */}
      <button
        onClick={onRetry}
        className={`${config.badgeClass} cursor-pointer hover:opacity-80 transition-opacity`}
        title={state === 'error' ? 'Click to retry' : `Status: ${state}`}
      >
        <span className="relative flex h-2 w-2">
          {config.animate && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.dotColor} opacity-75`}
            />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`}
          />
        </span>
        {config.label}
      </button>
    </div>
  );
}