'use client';

import { useMemo } from 'react';

interface MetricGaugeProps {
  value: number;
  maxValue?: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  bgColor?: string;
  label: string;
  unit?: string;
  subtitle?: string;
}

/**
 * Circular gauge component for displaying percentage metrics
 * SVG-based, no external dependencies
 */
export default function MetricGauge({
  value,
  maxValue = 100,
  size = 120,
  strokeWidth = 8,
  color,
  bgColor = '#1f2937',
  label,
  unit = '%',
  subtitle,
}: MetricGaugeProps) {
  const gaugeData = useMemo(() => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const clampedValue = Math.min(Math.max(value, 0), maxValue);
    const percentage = (clampedValue / maxValue) * 100;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return { radius, circumference, percentage, strokeDashoffset };
  }, [value, maxValue, size, strokeWidth]);

  // Determine severity color based on value
  const severityColor = useMemo(() => {
    if (value >= 90) return '#ef4444'; // red
    if (value >= 75) return '#f59e0b'; // amber
    return color;
  }, [value, color]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={gaugeData.radius}
            fill="none"
            stroke={bgColor}
            strokeWidth={strokeWidth}
          />
          {/* Value arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={gaugeData.radius}
            fill="none"
            stroke={severityColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={gaugeData.circumference}
            strokeDashoffset={gaugeData.strokeDashoffset}
            className="transition-all duration-500 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${severityColor}40)`,
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="mono-value text-2xl font-bold transition-colors duration-300"
            style={{ color: severityColor }}
          >
            {value.toFixed(1)}
          </span>
          <span className="text-[10px] text-gray-500 font-mono uppercase">
            {unit}
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        {subtitle && (
          <p className="text-[10px] text-gray-600 font-mono mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}