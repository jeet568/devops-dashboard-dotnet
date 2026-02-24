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
  /** Whether a fetch is currently in progress */
  isFetching: boolean;
}

/**
 * Calculate backoff delay with jitter for retry
 * Exponential backoff: base * 2^attempt + random jitter
 * Capped at 30 seconds max
 */
function getBackoffDelay(attempt: number): number {
  const baseDelay = API_CONFIG.POLLING.RETRY_DELAY_MS;
  const exponential = Math.min(baseDelay * Math.pow(2, attempt - 1), 30000);
  // Add 0-500ms random jitter to prevent thundering herd
  const jitter = Math.random() * 500;
  return exponential + jitter;
}

/**
 * Production-grade polling hook with:
 * - No duplicate intervals (single interval ref)
 * - No memory leaks (proper cleanup with mounted guard)
 * - Exponential backoff with jitter on failures
 * - Request deduplication (isFetching guard)
 * - Connection state tracking
 * - Manual refetch capability
 * - Safe callback refs (no stale closures)
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
  const [isFetching, setIsFetching] = useState(false);

  // Refs to prevent stale closures and duplicate intervals
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const backoffTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef(false);
  const mountedRef = useRef(true);
  const failureCountRef = useRef(0);
  const enabledRef = useRef(enabled);

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

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  /**
   * Clear all timers safely
   */
  const clearAllTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (backoffTimeoutRef.current) {
      clearTimeout(backoffTimeoutRef.current);
      backoffTimeoutRef.current = null;
    }
  }, []);

  /**
   * Start normal polling interval
   */
  const startPolling = useCallback(() => {
    // Safety: clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (!isFetchingRef.current && mountedRef.current && enabledRef.current) {
        executeFetch();
      }
    }, intervalMs);
  }, [intervalMs]);

  /**
   * Core fetch execution with guards
   */
  const executeFetch = useCallback(async () => {
    // Guard: skip if already fetching or component unmounted or disabled
    if (isFetchingRef.current || !mountedRef.current) return;

    isFetchingRef.current = true;
    setIsFetching(true);

    try {
      const data = await fetchFnRef.current();

      // Guard: component might have unmounted during fetch
      if (!mountedRef.current) return;

      // Success path — reset failure tracking
      const hadFailures = failureCountRef.current > 0;
      failureCountRef.current = 0;
      setFailureCount(0);
      setConnectionState('connected');
      setLastSuccessTime(Date.now());
      onSuccessRef.current(data);

      // If recovering from failures, restart normal polling
      if (hadFailures) {
        clearAllTimers();
        startPolling();
      }
    } catch (error: unknown) {
      if (!mountedRef.current) return;

      // Failure path — increment counter
      failureCountRef.current += 1;
      const currentFailures = failureCountRef.current;
      setFailureCount(currentFailures);

      if (currentFailures >= API_CONFIG.POLLING.MAX_CONSECUTIVE_FAILURES) {
        setConnectionState('error');

        // Stop normal polling, switch to backoff retry
        clearAllTimers();
        const backoffDelay = getBackoffDelay(currentFailures);

        backoffTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current && enabledRef.current) {
            executeFetch();
          }
        }, backoffDelay);
      } else {
        setConnectionState('disconnected');
        // Continue normal polling — it will retry on next tick
      }

      if (onErrorRef.current && error instanceof Error) {
        onErrorRef.current(error);
      }
    } finally {
      if (mountedRef.current) {
        isFetchingRef.current = false;
        setIsFetching(false);
      }
    }
  }, [clearAllTimers, startPolling]);

  /**
   * Manual refetch trigger — resets failure count and restarts polling
   */
  const refetch = useCallback(() => {
    failureCountRef.current = 0;
    setFailureCount(0);
    setConnectionState('connecting');
    clearAllTimers();
    executeFetch().then(() => {
      if (mountedRef.current && enabledRef.current) {
        startPolling();
      }
    });
  }, [executeFetch, clearAllTimers, startPolling]);

  /**
   * Main polling lifecycle
   */
  useEffect(() => {
    mountedRef.current = true;

    if (!enabled) {
      clearAllTimers();
      return;
    }

    // Set initial state
    setConnectionState('connecting');

    // Execute immediately on enable
    executeFetch();

    // Start polling interval
    startPolling();

    // Cleanup function
    return () => {
      mountedRef.current = false;
      isFetchingRef.current = false;
      clearAllTimers();
    };
  }, [enabled, executeFetch, startPolling, clearAllTimers]);

  return {
    connectionState,
    failureCount,
    lastSuccessTime,
    refetch,
    isFetching,
  };
}