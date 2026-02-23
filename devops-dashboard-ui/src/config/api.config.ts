// Centralized API configuration
// Modify BACKEND_URL if your backend runs on a different port

const API_CONFIG = {
  BACKEND_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5162',
  ENDPOINTS: {
    SYSTEM_STATUS: '/api/System/status',
    HEALTH: '/api/Health',
    DOCKER: '/api/Docker',
    DEPLOYMENTS: '/api/Deployments',
    LOGS: '/api/Logs',
  },
  POLLING: {
    INTERVAL_MS: 1000,          // 1 second polling
    MAX_CHART_POINTS: 60,       // Keep last 60 data points (1 minute of data)
    RETRY_DELAY_MS: 3000,       // Wait 3 seconds before retry on failure
    MAX_CONSECUTIVE_FAILURES: 5, // Show error state after 5 consecutive failures
  },
} as const;

export default API_CONFIG;