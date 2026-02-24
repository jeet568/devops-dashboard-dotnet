'use client';

import { ConnectionState } from '@/types/system';
import { format } from 'date-fns';

interface ConnectionStatusProps {
  state: ConnectionState;
  failureCount: number;
  lastUpdated: number | null;
  isFetching?: boolean;
  isTabVisible?: boolean;
  isOnline?: boolean;
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
  isFetching = false,
  isTabVisible = true,
  isOnline = true,
  onRetry,
}: ConnectionStatusProps) {
  // Override display when tab is hidden or offline
  let displayState = state;
  let displayLabel = STATUS_CONFIG[state].label;

  if (!isOnline) {
    displayLabel = 'NO NETWORK';
  } else if (!isTabVisible && state === 'connected') {
    displayLabel = 'PAUSED';
  }

  const config = STATUS_CONFIG[displayState];

  return (
    <div className="flex items-center gap-3">
      {/* Fetching indicator */}
      {isFetching && state === 'connected' && (
        <span className="text-[10px] text-blue-400/50 font-mono hidden sm:inline animate-pulse">
          ●
        </span>
      )}

      {/* Last updated time */}
      {lastUpdated && state === 'connected' && (
        <span className="text-[10px] text-gray-500 font-mono hidden sm:inline">
          {format(new Date(lastUpdated), 'HH:mm:ss')}
        </span>
      )}

      {/* Failure count indicator */}
      {failureCount > 0 && state !== 'connected' && (
        <span className="text-[10px] text-red-400/70 font-mono hidden sm:inline">
          Retries: {failureCount}
        </span>
      )}

      {/* Tab hidden indicator */}
      {!isTabVisible && (
        <span className="text-[10px] text-gray-500 font-mono hidden sm:inline">
          Tab Hidden
        </span>
      )}

      {/* Connection badge */}
      <button
        onClick={onRetry}
        className={`${config.badgeClass} cursor-pointer hover:opacity-80 transition-opacity`}
        title={
          !isOnline
            ? 'Browser is offline'
            : !isTabVisible
              ? 'Polling paused (tab hidden)'
              : state === 'error'
                ? 'Click to retry'
                : `Status: ${state}`
        }
      >
        <span className="relative flex h-2 w-2">
          {config.animate && isOnline && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.dotColor} opacity-75`}
            />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`}
          />
        </span>
        {displayLabel}
      </button>
    </div>
  );
}