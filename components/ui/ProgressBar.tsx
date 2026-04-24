import { cn } from '@/lib/cn';

interface ProgressBarProps {
  value:     number;  // 0-100
  className?: string;
  color?:    'blue' | 'green' | 'red' | 'orange';
  showLabel?: boolean;
  animated?:  boolean;
}

const colorStyles = {
  blue:   'bg-primary-500',
  green:  'bg-emerald-500',
  red:    'bg-red-500',
  orange: 'bg-orange-400',
};

export function ProgressBar({ value, className, color = 'blue', showLabel, animated = true }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={cn('w-full', className)}>
      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full', colorStyles[color], animated && 'transition-all duration-500 ease-out')}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-right">{Math.round(pct)}%</p>
      )}
    </div>
  );
}
