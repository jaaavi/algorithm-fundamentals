'use client';

import { useStepPlayer } from '@/hooks/useStepPlayer';
import { StepControls } from './StepControls';
import type { BacktrackingConfig, BacktrackingNode } from '@/types/visualizations';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/cn';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Tree layout utilities ────────────────────────────────────────────────────

function countLeaves(node: BacktrackingNode): number {
  if (node.children.length === 0) return 1;
  return node.children.reduce((s, c) => s + countLeaves(c), 0);
}

function getDepth(node: BacktrackingNode): number {
  if (node.children.length === 0) return 0;
  return 1 + Math.max(...node.children.map(getDepth));
}

function allNodes(root: BacktrackingNode): BacktrackingNode[] {
  const out: BacktrackingNode[] = [];
  function dfs(n: BacktrackingNode) { out.push(n); n.children.forEach(dfs); }
  dfs(root);
  return out;
}

function allEdges(root: BacktrackingNode): [string, string][] {
  const out: [string, string][] = [];
  function dfs(n: BacktrackingNode) {
    n.children.forEach(c => { out.push([n.id, c.id]); dfs(c); });
  }
  dfs(root);
  return out;
}

function computeLayout(
  node: BacktrackingNode,
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
  default:  { fill: '#f8fafc', stroke: '#cbd5e1', text: '#475569', sw: 1.5 },
  path:     { fill: '#dbeafe', stroke: '#3b82f6', text: '#1d4ed8', sw: 2 },
  active:   { fill: '#2563eb', stroke: '#1d4ed8', text: '#ffffff', sw: 2.5 },
  pruned:   { fill: '#fee2e2', stroke: '#f87171', text: '#991b1b', sw: 1.5 },
  solution: { fill: '#059669', stroke: '#047857', text: '#ffffff', sw: 2.5 },
};
const C_DARK = {
  default:  { fill: '#1e293b', stroke: '#475569', text: '#94a3b8', sw: 1.5 },
  path:     { fill: '#1e3a5f', stroke: '#60a5fa', text: '#93c5fd', sw: 2 },
  active:   { fill: '#2563eb', stroke: '#60a5fa', text: '#ffffff', sw: 2.5 },
  pruned:   { fill: '#450a0a', stroke: '#f87171', text: '#fca5a5', sw: 1.5 },
  solution: { fill: '#064e3b', stroke: '#34d399', text: '#6ee7b7', sw: 2.5 },
};

const NODE_H = 30;
const LEVEL_H = 90;
const MIN_W  = 500;
const UNIT   = 80;
const R      = 8;

export function BacktrackingTreeVisualizer({ config }: { config: BacktrackingConfig }) {
  const player = useStepPlayer(config.steps.length);
  const { settings } = useStore();
  const isDark = settings.theme === 'dark';
  const colors = isDark ? C_DARK : C;

  const s = config.steps[player.step];
  const leaves = countLeaves(config.root);
  const depth  = getDepth(config.root);
  const svgW   = Math.max(MIN_W, leaves * UNIT);
  const svgH   = (depth + 1) * LEVEL_H + 60;
  const unit   = svgW / leaves;

  const layout = new Map<string, { x: number; y: number }>();
  computeLayout(config.root, 0, 0, unit, LEVEL_H, layout);

  const nodes = allNodes(config.root);
  const edges = allEdges(config.root);

  function nodeColor(id: string) {
    if (s.activeNodeId === id) return colors.active;
    if (s.solutionNodeIds.includes(id)) return colors.solution;
    if (s.prunedNodeIds.includes(id)) return colors.pruned;
    if (s.activePath.includes(id)) return colors.path;
    return colors.default;
  }

  function edgeColor(from: string, to: string) {
    if (s.solutionNodeIds.includes(to)) return '#34d399';
    if (s.prunedNodeIds.includes(to)) return '#f87171';
    if (s.activePath.includes(from) && s.activePath.includes(to)) return '#60a5fa';
    return isDark ? '#475569' : '#cbd5e1';
  }

  const phaseLabels: Record<string, string> = {
    init: 'Árbol de decisiones', exploring: 'Explorando', pruning: 'Podando rama',
    solution: '¡Solución encontrada!', backtracking: 'Vuelta atrás', done: 'Completado',
  };
  const phaseBadge: Record<string, string> = {
    init: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
    exploring: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    pruning: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    solution: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    backtracking: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    done: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
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
          <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
            Backtracking
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Stats */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className={cn('text-xs px-2.5 py-1 rounded-full font-semibold', phaseBadge[s.phase] ?? phaseBadge.init)}>
            {phaseLabels[s.phase] ?? s.phase}
          </span>
          <div className="flex items-center gap-3 ml-auto text-xs text-slate-500 dark:text-slate-400">
            <span>
              Soluciones: <span className="font-bold text-emerald-600 dark:text-emerald-400">{s.solutionNodeIds.length}</span>
            </span>
            <span>
              Podas: <span className="font-bold text-red-500">{s.prunedNodeIds.length}</span>
            </span>
          </div>
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
              const ec = edgeColor(from, to);
              const isPruned = s.prunedNodeIds.includes(to);
              return (
                <line
                  key={`${from}-${to}`}
                  x1={pf.x} y1={pf.y + NODE_H / 2 + 2}
                  x2={pt.x} y2={pt.y - NODE_H / 2 - 2}
                  stroke={ec}
                  strokeWidth={isPruned ? 1.5 : 2}
                  strokeDasharray={isPruned ? '4 3' : undefined}
                  style={{ transition: 'stroke 0.4s' }}
                />
              );
            })}

            {/* Nodes */}
            {nodes.map(node => {
              const pos = layout.get(node.id)!;
              const c   = nodeColor(node.id);
              const nw  = Math.max(56, node.label.length * 8 + 18);
              const isPruned   = s.prunedNodeIds.includes(node.id);
              const isSolution = s.solutionNodeIds.includes(node.id);

              return (
                <g key={node.id} style={{ transition: 'all 0.4s' }}>
                  <rect
                    x={pos.x - nw / 2} y={pos.y - NODE_H / 2}
                    width={nw} height={NODE_H} rx={R}
                    fill={c.fill} stroke={c.stroke} strokeWidth={c.sw}
                    style={{ transition: 'fill 0.4s, stroke 0.4s' }}
                  />
                  <text
                    x={pos.x} y={pos.y}
                    dominantBaseline="middle" textAnchor="middle"
                    fontSize={11} fontFamily="monospace" fontWeight={600}
                    fill={c.text}
                    textDecoration={isPruned ? 'line-through' : undefined}
                    style={{ transition: 'fill 0.4s' }}
                  >
                    {node.label}
                  </text>
                  {/* ✓ for solution */}
                  {isSolution && (
                    <text
                      x={pos.x + nw / 2 + 4} y={pos.y}
                      dominantBaseline="middle" fontSize={12}
                      fill={isDark ? '#34d399' : '#059669'}
                    >
                      ✓
                    </text>
                  )}
                  {/* ✗ for pruned */}
                  {isPruned && (
                    <text
                      x={pos.x + nw / 2 + 4} y={pos.y}
                      dominantBaseline="middle" fontSize={12}
                      fill={isDark ? '#f87171' : '#dc2626'}
                    >
                      ✗
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
            { color: 'bg-blue-500', label: 'Nodo activo' },
            { color: 'bg-blue-100 dark:bg-blue-900/40 border border-blue-400', label: 'Camino actual' },
            { color: 'bg-emerald-500', label: 'Solución ✓' },
            { color: 'bg-red-100 dark:bg-red-900/30 border border-red-400', label: 'Podado ✗' },
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
