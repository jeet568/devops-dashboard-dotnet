'use client';

import { ConnectionState } from '@/types/system';
import ConnectionStatus from '@/components/ConnectionStatus';

interface DashboardHeaderProps {
  connectionState: ConnectionState;
  failureCount: number;
  lastUpdated: number | null;
  onRetry: () => void;
}

export default function DashboardHeader({
  connectionState,
  failureCount,
  lastUpdated,
  onRetry,
}: DashboardHeaderProps) {
  return (
    <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <svg
                className="w-5 h-5 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold gradient-text">
                DevOps Dashboard
              </h1>
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                Real-Time System Monitoring
              </p>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-4">
            {/* Polling indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900/50 border border-gray-800/50">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[10px] text-gray-500 font-mono">
                1s POLL
              </span>
            </div>

            <ConnectionStatus
              state={connectionState}
              failureCount={failureCount}
              lastUpdated={lastUpdated}
              onRetry={onRetry}
            />

            <div className="text-[10px] text-gray-600 font-mono hidden sm:block border-l border-gray-800 pl-4">
              v1.0.0
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}