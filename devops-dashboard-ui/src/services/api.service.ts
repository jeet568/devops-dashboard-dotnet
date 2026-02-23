import API_CONFIG from '@/config/api.config';

/**
 * Centralized API Service
 * - Single responsibility: make HTTP requests to the backend
 * - Handles timeouts, errors, and response parsing
 * - No polling logic here (separation of concerns)
 */

export class ApiError extends Error {
  public status: number;
  public statusText: string;

  constructor(message: string, status: number, statusText: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

interface FetchOptions {
  timeout?: number;
  headers?: Record<string, string>;
}

const DEFAULT_TIMEOUT = 5000; // 5 seconds

/**
 * Core fetch wrapper with timeout and error normalization
 */
async function safeFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { timeout = DEFAULT_TIMEOUT, headers = {} } = options;
  const url = `${API_CONFIG.BACKEND_URL}${endpoint}`;

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers,
      },
      signal: controller.signal,
      // Prevent caching for real-time data
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new ApiError(
        `API request failed: ${response.status} ${response.statusText}`,
        response.status,
        response.statusText
      );
    }

    const data: T = await response.json();
    return data;
  } catch (error: unknown) {
    // Handle abort (timeout)
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new NetworkError(`Request timeout after ${timeout}ms: ${url}`);
    }

    // Re-throw our custom errors
    if (error instanceof ApiError || error instanceof NetworkError) {
      throw error;
    }

    // Handle network errors (backend unreachable)
    if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('network'))) {
      throw new NetworkError(`Backend unreachable: ${url}`);
    }

    // Unknown error
    throw new NetworkError(
      `Unexpected error: ${error instanceof Error ? error.message : 'Unknown'}`
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * API methods mapped to backend endpoints
 */
const apiService = {
  /**
   * GET /api/System/status
   * Returns CPU, memory, uptime, OS info
   */
  getSystemStatus: <T>() =>
    safeFetch<T>(API_CONFIG.ENDPOINTS.SYSTEM_STATUS),

  /**
   * GET /api/Health
   * Returns health check status
   */
  getHealth: <T>() =>
    safeFetch<T>(API_CONFIG.ENDPOINTS.HEALTH),

  /**
   * GET /api/Docker
   * Returns Docker container info
   */
  getDocker: <T>() =>
    safeFetch<T>(API_CONFIG.ENDPOINTS.DOCKER),

  /**
   * GET /api/Deployments
   * Returns deployment history
   */
  getDeployments: <T>() =>
    safeFetch<T>(API_CONFIG.ENDPOINTS.DEPLOYMENTS),

  /**
   * GET /api/Logs
   * Returns application logs
   */
  getLogs: <T>() =>
    safeFetch<T>(API_CONFIG.ENDPOINTS.LOGS),
};

export default apiService;