'use client';

import { useStepPlayer } from '@/hooks/useStepPlayer';
import { StepControls } from './StepControls';
import type { BinarySearchConfig } from '@/types/visualizations';
import { cn } from '@/lib/cn';
import { motion, AnimatePresence } from 'framer-motion';

interface Pointer { label: string; idx: number; color: string; bg: string }

function getCellClass(
  idx: number,
  left: number,
  right: number,
  mid: number | null,
  discarded: number[],
  phase: string,
): string {
  if (phase === 'found' && idx === mid)
    return 'bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40 scale-110';
  if (discarded.includes(idx))
    return 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 line-through';
  if (idx === mid)
    return 'bg-violet-500 border-violet-600 text-white scale-105 shadow-md';
  if (idx === left && idx === right)
    return 'bg-blue-100 dark:bg-blue-900/40 border-blue-400 dark:border-blue-600 text-blue-800 dark:text-blue-200';
  if (idx >= left && idx <= right)
    return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-slate-700 dark:text-slate-300';
  return 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400';
}

export function BinarySearchVisualizer({ config }: { config: BinarySearchConfig }) {
  const player = useStepPlayer(config.steps.length);
  const s = config.steps[player.step];

  const pointers: Pointer[] = [
    { label: 'L', idx: s.left,  color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-500' },
    { label: 'R', idx: s.right, color: 'text-red-600 dark:text-red-400',     bg: 'bg-red-500' },
    ...(s.mid !== null ? [{ label: 'M', idx: s.mid, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500' }] : []),
  ];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{config.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{config.description}</p>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-medium">
            Búsqueda binaria
          </span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Target + legend */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500 dark:text-slate-400">Buscando:</span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 font-bold font-mono">
              {config.target}
            </span>
          </div>
          <div className="flex items-center gap-3 ml-auto text-xs">
            {[
              { bg: 'bg-blue-500', label: 'mid (M)' },
              { bg: 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200', label: 'zona activa' },
              { bg: 'bg-slate-100', label: 'descartado' },
              { bg: 'bg-emerald-500', label: 'encontrado' },
            ].map(({ bg, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={cn('w-3 h-3 rounded-sm', bg)} />
                <span className="text-slate-500 dark:text-slate-400">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Array + pointer labels */}
        <div className="overflow-x-auto pb-2">
          <div className="relative min-w-max">
            {/* Pointer labels above cells */}
            <div className="flex gap-2 mb-1 h-5">
              {config.array.map((_, idx) => {
                const ptr = pointers.find(p => p.idx === idx);
                return (
                  <div key={idx} className="w-11 flex justify-center">
                    {ptr && (
                      <span className={cn('text-xs font-bold', ptr.color)}>{ptr.label}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Cells */}
            <div className="flex gap-2">
              {config.array.map((val, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      'w-11 h-11 rounded-xl border-2 flex items-center justify-center font-bold font-mono text-sm transition-all duration-300',
                      getCellClass(idx, s.left, s.right, s.mid, s.discarded, s.phase),
                    )}
                  >
                    {val}
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">{idx}</span>
                </div>
              ))}
            </div>

            {/* Pointer arrows below cells */}
            <div className="flex gap-2 mt-1 h-4">
              {config.array.map((_, idx) => {
                const ptr = pointers.find(p => p.idx === idx);
                return (
                  <div key={idx} className="w-11 flex justify-center">
                    {ptr && <div className={cn('w-0.5 h-3 mx-auto', ptr.bg)} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* State summary */}
        <div className="flex items-center gap-4 text-xs font-mono bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2.5">
          <span><span className="text-blue-500 font-semibold">left</span> = <span className="font-bold">{s.left}</span></span>
          <span><span className="text-red-500 font-semibold">right</span> = <span className="font-bold">{s.right}</span></span>
          {s.mid !== null && (
            <span><span className="text-violet-500 font-semibold">mid</span> = <span className="font-bold">{s.mid}</span> <span className="text-slate-400">(v[{s.mid}]={config.array[s.mid]})</span></span>
          )}
          <span className="ml-auto">descartados: <span className="font-bold text-slate-600 dark:text-slate-300">{s.discarded.length}</span></span>
        </div>

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
              {s.title}
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{s.description}</p>
          </motion.div>
        </AnimatePresence>

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
