export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 bg-grid-pattern">
      {/* Top navigation bar */}
      <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <svg
                  className="w-5 h-5 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold gradient-text">
                  DevOps Dashboard
                </h1>
                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                  Real-Time Monitoring
                </p>
              </div>
            </div>

            {/* Connection status placeholder */}
            <div className="flex items-center gap-4">
              <div className="connection-badge connecting">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                INITIALIZING
              </div>
              <div className="text-xs text-gray-500 font-mono">
                v1.0.0
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard content area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Phase 1 verification message */}
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-100 mb-2">
              Phase 1 Complete
            </h2>
            <p className="text-gray-400 max-w-md">
              Next.js project structure initialized successfully.
              Ready for Phase 2 — API Client Layer.
            </p>
          </div>

          {/* Tech stack badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Recharts', 'App Router'].map(
              (tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 rounded-full bg-gray-800 text-gray-400 text-xs font-mono border border-gray-700"
                >
                  {tech}
                </span>
              )
            )}
          </div>

          {/* API target info */}
          <div className="mt-8 p-4 rounded-xl bg-gray-900 border border-gray-800 font-mono text-sm">
            <div className="text-gray-500 mb-1">API Target:</div>
            <div className="text-cyan-400">
              GET http://localhost:5162/api/System/status
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}