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
              <CpuCard
                status={currentStatus}
                sparklineData={chartData.cpu}
              />
              <MemoryCard
                status={currentStatus}
                sparklineData={chartData.memory}
              />
              <UptimeCard status={currentStatus} />
            </div>

            {/* ===== SECTION: Real-Time Charts ===== */}
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-200">
                Real-Time Charts
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-gray-800 to-transparent min-w-[100px]" />
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-gray-600 font-mono">
                  STREAMING • {chartData.cpu.length}/60 pts
                </span>
              </div>
            </div>

            {/* Individual CPU and Memory charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <CpuChart
                data={chartData.cpu}
                currentValue={currentStatus.cpuUsagePercent}
              />
              <MemoryChart
                data={chartData.memory}
                currentValue={currentStatus.memoryUsagePercent}
                usedMB={currentStatus.usedMemoryMB}
                totalMB={currentStatus.totalMemoryMB}
              />
            </div>

            {/* Combined overview chart */}
            <CombinedChart
              cpuData={chartData.cpu}
              memoryData={chartData.memory}
              cpuCurrent={currentStatus.cpuUsagePercent}
              memoryCurrent={currentStatus.memoryUsagePercent}
            />

            {/* ===== SECTION: Host Details ===== */}
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-200">
                Host Details
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-gray-800 to-transparent min-w-[100px]" />
            </div>

            <SystemInfoCard status={currentStatus} />
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
              Polling: 1s • Buffer: 60pts • Recharts • ASP.NET Core + Next.js
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}