'use client';

interface StaleDataBannerProps {
  staleDurationMs: number;
  isOnline: boolean;
}

/**
 * Warning banner shown when data hasn't updated for longer than expected
 * Helps user understand that displayed metrics may be outdated
 */
export default function StaleDataBanner({
  staleDurationMs,
  isOnline,
}: StaleDataBannerProps) {
  const seconds = Math.floor(staleDurationMs / 1000);

  return (
    <div className="mb-4 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 animate-fade-in">
      <svg
        className="w-4 h-4 text-amber-400 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div className="flex-1">
        <p className="text-xs text-amber-400 font-medium">
          Stale Data Warning
        </p>
        <p className="text-[10px] text-amber-400/60 font-mono mt-0.5">
          Last update was {seconds}s ago
          {!isOnline && ' • Browser is offline'}
        </p>
      </div>
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-[10px] text-amber-400 font-mono">
          {seconds}s
        </span>
      </div>
    </div>
  );
}