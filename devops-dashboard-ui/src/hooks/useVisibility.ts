'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Tracks browser tab visibility using Page Visibility API
 * Returns true when tab is visible, false when hidden
 * Used to pause polling when user switches tabs (saves resources)
 */
export function useVisibility(): boolean {
  const [isVisible, setIsVisible] = useState(true);

  const handleVisibilityChange = useCallback(() => {
    setIsVisible(!document.hidden);
  }, []);

  useEffect(() => {
    // Set initial state
    setIsVisible(!document.hidden);

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  return isVisible;
}