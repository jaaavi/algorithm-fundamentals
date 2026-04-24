'use client';

import { Clock } from 'lucide-react';
import { cn } from '@/lib/cn';

interface TimerProps {
  seconds:   number;
  isCountdown?: boolean;
  warning?:  number; // seconds threshold for red color
}

function pad(n: number) { return String(n).padStart(2, '0'); }

export function Timer({ seconds, isCountdown = false, warning = 60 }: TimerProps) {
  const h   = Math.floor(seconds / 3600);
  const m   = Math.floor((seconds % 3600) / 60);
  const s   = seconds % 60;
  const urgent = isCountdown && seconds <= warning;

  return (
    <div className={cn(
      'flex items-center gap-1.5 font-mono text-sm font-semibold px-3 py-1.5 rounded-lg',
      urgent
        ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 animate-pulse'
        : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
    )}>
      <Clock className="w-3.5 h-3.5" />
      {h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`}
    </div>
  );
}
