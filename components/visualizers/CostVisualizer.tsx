'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import { useStepPlayer } from '@/hooks/useStepPlayer';
import { StepControls } from './StepControls';
import type { CostAnalysisConfig, ComplexityClass } from '@/types/visualizations';
import { cn } from '@/lib/cn';
import { motion, AnimatePresence } from 'framer-motion';

const COMPLEXITY_COLORS: Record<ComplexityClass, string> = {
  'O(1)':       '#22c55e',
  'O(log n)':   '#3b82f6',
  'O(n)':       '#f59e0b',
  'O(n log n)': '#f97316',
  'O(n²)':      '#ef4444',
  'O(2ⁿ)':      '#9333ea',
};

const ALL_CLASSES: ComplexityClass[] = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'];

function generateData() {
  return Array.from({ length: 10 }, (_, i) => {
    const n = i + 1;
    return {
      n,
      'O(1)':       1,
      'O(log n)':   parseFloat(Math.log2(n + 1).toFixed(2)),
      'O(n)':       n,
      'O(n log n)': parseFloat((n * Math.log2(n + 1)).toFixed(2)),
      'O(n²)':      n * n,
      'O(2ⁿ)':      Math.min(Math.pow(2, n), 100),
    };
  });
}

const DATA = generateData();

export function CostVisualizer({ config }: { config: CostAnalysisConfig }) {
  const player = useStepPlayer(config.steps.length);
  const s = config.steps[player.step];
  const highlighted = s.highlightedClass;
  const color = COMPLEXITY_COLORS[highlighted];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{config.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{config.description}</p>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
            Análisis de costes
          </span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Highlighted complexity badge */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 dark:text-slate-400">Complejidad actual:</span>
          <span
            className="text-base font-bold font-mono px-3 py-1 rounded-lg text-white"
            style={{ backgroundColor: color }}
          >
            {highlighted}
          </span>
        </div>

        {/* Chart */}
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={DATA} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="n"
                label={{ value: 'n (entrada)', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#94a3b8' }}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
              />
              <YAxis
                domain={[0, 100]}
                label={{ value: 'operaciones', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11, fill: '#94a3b8' }}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
              />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: '#94a3b8', marginBottom: 4 }}
                labelFormatter={(v) => `n = ${v}`}
              />
              {ALL_CLASSES.map(cls => (
                <Line
                  key={cls}
                  type="monotone"
                  dataKey={cls}
                  stroke={COMPLEXITY_COLORS[cls]}
                  strokeWidth={cls === highlighted ? 3 : 1.5}
                  strokeOpacity={cls === highlighted ? 1 : 0.3}
                  dot={false}
                  animationDuration={400}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Color legend */}
        <div className="flex flex-wrap gap-3">
          {ALL_CLASSES.map(cls => (
            <div
              key={cls}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all duration-300',
                cls === highlighted
                  ? 'text-white scale-105 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 opacity-60',
              )}
              style={cls === highlighted ? { backgroundColor: color } : {}}
            >
              {cls}
            </div>
          ))}
        </div>

        {/* Algorithms list */}
        {s.algorithms.length > 0 && (
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Algoritmos con {highlighted}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {s.algorithms.map(alg => (
                <span
                  key={alg}
                  className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                  style={{ backgroundColor: color }}
                >
                  {alg}
                </span>
              ))}
            </div>
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
            className="rounded-xl border border-slate-200 dark:border-slate-700 p-4"
            style={{ borderColor: color, borderLeftWidth: 4 }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color }}>
              {s.title}
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-2">{s.description}</p>
            {s.example && (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                💡 {s.example}
              </p>
            )}
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
