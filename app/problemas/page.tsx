'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useProblems } from '@/hooks/useProblems';
import { useProblemStore } from '@/store/useProblemStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  DIFICULTAD_LABEL, DIFICULTAD_COLOR, TEMA_COLOR, SUBTIPOS_BY_TEMA,
  type ProblemTema,
} from '@/types/problems';
import { cn } from '@/lib/cn';
import {
  Code2, Filter, ChevronRight, CheckCircle2, Circle, BookOpen,
  AlertCircle, Zap, Target,
} from 'lucide-react';

const TEMAS: ProblemTema[] = ['Iterativos', 'Recursión', 'Backtracking'];

function DifficultyDots({ level }: { level: number }) {
  return (
    <span className="flex gap-0.5 items-center">
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            i <= level ? 'bg-current' : 'bg-current opacity-20',
          )}
        />
      ))}
    </span>
  );
}

export default function ProblemasPage() {
  const { problems, loading, error } = useProblems();
  const { progress } = useProblemStore();

  const [filterTema,    setFilterTema]    = useState<ProblemTema | ''>('');
  const [filterSubtipo, setFilterSubtipo] = useState('');
  const [filterDif,     setFilterDif]     = useState<number | 0>(0);
  const [showFilters,   setShowFilters]   = useState(false);

  const availableSubtipos = filterTema ? SUBTIPOS_BY_TEMA[filterTema] ?? [] : [];

  const filtered = useMemo(() => {
    let list = problems;
    if (filterTema)    list = list.filter(p => p.tema === filterTema);
    if (filterSubtipo) list = list.filter(p => p.subtipo === filterSubtipo);
    if (filterDif > 0) list = list.filter(p => p.dificultad === filterDif);
    return list;
  }, [problems, filterTema, filterSubtipo, filterDif]);

  const stats = useMemo(() => {
    const total    = problems.length;
    const solved   = Object.values(progress).filter(p => p.status === 'solved').length;
    const attempted = Object.values(progress).filter(p => p.status === 'attempted').length;
    return { total, solved, attempted };
  }, [problems, progress]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500">Cargando problemas…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="text-center max-w-md p-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="font-semibold text-lg mb-2">Error cargando problemas</h2>
          <p className="text-slate-500 text-sm">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Code2 className="w-6 h-6 text-primary-500" />
            Problemas
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            {stats.total} problemas de algoritmia con guía paso a paso
          </p>
        </div>

        {/* Mini stats */}
        <div className="flex gap-3">
          <div className="text-center px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{stats.solved}</div>
            <div className="text-xs text-emerald-600/70 dark:text-emerald-400/70">Resueltos</div>
          </div>
          <div className="text-center px-4 py-2 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{stats.attempted}</div>
            <div className="text-xs text-orange-600/70 dark:text-orange-400/70">En progreso</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setShowFilters(v => !v)}
            className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary-600 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filtros
            {(filterTema || filterSubtipo || filterDif > 0) && (
              <Badge variant="info" className="text-xs">activos</Badge>
            )}
          </button>
          <span className="text-sm text-slate-500">{filtered.length} de {stats.total}</span>
        </div>

        {/* Tema quick-filter (always visible) */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setFilterTema(''); setFilterSubtipo(''); }}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium border transition-all',
              filterTema === ''
                ? 'bg-primary-600 text-white border-primary-600'
                : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-primary-400',
            )}
          >
            Todos
          </button>
          {TEMAS.map(t => (
            <button
              key={t}
              onClick={() => { setFilterTema(filterTema === t ? '' : t); setFilterSubtipo(''); }}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border transition-all',
                filterTema === t
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-primary-400',
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Extended filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Subtipo */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Subtipo</label>
              <select
                value={filterSubtipo}
                onChange={e => setFilterSubtipo(e.target.value)}
                disabled={!filterTema}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 disabled:opacity-50"
              >
                <option value="">Todos los subtipos</option>
                {availableSubtipos.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {!filterTema && (
                <p className="text-xs text-slate-400 mt-1">Selecciona un tema primero</p>
              )}
            </div>

            {/* Dificultad */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Dificultad</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilterDif(0)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                    filterDif === 0
                      ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-800'
                      : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300',
                  )}
                >
                  Todas
                </button>
                {[1, 2, 3, 4, 5].map(d => (
                  <button
                    key={d}
                    onClick={() => setFilterDif(filterDif === d ? 0 : d)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                      filterDif === d
                        ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-800'
                        : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300',
                    )}
                  >
                    {'★'.repeat(d)}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset */}
            {(filterTema || filterSubtipo || filterDif > 0) && (
              <div className="sm:col-span-2">
                <button
                  onClick={() => { setFilterTema(''); setFilterSubtipo(''); setFilterDif(0); }}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Problem list */}
      {filtered.length === 0 ? (
        <Card className="text-center py-16">
          <Target className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No hay problemas con esos filtros.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(problem => {
            const prog = progress[problem.id];
            const gradColor = TEMA_COLOR[problem.tema] ?? 'from-slate-400 to-slate-500';
            const difColor  = DIFICULTAD_COLOR[problem.dificultad] ?? '';

            return (
              <Link key={problem.id} href={`/problemas/${problem.id}`} className="group block">
                <Card padding="none" className="overflow-hidden hover:shadow-md transition-all duration-200 group-hover:border-primary-300 dark:group-hover:border-primary-700 h-full">
                  {/* Top bar */}
                  <div className={cn('h-1.5 bg-gradient-to-r', gradColor)} />

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge variant="default" className="text-xs shrink-0">{problem.tema}</Badge>
                          <Badge variant="default" className="text-xs shrink-0 opacity-75">{problem.subtipo}</Badge>
                        </div>
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-snug line-clamp-2">
                          {problem.enunciado.split('.')[0].trim()}.
                        </h3>
                      </div>

                      {/* Status icon */}
                      <div className="shrink-0">
                        {prog?.status === 'solved' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : prog?.status === 'attempted' ? (
                          <Circle className="w-5 h-5 text-orange-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {problem.tags.slice(0, 4).map(tag => (
                        <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                      <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full', difColor)}>
                        <DifficultyDots level={problem.dificultad} />
                        {DIFICULTAD_LABEL[problem.dificultad]}
                      </span>
                      <div className="flex items-center gap-1 text-slate-400 group-hover:text-primary-500 transition-colors">
                        {prog?.status === 'solved' ? (
                          <><BookOpen className="w-3.5 h-3.5" /><span className="text-xs">Repasar</span></>
                        ) : (
                          <><Zap className="w-3.5 h-3.5" /><span className="text-xs">Resolver</span></>
                        )}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
