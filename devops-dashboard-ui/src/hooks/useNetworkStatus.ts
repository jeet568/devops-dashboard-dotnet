'use client';

import { useState, useEffect, useCallback } from 'react';

interface NetworkStatus {
  /** Whether the browser reports being online */
  isOnline: boolean;
  /** Timestamp of last online event */
  lastOnlineAt: number | null;
  /** Timestamp of last offline event */
  lastOfflineAt: number | null;
}

/**
 * Tracks browser online/offline status
 * Provides early detection of network issues before fetch fails
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: true,
    lastOnlineAt: null,
    lastOfflineAt: null,
  });

  const handleOnline = useCallback(() => {
    setStatus((prev) => ({
      ...prev,
      isOnline: true,
      lastOnlineAt: Date.now(),
    }));
  }, []);

  const handleOffline = useCallback(() => {
    setStatus((prev) => ({
      ...prev,
      isOnline: false,
      lastOfflineAt: Date.now(),
    }));
  }, []);

  useEffect(() => {
    // Set initial state from navigator
    if (typeof navigator !== 'undefined') {
      setStatus((prev) => ({
        ...prev,
        isOnline: navigator.onLine,
      }));
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return status;
}