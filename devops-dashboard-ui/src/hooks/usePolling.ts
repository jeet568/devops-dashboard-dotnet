'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { ConnectionState } from '@/types/system';
import API_CONFIG from '@/config/api.config';

interface UsePollingOptions<T> {
  /** Async function that fetches data */
  fetchFn: () => Promise<T>;
  /** Callback when data is successfully fetched */
  onSuccess: (data: T) => void;
  /** Callback when fetch fails */
  onError?: (error: Error) => void;
  /** Polling interval in milliseconds */
  intervalMs?: number;
  /** Whether polling is enabled */
  enabled?: boolean;
}

interface UsePollingReturn {
  /** Current connection state */
  connectionState: ConnectionState;
  /** Number of consecutive failures */
  failureCount: number;
  /** Timestamp of last successful fetch */
  lastSuccessTime: number | null;
  /** Manually trigger a fetch */
  refetch: () => void;
}

/**
 * Safe polling hook with:
 * - No duplicate intervals (single interval ref)
 * - No memory leaks (proper cleanup)
 * - Auto reconnect with backoff on failure
 * - Connection state tracking
 * - Consecutive failure counting
 */
export function usePolling<T>({
  fetchFn,
  onSuccess,
  onError,
  intervalMs = API_CONFIG.POLLING.INTERVAL_MS,
  enabled = true,
}: UsePollingOptions<T>): UsePollingReturn {
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');
  const [failureCount, setFailureCount] = useState(0);
  const [lastSuccessTime, setLastSuccessTime] = useState<number | null>(null);

  // Refs to prevent stale closures and duplicate intervals
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef(false);
  const mountedRef = useRef(true);
  const failureCountRef = useRef(0);

  // Stable reference to callbacks using refs
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const fetchFnRef = useRef(fetchFn);

  // Update refs when callbacks change (avoids re-creating intervals)
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  /**
   * Core fetch execution with guard against overlapping calls
   */
  const executeFetch = useCallback(async () => {
    // Guard: skip if already fetching or component unmounted
    if (isFetchingRef.current || !mountedRef.current) return;

    isFetchingRef.current = true;

    try {
      const data = await fetchFnRef.current();

      // Guard: component might have unmounted during fetch
      if (!mountedRef.current) return;

      // Success path
      failureCountRef.current = 0;
      setFailureCount(0);
      setConnectionState('connected');
      setLastSuccessTime(Date.now());
      onSuccessRef.current(data);
    } catch (error: unknown) {
      if (!mountedRef.current) return;

      // Failure path
      failureCountRef.current += 1;
      const currentFailures = failureCountRef.current;
      setFailureCount(currentFailures);

      if (currentFailures >= API_CONFIG.POLLING.MAX_CONSECUTIVE_FAILURES) {
        setConnectionState('error');
      } else {
        setConnectionState('disconnected');
      }

      if (onErrorRef.current && error instanceof Error) {
        onErrorRef.current(error);
      }
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  /**
   * Manual refetch trigger
   */
  const refetch = useCallback(() => {
    executeFetch();
  }, [executeFetch]);

  /**
   * Main polling lifecycle
   * - Starts on mount / when enabled changes
   * - Cleans up on unmount / when disabled
   * - SINGLE interval — no duplicates possible
   */
  useEffect(() => {
    mountedRef.current = true;

    if (!enabled) {
      // Clear any existing interval when disabled
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Set initial state
    setConnectionState('connecting');

    // Execute immediately on enable
    executeFetch();

    // Clear any previous interval before creating new one (safety)
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Create single polling interval
    intervalRef.current = setInterval(executeFetch, intervalMs);

    // Cleanup function — runs on unmount or dependency change
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, intervalMs, executeFetch]);

  return {
    connectionState,
    failureCount,
    lastSuccessTime,
    refetch,
  };
}