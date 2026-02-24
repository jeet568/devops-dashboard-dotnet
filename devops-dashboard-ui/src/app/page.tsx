'use client';

import { useSystemStatus } from '@/hooks/useSystemStatus';
import { DashboardHeader, ErrorBanner, LoadingSkeleton } from '@/components/layout';
import {
  CpuCard,
  MemoryCard,
  UptimeCard,
  SystemInfoCard,
  QuickStatsBar,
} from '@/components/cards';
import { CpuChart, MemoryChart, CombinedChart } from '@/components/charts';
import ErrorBoundary from '@/components/ErrorBoundary';
import StaleDataBanner from '@/components/StaleDataBanner';
import NetworkOfflineBanner from '@/components/NetworkOfflineBanner';

export default function Home() {
  const {
    currentStatus,
    chartData,
    connectionState,
    failureCount,
    lastUpdated,
    lastError,
    refetch,
    isFetching,
    isTabVisible,
    isOnline,
    isStale,
    staleDurationMs,
    lastOfflineAt,
  } = useSystemStatus();

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-gray-950 bg-grid-pattern">
        {/* Navigation header */}
        <DashboardHeader
          connectionState={connectionState}
          failureCount={failureCount}
          lastUpdated={lastUpdated}
          isFetching={isFetching}
          isTabVisible={isTabVisible}
          isOnline={isOnline}
          onRetry={refetch}
        />

        {/* Dashboard content */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Network offline banner */}
          {!isOnline && (
            <NetworkOfflineBanner lastOfflineAt={lastOfflineAt} />
          )}

          {/* Error banner */}
          {lastError && connectionState === 'error' && isOnline && (
            <ErrorBanner message={lastError} onRetry={refetch} />
          )}

          {/* Stale data warning */}
          {isStale && currentStatus && connectionState !== 'connected' && (
            <StaleDataBanner
              staleDurationMs={staleDurationMs}
              isOnline={isOnline}
            />
          )}

          {currentStatus ? (
            <div className="space-y-6 animate-fade-in">
              {/* Quick stats horizontal bar */}
              <ErrorBoundary
                fallback={
                  <div className="h-12 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-xs text-gray-500 font-mono">
                    Stats unavailable
                  </div>
                }
              >
                <QuickStatsBar status={currentStatus} chartData={chartData} />
              </ErrorBoundary>

              {/* ===== SECTION: Metric Cards ===== */}
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-200">
                  System Overview
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-gray-800 to-transparent min-w-[100px]" />
                <span className="text-[10px] text-gray-600 font-mono">
                  {new Date(currentStatus.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <ErrorBoundary>
                  <CpuCard
                    status={currentStatus}
                    sparklineData={chartData.cpu}
                  />
                </ErrorBoundary>
                <ErrorBoundary>
                  <MemoryCard
                    status={currentStatus}
                    sparklineData={chartData.memory}
                  />
                </ErrorBoundary>
                <ErrorBoundary>
                  <UptimeCard status={currentStatus} />
                </ErrorBoundary>
              </div>

              {/* ===== SECTION: Real-Time Charts ===== */}
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-200">
                  Real-Time Charts
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-gray-800 to-transparent min-w-[100px]" />
                <div className="flex items-center gap-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      connectionState === 'connected'
                        ? 'bg-emerald-400 animate-pulse'
                        : 'bg-gray-600'
                    }`}
                  />
                  <span className="text-[10px] text-gray-600 font-mono">
                    {connectionState === 'connected' ? 'STREAMING' : 'PAUSED'} •{' '}
                    {chartData.cpu.length}/60 pts
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <ErrorBoundary>
                  <CpuChart
                    data={chartData.cpu}
                    currentValue={currentStatus.cpuUsagePercent}
                  />
                </ErrorBoundary>
                <ErrorBoundary>
                  <MemoryChart
                    data={chartData.memory}
                    currentValue={currentStatus.memoryUsagePercent}
                    usedMB={currentStatus.usedMemoryMB}
                    totalMB={currentStatus.totalMemoryMB}
                  />
                </ErrorBoundary>
              </div>

              {/* Combined overview chart */}
              <ErrorBoundary>
                <CombinedChart
                  cpuData={chartData.cpu}
                  memoryData={chartData.memory}
                  cpuCurrent={currentStatus.cpuUsagePercent}
                  memoryCurrent={currentStatus.memoryUsagePercent}
                />
              </ErrorBoundary>

              {/* ===== SECTION: Host Details ===== */}
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-200">
                  Host Details
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-gray-800 to-transparent min-w-[100px]" />
              </div>

              <ErrorBoundary>
                <SystemInfoCard status={currentStatus} />
              </ErrorBoundary>
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
              <div className="flex items-center gap-3">
                {!isTabVisible && (
                  <span className="text-[10px] text-yellow-500/50 font-mono">
                    ⚡ Polling paused (tab hidden)
                  </span>
                )}
                <p className="text-[10px] text-gray-600 font-mono">
                  Polling: 1s • Buffer: 60pts • Backoff retry • ASP.NET Core + Next.js
                </p>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </ErrorBoundary>
  );
}