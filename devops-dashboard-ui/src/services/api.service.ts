import API_CONFIG from '@/config/api.config';

/**
 * Centralized API Service
 * - Single responsibility: make HTTP requests to the backend
 * - Handles timeouts, errors, and response parsing
 * - Request ID tracking for debugging
 * - No polling logic here (separation of concerns)
 */

export class ApiError extends Error {
  public status: number;
  public statusText: string;
  public requestId: string;

  constructor(message: string, status: number, statusText: string, requestId: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.requestId = requestId;
  }
}

export class NetworkError extends Error {
  public requestId: string;

  constructor(message: string, requestId: string = '') {
    super(message);
    this.name = 'NetworkError';
    this.requestId = requestId;
  }
}

interface FetchOptions {
  timeout?: number;
  headers?: Record<string, string>;
}

const DEFAULT_TIMEOUT = 5000; // 5 seconds

// Simple request counter for debugging
let requestCounter = 0;

function generateRequestId(): string {
  requestCounter += 1;
  return `req-${requestCounter}-${Date.now()}`;
}

/**
 * Core fetch wrapper with timeout, error normalization, and request tracking
 */
async function safeFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { timeout = DEFAULT_TIMEOUT, headers = {} } = options;
  const url = `${API_CONFIG.BACKEND_URL}${endpoint}`;
  const requestId = generateRequestId();

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Request-ID': requestId,
        ...headers,
      },
      signal: controller.signal,
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new ApiError(
        `API request failed: ${response.status} ${response.statusText}`,
        response.status,
        response.statusText,
        requestId
      );
    }

    // Validate response has content
    const text = await response.text();
    if (!text || text.trim().length === 0) {
      throw new ApiError(
        'API returned empty response',
        response.status,
        'Empty Body',
        requestId
      );
    }

    // Parse JSON safely
    try {
      const data: T = JSON.parse(text);
      return data;
    } catch {
      throw new ApiError(
        'API returned invalid JSON',
        response.status,
        'Parse Error',
        requestId
      );
    }
  } catch (error: unknown) {
    // Handle abort (timeout)
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new NetworkError(
        `Request timeout after ${timeout}ms: ${endpoint}`,
        requestId
      );
    }

    // Re-throw our custom errors
    if (error instanceof ApiError || error instanceof NetworkError) {
      throw error;
    }

    // Handle network errors (backend unreachable)
    if (error instanceof TypeError) {
      throw new NetworkError(
        `Backend unreachable: ${endpoint}`,
        requestId
      );
    }

    // Unknown error
    throw new NetworkError(
      `Unexpected error: ${error instanceof Error ? error.message : 'Unknown'}`,
      requestId
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * API methods mapped to backend endpoints
 */
const apiService = {
  getSystemStatus: <T>() =>
    safeFetch<T>(API_CONFIG.ENDPOINTS.SYSTEM_STATUS),

  getHealth: <T>() =>
    safeFetch<T>(API_CONFIG.ENDPOINTS.HEALTH),

  getDocker: <T>() =>
    safeFetch<T>(API_CONFIG.ENDPOINTS.DOCKER),

  getDeployments: <T>() =>
    safeFetch<T>(API_CONFIG.ENDPOINTS.DEPLOYMENTS),

  getLogs: <T>() =>
    safeFetch<T>(API_CONFIG.ENDPOINTS.LOGS),
};

export default apiService;