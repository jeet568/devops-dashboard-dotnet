// System status response type matching your backend API
export interface SystemStatus {
  machineName: string;
  osVersion: string;
  processorCount: number;
  cpuUsagePercent: number;
  totalMemoryMB: number;
  usedMemoryMB: number;
  availableMemoryMB: number;
  memoryUsagePercent: number;
  uptime: string;
  timestamp: string;
}

// Connection state for the polling system
export type ConnectionState = 'connected' | 'disconnected' | 'connecting' | 'error';

// Dashboard metric card data
export interface MetricCard {
  title: string;
  value: string | number;
  unit: string;
  icon: string;
  color: string;
  trend?: 'up' | 'down' | 'stable';
}

// Time-series data point for charts
export interface TimeSeriesPoint {
  time: string;
  timestamp: number;
  value: number;
}

// Chart data container
export interface ChartData {
  cpu: TimeSeriesPoint[];
  memory: TimeSeriesPoint[];
}