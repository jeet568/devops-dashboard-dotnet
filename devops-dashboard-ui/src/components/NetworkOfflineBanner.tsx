'use client';

interface NetworkOfflineBannerProps {
  lastOfflineAt: number | null;
}

/**
 * Banner shown when browser detects no network connection
 * Distinct from API connection failure — this is a browser-level detection
 */
export default function NetworkOfflineBanner({
  lastOfflineAt,
}: NetworkOfflineBannerProps) {
  return (
    <div className="mb-4 px-4 py-3 rounded-xl bg-gray-500/10 border border-gray-500/20 flex items-center gap-3 animate-fade-in">
      <svg
        className="w-4 h-4 text-gray-400 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M18.364 5.636a9 9 0 010 12.728m-2.829-2.829a5 5 0 000-7.07m-4.243 4.243a1 1 0 110-1.414"
        />
        {/* Cross line for "no signal" */}
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6"
        />
      </svg>
      <div className="flex-1">
        <p className="text-xs text-gray-300 font-medium">
          Network Offline
        </p>
        <p className="text-[10px] text-gray-500 font-mono mt-0.5">
          Your browser has lost network connectivity. Polling is paused.
          {lastOfflineAt && (
            <> • Since {new Date(lastOfflineAt).toLocaleTimeString()}</>
          )}
        </p>
      </div>
    </div>
  );
}