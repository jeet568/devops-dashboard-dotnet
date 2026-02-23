'use client';

import { useState, useCallback, useRef } from 'react';
import { SystemStatus, TimeSeriesPoint, ChartData } from '@/types/system';
import { usePolling } from './usePolling';
import apiService from '@/services/api.service';
import API_CONFIG from '@/config/api.config';
import { format } from 'date-fns';

interface UseSystemStatusReturn {
  /** Latest system status data */
  currentStatus: SystemStatus | null;
  /** Time-series chart data (CPU + Memory) */
  chartData: ChartData;
  /** Connection state */
  connectionState: 'connected' | 'disconnected' | 'connecting' | 'error';
  /** Consecutive failure count */
  failureCount: number;
  /** Last successful update timestamp */
  lastUpdated: number | null;
  /** Error from last failed fetch */
  lastError: string | null;
  /** Manual refresh trigger */
  refetch: () => void;
}

/**
 * Specialized hook for system status monitoring
 * - Manages current status state
 * - Builds time-series data for charts
 * - Limits chart data points to MAX_CHART_POINTS
 * - Provides formatted data ready for UI consumption
 */
export function useSystemStatus(): UseSystemStatusReturn {
  const [currentStatus, setCurrentStatus] = useState<SystemStatus | null>(null);
  const [chartData, setChartData] = useState<ChartData>({ cpu: [], memory: [] });
  const [lastError, setLastError] = useState<string | null>(null);

  // Ref for chart data to avoid stale closure in callbacks
  const chartDataRef = useRef<ChartData>({ cpu: [], memory: [] });

  /**
   * Handle successful data fetch
   * - Updates current status
   * - Appends to time-series (bounded array)
   */
  const handleSuccess = useCallback((data: SystemStatus) => {
    setCurrentStatus(data);
    setLastError(null);

    const now = Date.now();
    const timeLabel = format(new Date(now), 'HH:mm:ss');

    const newCpuPoint: TimeSeriesPoint = {
      time: timeLabel,
      timestamp: now,
      value: Math.round(data.cpuUsagePercent * 100) / 100,
    };

    const newMemoryPoint: TimeSeriesPoint = {
      time: timeLabel,
      timestamp: now,
      value: Math.round(data.memoryUsagePercent * 100) / 100,
    };

    // Build new chart data with bounded arrays
    const maxPoints = API_CONFIG.POLLING.MAX_CHART_POINTS;
    const prevData = chartDataRef.current;

    const newChartData: ChartData = {
      cpu: [...prevData.cpu, newCpuPoint].slice(-maxPoints),
      memory: [...prevData.memory, newMemoryPoint].slice(-maxPoints),
    };

    // Update both ref and state
    chartDataRef.current = newChartData;
    setChartData(newChartData);
  }, []);

  /**
   * Handle fetch errors
   */
  const handleError = useCallback((error: Error) => {
    setLastError(error.message);
  }, []);

  /**
   * Fetch function for the polling hook
   */
  const fetchSystemStatus = useCallback(
    () => apiService.getSystemStatus<SystemStatus>(),
    []
  );

  /**
   * Connect to polling system
   */
  const { connectionState, failureCount, lastSuccessTime, refetch } = usePolling<SystemStatus>({
    fetchFn: fetchSystemStatus,
    onSuccess: handleSuccess,
    onError: handleError,
    intervalMs: API_CONFIG.POLLING.INTERVAL_MS,
    enabled: true,
  });

  return {
    currentStatus,
    chartData,
    connectionState,
    failureCount,
    lastUpdated: lastSuccessTime,
    lastError,
    refetch,
  };
}