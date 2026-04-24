'use client';

import { type Topic } from '@/types';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/cn';
import { CheckSquare, Square } from 'lucide-react';

interface TopicSelectorProps {
  topics:          Topic[];
  selectedTopics:  string[];
  onToggle:        (key: string) => void;
  onSelectAll:     () => void;
  onDeselectAll:   () => void;
}

export function TopicSelector({
  topics,
  selectedTopics,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: TopicSelectorProps) {
  const { progress } = useStore();

  const allSelected = selectedTopics.length === topics.length;
  const noneSelected = selectedTopics.length === 0;

  function getTopicAccuracy(topicKey: string): { pct: number; attempted: number } {
    const filtered = Object.entries(progress).filter(([id]) => id.startsWith(topicKey));
    let aciertos = 0, fallos = 0;
    for (const [, p] of filtered) { aciertos += p.aciertos; fallos += p.fallos; }
    const total = aciertos + fallos;
    return { pct: total > 0 ? Math.round((aciertos / total) * 100) : -1, attempted: filtered.filter(([,p]) => p.ultimaVez > 0).length };
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Temas</h3>
        <div className="flex gap-2">
          <button onClick={onSelectAll}   disabled={allSelected}   className="text-xs text-primary-600 disabled:opacity-40 hover:underline">Todos</button>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <button onClick={onDeselectAll} disabled={noneSelected}  className="text-xs text-slate-500 disabled:opacity-40 hover:underline">Ninguno</button>
        </div>
      </div>
      <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
        {topics.map(topic => {
          const selected = selectedTopics.includes(topic.key);
          const { pct, attempted } = getTopicAccuracy(topic.key);
          return (
            <button
              key={topic.key}
              onClick={() => onToggle(topic.key)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 group',
                selected
                  ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800'
                  : 'bg-slate-50 dark:bg-slate-700/50 border border-transparent hover:border-slate-300 dark:hover:border-slate-600',
              )}
            >
              {selected
                ? <CheckSquare className="w-4 h-4 text-primary-600 flex-shrink-0" />
                : <Square      className="w-4 h-4 text-slate-400 flex-shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium truncate', selected ? 'text-primary-700 dark:text-primary-300' : 'text-slate-700 dark:text-slate-200')}>
                  {topic.displayName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{topic.questionCount} preguntas{attempted > 0 ? ` · ${attempted} vistas` : ''}</p>
              </div>
              {pct >= 0 && (
                <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', pct >= 70 ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300' : pct >= 40 ? 'text-orange-700 bg-orange-100 dark:bg-orange-900/40 dark:text-orange-300' : 'text-red-700 bg-red-100 dark:bg-red-900/40 dark:text-red-300')}>
                  {pct}%
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
