'use client';

import { useStepPlayer } from '@/hooks/useStepPlayer';
import { StepControls } from './StepControls';
import type { RecursionTreeConfig, RecursionNode } from '@/types/visualizations';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/cn';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Tree layout utilities ────────────────────────────────────────────────────

function countLeaves(node: RecursionNode): number {
  if (node.children.length === 0) return 1;
  return node.children.reduce((s, c) => s + countLeaves(c), 0);
}

function getDepth(node: RecursionNode): number {
  if (node.children.length === 0) return 0;
  return 1 + Math.max(...node.children.map(getDepth));
}

function allNodes(root: RecursionNode): RecursionNode[] {
  const out: RecursionNode[] = [];
  function dfs(n: RecursionNode) { out.push(n); n.children.forEach(dfs); }
  dfs(root);
  return out;
}

function allEdges(root: RecursionNode): [string, string][] {
  const out: [string, string][] = [];
  function dfs(n: RecursionNode) {
    n.children.forEach(c => { out.push([n.id, c.id]); dfs(c); });
  }
  dfs(root);
  return out;
}

function computeLayout(
  node: RecursionNode,
  xOff: number,
  depth: number,
  unit: number,
  lh: number,
  map: Map<string, { x: number; y: number }>,
) {
  const leaves = countLeaves(node);
  map.set(node.id, { x: xOff + (leaves * unit) / 2, y: depth * lh + lh / 2 });
  let cx = xOff;
  for (const child of node.children) {
    computeLayout(child, cx, depth + 1, unit, lh, map);
    cx += countLeaves(child) * unit;
  }
}

// ─── Colors ───────────────────────────────────────────────────────────────────

const C = {
  default:   { fill: '#f8fafc', stroke: '#cbd5e1', text: '#475569', sw: 1.5 },
  active:    { fill: '#2563eb', stroke: '#1d4ed8', text: '#ffffff', sw: 2 },
  baseCase:  { fill: '#d97706', stroke: '#b45309', text: '#ffffff', sw: 2 },
  returning: { fill: '#059669', stroke: '#047857', text: '#ffffff', sw: 2 },
  completed: { fill: '#d1fae5', stroke: '#6ee7b7', text: '#065f46', sw: 1.5 },
  done:      { fill: '#059669', stroke: '#047857', text: '#ffffff', sw: 2 },
};
const C_DARK = {
  default:   { fill: '#1e293b', stroke: '#475569', text: '#94a3b8', sw: 1.5 },
  active:    { fill: '#2563eb', stroke: '#60a5fa', text: '#ffffff', sw: 2 },
  baseCase:  { fill: '#b45309', stroke: '#fbbf24', text: '#ffffff', sw: 2 },
  returning: { fill: '#047857', stroke: '#34d399', text: '#ffffff', sw: 2 },
  completed: { fill: '#064e3b', stroke: '#34d399', text: '#6ee7b7', sw: 1.5 },
  done:      { fill: '#059669', stroke: '#34d399', text: '#ffffff', sw: 2 },
};

const NODE_H = 32;
const LEVEL_H = 90;
const MIN_W = 500;
const UNIT = 90;
const R = 8;

export function RecursionTreeVisualizer({ config }: { config: RecursionTreeConfig }) {
  const player = useStepPlayer(config.steps.length);
  const { settings } = useStore();
  const isDark = settings.theme === 'dark';
  const colors = isDark ? C_DARK : C;

  const s = config.steps[player.step];
  const leaves = countLeaves(config.root);
  const depth  = getDepth(config.root);
  const svgW   = Math.max(MIN_W, leaves * UNIT);
  const svgH   = (depth + 1) * LEVEL_H + 50;
  const unit   = svgW / leaves;

  const layout = new Map<string, { x: number; y: number }>();
  computeLayout(config.root, 0, 0, unit, LEVEL_H, layout);

  const nodes = allNodes(config.root);
  const edges = allEdges(config.root);

  function nodeColor(id: string) {
    if (s.phase === 'done') return colors.done;
    if (s.activeNodeId === id) {
      if (s.phase === 'base-case') return colors.baseCase;
      if (s.phase === 'returning') return colors.returning;
      return colors.active;
    }
    if (s.completedNodeIds.includes(id)) return colors.completed;
    return colors.default;
  }

  function edgeColor(from: string, to: string) {
    const bothCompleted = s.completedNodeIds.includes(from) && s.completedNodeIds.includes(to);
    if (bothCompleted || s.phase === 'done') return '#6ee7b7';
    if (s.activeNodeId === to || s.activeNodeId === from) return '#60a5fa';
    return isDark ? '#475569' : '#cbd5e1';
  }

  const phaseLabels: Record<string, string> = {
    init: 'Árbol de llamadas completo', calling: 'Llamada',
    'base-case': 'Caso base', returning: 'Retornando', done: 'Completado',
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{config.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{config.description}</p>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-medium">
            Árbol recursivo
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Phase badge */}
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-xs px-2.5 py-1 rounded-full font-semibold',
            s.phase === 'base-case' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
            s.phase === 'returning' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
            s.phase === 'done'      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
            'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
          )}>
            {phaseLabels[s.phase] ?? s.phase}
          </span>
          {s.activeNodeId && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              nodo activo: <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{s.activeNodeId}</span>
            </span>
          )}
        </div>

        {/* SVG */}
        <div className="overflow-x-auto rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2">
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            style={{ width: Math.max(svgW, 300), height: svgH, display: 'block' }}
          >
            {/* Edges */}
            {edges.map(([from, to]) => {
              const pf = layout.get(from)!;
              const pt = layout.get(to)!;
              return (
                <line
                  key={`${from}-${to}`}
                  x1={pf.x} y1={pf.y + NODE_H / 2 + 2}
                  x2={pt.x} y2={pt.y - NODE_H / 2 - 2}
                  stroke={edgeColor(from, to)}
                  strokeWidth={2}
                  style={{ transition: 'stroke 0.4s' }}
                />
              );
            })}

            {/* Nodes */}
            {nodes.map(node => {
              const pos = layout.get(node.id)!;
              const c   = nodeColor(node.id);
              const nw  = Math.max(64, node.label.length * 7 + 20);
              const completed = s.completedNodeIds.includes(node.id) || s.phase === 'done';

              return (
                <g key={node.id} style={{ transition: 'all 0.4s' }}>
                  {/* Node rect */}
                  <rect
                    x={pos.x - nw / 2}
                    y={pos.y - NODE_H / 2}
                    width={nw}
                    height={NODE_H}
                    rx={R}
                    fill={c.fill}
                    stroke={c.stroke}
                    strokeWidth={c.sw}
                    style={{ transition: 'fill 0.4s, stroke 0.4s' }}
                  />
                  {/* Label */}
                  <text
                    x={pos.x}
                    y={pos.y}
                    dominantBaseline="middle"
                    textAnchor="middle"
                    fontSize={11}
                    fontFamily="monospace"
                    fontWeight={600}
                    fill={c.text}
                    style={{ transition: 'fill 0.4s' }}
                  >
                    {node.label}
                  </text>
                  {/* Return value */}
                  {completed && node.returnValue && (
                    <text
                      x={pos.x}
                      y={pos.y + NODE_H / 2 + 13}
                      dominantBaseline="middle"
                      textAnchor="middle"
                      fontSize={10}
                      fontFamily="monospace"
                      fill={isDark ? '#34d399' : '#059669'}
                      fontWeight={700}
                    >
                      = {node.returnValue}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-xs">
          {[
            { color: 'bg-blue-500', label: 'Llamada activa' },
            { color: 'bg-amber-500', label: 'Caso base' },
            { color: 'bg-emerald-500', label: 'Retornando' },
            { color: 'bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-400', label: 'Completado' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={cn('w-3 h-3 rounded-sm', color)} />
              <span className="text-slate-500 dark:text-slate-400">{label}</span>
            </div>
          ))}
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
