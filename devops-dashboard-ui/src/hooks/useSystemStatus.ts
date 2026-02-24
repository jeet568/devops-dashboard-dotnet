'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { SystemStatus, TimeSeriesPoint, ChartData, ConnectionState } from '@/types/system';
import { usePolling } from './usePolling';
import { useVisibility } from './useVisibility';
import { useNetworkStatus } from './useNetworkStatus';
import { useStaleDetection } from './useStaleDetection';
import apiService from '@/services/api.service';
import API_CONFIG from '@/config/api.config';
import { format } from 'date-fns';

interface UseSystemStatusReturn {
  /** Latest system status data */
  currentStatus: SystemStatus | null;
  /** Time-series chart data (CPU + Memory) */
  chartData: ChartData;
  /** Connection state */
  connectionState: ConnectionState;
  /** Consecutive failure count */
  failureCount: number;
  /** Last successful update timestamp */
  lastUpdated: number | null;
  /** Error from last failed fetch */
  lastError: string | null;
  /** Manual refresh trigger */
  refetch: () => void;
  /** Whether a fetch is currently in progress */
  isFetching: boolean;
  /** Whether the browser tab is visible */
  isTabVisible: boolean;
  /** Whether the browser is online */
  isOnline: boolean;
  /** Whether displayed data is stale */
  isStale: boolean;
  /** How long since last update (ms) */
  staleDurationMs: number;
  /** Timestamp of last offline event */
  lastOfflineAt: number | null;
}

/**
 * Production-grade system status hook
 * Combines polling, visibility, network detection, and stale detection
 */
export function useSystemStatus(): UseSystemStatusReturn {
  const [currentStatus, setCurrentStatus] = useState<SystemStatus | null>(null);
  const [chartData, setChartData] = useState<ChartData>({ cpu: [], memory: [] });
  const [lastError, setLastError] = useState<string | null>(null);

  // Ref for chart data to avoid stale closure in callbacks
  const chartDataRef = useRef<ChartData>({ cpu: [], memory: [] });

  // Tab visibility — pause polling when tab is hidden
  const isTabVisible = useVisibility();

  // Network status — detect browser offline
  const { isOnline, lastOfflineAt } = useNetworkStatus();

  // Only poll when tab is visible AND browser is online
  const shouldPoll = useMemo(
    () => isTabVisible && isOnline,
    [isTabVisible, isOnline]
  );

  /**
   * Handle successful data fetch
   * Uses immutable array operations for memory safety
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

    const maxPoints = API_CONFIG.POLLING.MAX_CHART_POINTS;
    const prevData = chartDataRef.current;

    // Immutable array operations — create new arrays, don't mutate
    const newCpu = prevData.cpu.length >= maxPoints
      ? [...prevData.cpu.slice(-(maxPoints - 1)), newCpuPoint]
      : [...prevData.cpu, newCpuPoint];

    const newMemory = prevData.memory.length >= maxPoints
      ? [...prevData.memory.slice(-(maxPoints - 1)), newMemoryPoint]
      : [...prevData.memory, newMemoryPoint];

    const newChartData: ChartData = {
      cpu: newCpu,
      memory: newMemory,
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
  const {
    connectionState,
    failureCount,
    lastSuccessTime,
    refetch,
    isFetching,
  } = usePolling<SystemStatus>({
    fetchFn: fetchSystemStatus,
    onSuccess: handleSuccess,
    onError: handleError,
    intervalMs: API_CONFIG.POLLING.INTERVAL_MS,
    enabled: shouldPoll,
  });

  /**
   * Stale data detection
   */
  const { isStale, staleDurationMs } = useStaleDetection(lastSuccessTime, {
    staleThresholdMs: 5000,
    checkIntervalMs: 1000,
  });

  return {
    currentStatus,
    chartData,
    connectionState,
    failureCount,
    lastUpdated: lastSuccessTime,
    lastError,
    refetch,
    isFetching,
    isTabVisible,
    isOnline,
    isStale,
    staleDurationMs,
    lastOfflineAt,
  };
}