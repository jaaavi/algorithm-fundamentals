'use client';

import { SkipBack, ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { SPEED_KEYS } from '@/hooks/useStepPlayer';

interface Props {
  step:         number;
  totalSteps:   number;
  playing:      boolean;
  speedKey:     string;
  onPrev:       () => void;
  onNext:       () => void;
  onReset:      () => void;
  onTogglePlay: () => void;
  onSpeedChange: (k: string) => void;
}

export function StepControls({
  step, totalSteps, playing, speedKey,
  onPrev, onNext, onReset, onTogglePlay, onSpeedChange,
}: Props) {
  const pct = totalSteps > 1 ? (step / (totalSteps - 1)) * 100 : 0;
  const btn = 'p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed';

  return (
    <div className="flex flex-col gap-2">
      {/* Progress bar */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="w-8 text-right tabular-nums">{step + 1}</span>
        <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="w-8 tabular-nums">{totalSteps}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={onReset}
            disabled={step === 0 && !playing}
            className={cn(btn, 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400')}
            title="Reiniciar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onPrev}
            disabled={step === 0}
            className={cn(btn, 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300')}
            title="Paso anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onTogglePlay}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              playing
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/60'
                : 'bg-blue-600 hover:bg-blue-700 text-white',
            )}
          >
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {playing ? 'Pausa' : step >= 0 ? 'Play' : 'Iniciar'}
          </button>
          <button
            onClick={onNext}
            disabled={step >= totalSteps - 1}
            className={cn(btn, 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300')}
            title="Siguiente paso"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Speed selector */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-400 mr-1">Vel.</span>
          {SPEED_KEYS.map(k => (
            <button
              key={k}
              onClick={() => onSpeedChange(k)}
              className={cn(
                'text-xs px-2 py-1 rounded-md transition-colors',
                speedKey === k
                  ? 'bg-slate-700 dark:bg-slate-600 text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700',
              )}
            >
              {k}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
