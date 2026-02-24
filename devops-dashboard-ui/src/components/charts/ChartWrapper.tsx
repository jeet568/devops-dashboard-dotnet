'use client';

import { ReactNode } from 'react';

interface ChartWrapperProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  iconBgColor: string;
  iconBorderColor: string;
  headerRight?: ReactNode;
  children: ReactNode;
  minHeight?: number;
}

/**
 * Consistent chart container with header, styling, and layout
 * Used by all chart components for uniform appearance
 */
export default function ChartWrapper({
  title,
  subtitle,
  icon,
  iconBgColor,
  iconBorderColor,
  headerRight,
  children,
  minHeight = 300,
}: ChartWrapperProps) {
  return (
    <div className="chart-container">
      {/* Chart header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-lg ${iconBgColor} border ${iconBorderColor}`}
          >
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-200">{title}</h3>
            {subtitle && (
              <p className="text-[10px] text-gray-500 font-mono">{subtitle}</p>
            )}
          </div>
        </div>
        {headerRight && <div>{headerRight}</div>}
      </div>

      {/* Chart content */}
      <div style={{ minHeight }}>{children}</div>
    </div>
  );
}