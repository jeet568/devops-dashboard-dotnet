'use client';

type StatusLevel = 'healthy' | 'warning' | 'critical' | 'unknown';

interface StatusIndicatorProps {
  level: StatusLevel;
  label?: string;
  showPulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const LEVEL_CONFIG: Record<
  StatusLevel,
  { color: string; bg: string; border: string; text: string }
> = {
  healthy: {
    color: 'bg-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
  },
  warning: {
    color: 'bg-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
  },
  critical: {
    color: 'bg-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-400',
  },
  unknown: {
    color: 'bg-gray-400',
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/20',
    text: 'text-gray-400',
  },
};

const SIZE_CONFIG = {
  sm: { dot: 'h-1.5 w-1.5', text: 'text-[10px]', padding: 'px-2 py-0.5' },
  md: { dot: 'h-2 w-2', text: 'text-xs', padding: 'px-2.5 py-1' },
  lg: { dot: 'h-2.5 w-2.5', text: 'text-sm', padding: 'px-3 py-1.5' },
};

export default function StatusIndicator({
  level,
  label,
  showPulse = true,
  size = 'sm',
}: StatusIndicatorProps) {
  const config = LEVEL_CONFIG[level];
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <div
      className={`inline-flex items-center gap-1.5 ${sizeConfig.padding} rounded-full ${config.bg} border ${config.border}`}
    >
      <span className="relative flex">
        {showPulse && level === 'healthy' && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.color} opacity-75`}
          />
        )}
        <span className={`relative inline-flex rounded-full ${sizeConfig.dot} ${config.color}`} />
      </span>
      {label && (
        <span className={`${sizeConfig.text} ${config.text} font-mono font-medium tracking-wide`}>
          {label}
        </span>
      )}
    </div>
  );
}