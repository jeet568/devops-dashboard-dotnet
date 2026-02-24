'use client';

import { useState, useEffect, useRef } from 'react';

interface StaleDetectionOptions {
  /** How old (ms) data can be before considered stale */
  staleThresholdMs?: number;
  /** How often to check staleness (ms) */
  checkIntervalMs?: number;
}

interface StaleDetectionReturn {
  /** Whether current data is stale */
  isStale: boolean;
  /** How many milliseconds since last update */
  staleDurationMs: number;
}

/**
 * Detects when data hasn't been updated for longer than expected
 * Shows warning to user that displayed data may be outdated
 */
export function useStaleDetection(
  lastUpdated: number | null,
  options: StaleDetectionOptions = {}
): StaleDetectionReturn {
  const {
    staleThresholdMs = 5000, // 5 seconds without update = stale
    checkIntervalMs = 1000,  // Check every 1 second
  } = options;

  const [isStale, setIsStale] = useState(false);
  const [staleDurationMs, setStaleDurationMs] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // No data yet — not stale, just loading
    if (lastUpdated === null) {
      setIsStale(false);
      setStaleDurationMs(0);
      return;
    }

    const checkStaleness = () => {
      const now = Date.now();
      const elapsed = now - lastUpdated;
      const stale = elapsed > staleThresholdMs;

      setIsStale(stale);
      setStaleDurationMs(elapsed);
    };

    // Check immediately
    checkStaleness();

    // Then check periodically
    intervalRef.current = setInterval(checkStaleness, checkIntervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [lastUpdated, staleThresholdMs, checkIntervalMs]);

  return { isStale, staleDurationMs };
}