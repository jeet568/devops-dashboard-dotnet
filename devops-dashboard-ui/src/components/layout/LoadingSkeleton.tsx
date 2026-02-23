'use client';

export default function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Quick stats skeleton */}
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex-shrink-0 h-10 w-36 rounded-lg bg-gray-900 border border-gray-800"
          />
        ))}
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="metric-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-800" />
                <div>
                  <div className="h-4 w-20 bg-gray-800 rounded mb-1" />
                  <div className="h-2 w-16 bg-gray-800 rounded" />
                </div>
              </div>
              <div className="h-5 w-16 bg-gray-800 rounded-full" />
            </div>
            <div className="flex justify-center py-6">
              <div className="w-[120px] h-[120px] rounded-full border-8 border-gray-800" />
            </div>
            <div className="mt-4 pt-3 border-t border-gray-800">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="h-2 w-10 bg-gray-800 rounded mb-2" />
                  <div className="h-4 w-14 bg-gray-800 rounded" />
                </div>
                <div>
                  <div className="h-2 w-10 bg-gray-800 rounded mb-2" />
                  <div className="h-4 w-14 bg-gray-800 rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* System info skeleton */}
      <div className="metric-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gray-800" />
          <div>
            <div className="h-4 w-32 bg-gray-800 rounded mb-1" />
            <div className="h-2 w-20 bg-gray-800 rounded" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-10 rounded-lg bg-gray-950/50 border border-gray-800/50" />
          ))}
        </div>
      </div>
    </div>
  );
}