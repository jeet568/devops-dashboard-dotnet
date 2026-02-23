'use client';

import { useSystemStatus } from '@/hooks/useSystemStatus';
import ConnectionStatus from '@/components/ConnectionStatus';
import { API_CONFIG } from '@/config/api.config';

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
      {/* Top navigation bar */}
      <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  Real-Time Monitoring
                </p>
              </div>
            </div>

            {/* Live connection status */}
            <div className="flex items-center gap-4">
              <ConnectionStatus
                state={connectionState}
                failureCount={failureCount}
                lastUpdated={lastUpdated}
                onRetry={refetch}
              />
              <div className="text-xs text-gray-500 font-mono hidden sm:block">
                v1.0.0
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error banner */}
        {lastError && connectionState === 'error' && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-red-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <div>
                <p className="text-sm text-red-400 font-medium">
                  Connection Lost
                </p>
                <p className="text-xs text-red-400/60 font-mono mt-0.5">
                  {lastError}
                </p>
              </div>
            </div>
            <button
              onClick={refetch}
              className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors"
            >
              Retry Now
            </button>
          </div>
        )}

        {/* Live data debug panel — Phase 2 verification */}
        <div className="space-y-6">
          {/* Status header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-100">
              System Metrics
            </h2>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
              <span>Polling: 1s</span>
              <span>•</span>
              <span>Points: {chartData.cpu.length}/60</span>
            </div>
          </div>

          {/* Raw data display — proves API connection works */}
          {currentStatus ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
              {/* CPU Card */}
              <div className="metric-card">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                    CPU Usage
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-mono">
                    LIVE
                  </span>
                </div>
                <div className="mono-value text-3xl font-bold text-blue-400">
                  {currentStatus?.cpuUsagePercent?.toFixed(1) ?? "0.0"}
                  <span className="text-lg text-gray-500 ml-1">%</span>
                </div>
                <div className="text-xs text-gray-500 mt-2 font-mono">
                  {currentStatus.processorCount} cores
                </div>
              </div>

              {/* Memory Card */}
              <div className="metric-card">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                    Memory Usage
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-mono">
                    LIVE
                  </span>
                </div>
                <div className="mono-value text-3xl font-bold text-purple-400">
                  {currentStatus?.memoryUsagePercent?.toFixed(1) ?? "0.0"}
                  <span className="text-lg text-gray-500 ml-1">%</span>
                </div>
                <div className="text-xs text-gray-500 mt-2 font-mono">
                  {currentStatus?.usedMemoryMB?.toLocaleString() ?? "0"} / {currentStatus?.totalMemoryMB?.toLocaleString() ?? "0"} MB
                </div>
              </div>

              {/* Uptime Card */}
              <div className="metric-card">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                    System Uptime
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono">
                    RUNNING
                  </span>
                </div>
                <div className="mono-value text-xl font-bold text-emerald-400 leading-tight">
                  {currentStatus?.uptime ?? "N/A"}
                </div>
                <div className="text-xs text-gray-500 mt-2 font-mono">
                  {currentStatus?.machineName ?? "Unknown"}
                </div>
              </div>

              {/* OS Info Card */}
              <div className="metric-card">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                    Operating System
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono">
                    INFO
                  </span>
                </div>
                <div className="text-sm font-medium text-cyan-400 leading-relaxed break-words">
                  {currentStatus?.osVersion ?? "Unknown"}
                </div>
                <div className="text-xs text-gray-500 mt-2 font-mono">
                  {currentStatus?.processorCount ?? 0} logical processors
                </div>
              </div>
            </div>
          ) : (
            /* Loading skeleton */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="metric-card animate-pulse">
                  <div className="h-3 bg-gray-800 rounded w-24 mb-4" />
                  <div className="h-8 bg-gray-800 rounded w-20 mb-3" />
                  <div className="h-3 bg-gray-800 rounded w-32" />
                </div>
              ))}
            </div>
          )}

          {/* Raw JSON debug — remove in Phase 3 */}
          {currentStatus && (
            <div className="metric-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                  Raw API Response (Debug — Phase 2 Verification)
                </span>
                <span className="text-xs text-gray-600 font-mono">
                  {API_CONFIG.ENDPOINTS.SYSTEM_STATUS}
                </span>
              </div>
              <pre className="text-xs text-gray-400 font-mono overflow-x-auto p-4 bg-gray-950 rounded-lg border border-gray-800">
                {JSON.stringify(currentStatus, null, 2)}
              </pre>
            </div>
          )}

          {/* Chart data accumulation proof */}
          <div className="metric-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                Time-Series Buffer (Debug — Phase 2 Verification)
              </span>
              <span className="text-xs text-gray-600 font-mono">
                {chartData.cpu.length} data points collected
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-blue-400 font-mono mb-2">CPU History:</p>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  {chartData.cpu.slice(-20).map((point, i) => (
                    <span
                      key={`cpu-${point.timestamp}-${i}`}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono"
                    >
                      {point.value}%
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-purple-400 font-mono mb-2">Memory History:</p>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  {chartData.memory.slice(-20).map((point, i) => (
                    <span
                      key={`mem-${point.timestamp}-${i}`}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono"
                    >
                      {point.value}%
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}