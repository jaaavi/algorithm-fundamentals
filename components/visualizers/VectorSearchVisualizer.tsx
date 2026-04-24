'use client';

import { useStepPlayer } from '@/hooks/useStepPlayer';
import { StepControls } from './StepControls';
import type { VectorSearchConfig } from '@/types/visualizations';
import { cn } from '@/lib/cn';
import { motion, AnimatePresence } from 'framer-motion';

function cellStyle(
  idx: number,
  currentIndex: number | null,
  foundAt: number | null,
  phase: string,
): string {
  if (foundAt === idx) return 'bg-emerald-500 border-emerald-600 text-white scale-110 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40';
  if (phase === 'not-found' && foundAt === null) return 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-400';
  if (currentIndex === idx) return 'bg-blue-500 border-blue-600 text-white scale-105 shadow-md shadow-blue-200 dark:shadow-blue-900/40';
  if (currentIndex !== null && idx < currentIndex) return 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500';
  return 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200';
}

function phaseLabel(phase: string): { label: string; color: string } {
  switch (phase) {
    case 'init':       return { label: 'Inicialización', color: 'text-slate-500' };
    case 'comparing':  return { label: 'Comparando', color: 'text-blue-600 dark:text-blue-400' };
    case 'found':      return { label: '¡Encontrado!', color: 'text-emerald-600 dark:text-emerald-400' };
    case 'not-found':  return { label: 'No encontrado', color: 'text-red-500 dark:text-red-400' };
    default:           return { label: '', color: '' };
  }
}

export function VectorSearchVisualizer({ config }: { config: VectorSearchConfig }) {
  const player = useStepPlayer(config.steps.length);
  const current = config.steps[player.step];
  const { label: phLabel, color: phColor } = phaseLabel(current.phase);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{config.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{config.description}</p>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">
            Búsqueda lineal
          </span>
        </div>
      </div>

      {/* Visualization */}
      <div className="p-5 space-y-5">
        {/* Target */}
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Buscando:</span>
          <span className="px-3 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 font-bold font-mono text-base">
            {config.target}
          </span>
          <span className={cn('text-xs font-semibold ml-auto', phColor)}>{phLabel}</span>
        </div>

        {/* Array */}
        <div className="overflow-x-auto pb-1">
          <div className="flex gap-2 min-w-max">
            {config.array.map((val, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl border-2 flex items-center justify-center font-bold font-mono text-sm transition-all duration-300',
                    cellStyle(idx, current.currentIndex, current.foundAt, current.phase),
                  )}
                >
                  {val}
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">{idx}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pointer indicator */}
        {current.currentIndex !== null && (
          <div className="text-xs font-mono text-center">
            <span className="text-slate-500">i = </span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{current.currentIndex}</span>
            <span className="text-slate-500 mx-2">→</span>
            <span className="text-slate-500">v[{current.currentIndex}] = </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{config.array[current.currentIndex]}</span>
            <span className="text-slate-500 mx-2">{current.phase === 'found' ? '=' : '≠'}</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">{config.target}</span>
          </div>
        )}

        {/* Step explanation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={player.step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4"
          >
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              {current.title}
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {current.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <StepControls
          step={player.step}
          totalSteps={config.steps.length}
          playing={player.playing}
          speedKey={player.speedKey}
          onPrev={player.prev}
          onNext={player.next}
          onReset={player.reset}
          onTogglePlay={player.togglePlay}
          onSpeedChange={player.setSpeedKey}
        />
      </div>
    </div>
  );
}
