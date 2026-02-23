'use client';

import { useSystemStatus } from '@/hooks/useSystemStatus';
import { DashboardHeader, ErrorBanner, LoadingSkeleton } from '@/components/layout';
import { CpuCard, MemoryCard, UptimeCard, SystemInfoCard, QuickStatsBar } from '@/components/cards';

export default function Home() {
  const {
    currentStatus,
    chartData,
    connectionState,
    failureCount,
    lastUpdated,
    lastError,
    refetch,
  } = useSystemStatus();

  return (
    <main className="min-h-screen bg-gray-950 bg-grid-pattern">
      {/* Navigation header */}
      <DashboardHeader
        connectionState={connectionState}
        failureCount={failureCount}
        lastUpdated={lastUpdated}
        onRetry={refetch}
      />

      {/* Dashboard content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error banner */}
        {lastError && connectionState === 'error' && (
          <ErrorBanner message={lastError} onRetry={refetch} />
        )}

        {currentStatus ? (
          <div className="space-y-6 animate-fade-in">
            {/* Quick stats horizontal bar */}
            <QuickStatsBar status={currentStatus} chartData={chartData} />

            {/* Section label */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-200">
                  System Overview
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-gray-800 to-transparent min-w-[100px]" />
              </div>
              <span className="text-[10px] text-gray-600 font-mono">
                {new Date(currentStatus.timestamp).toLocaleTimeString()}
              </span>
            </div>

            {/* Main metric cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <CpuCard status={currentStatus} />
              <MemoryCard status={currentStatus} />
              <UptimeCard status={currentStatus} />
            </div>

            {/* Charts placeholder — Phase 4 */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="chart-container flex items-center justify-center min-h-[300px]">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-blue-400"
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
                  </div>
                  <p className="text-sm text-gray-400 font-medium">CPU Chart</p>
                  <p className="text-[10px] text-gray-600 font-mono mt-1">
                    Coming in Phase 4
                  </p>
                  <p className="text-[10px] text-blue-400/50 font-mono mt-1">
                    {chartData.cpu.length} data points ready
                  </p>
                </div>
              </div>
              <div className="chart-container flex items-center justify-center min-h-[300px]">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-purple-400"
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
                  </div>
                  <p className="text-sm text-gray-400 font-medium">Memory Chart</p>
                  <p className="text-[10px] text-gray-600 font-mono mt-1">
                    Coming in Phase 4
                  </p>
                  <p className="text-[10px] text-purple-400/50 font-mono mt-1">
                    {chartData.memory.length} data points ready
                  </p>
                </div>
              </div>
            </div>

            {/* System info section */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-semibold text-gray-200">
                  Host Details
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-gray-800 to-transparent min-w-[100px]" />
              </div>
              <SystemInfoCard status={currentStatus} />
            </div>
          </div>
        ) : (
          <LoadingSkeleton />
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 mt-12">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-gray-600 font-mono">
              DevOps Dashboard • Real-Time System Monitoring
            </p>
            <p className="text-[10px] text-gray-600 font-mono">
              Polling: 1s • Buffer: 60pts • ASP.NET Core + Next.js
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}