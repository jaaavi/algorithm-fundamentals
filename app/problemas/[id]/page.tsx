'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useProblem } from '@/hooks/useProblems';
import { useProblemStore } from '@/store/useProblemStore';
import { CodeBlock } from '@/components/CodeBlock';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  DIFICULTAD_LABEL, DIFICULTAD_COLOR, TEMA_COLOR, TEMA_TO_LESSON_ID,
} from '@/types/problems';
import { cn } from '@/lib/cn';
import {
  ArrowLeft, Lightbulb, Eye, EyeOff, CheckCircle2, ChevronDown,
  Zap, BookOpen, AlertTriangle, Target, Code2, ArrowRight,
  List,
} from 'lucide-react';

function Section({ title, icon, children, defaultOpen = true }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card padding="none" className="overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
      >
        <span className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-sm">
          {icon}
          {title}
        </span>
        <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-700 pt-3">
          {children}
        </div>
      )}
    </Card>
  );
}

export default function ProblemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { problem, loading, error } = useProblem(id);
  const { progress, markAttempted, markSolved, markSawSolution } = useProblemStore();

  const [visibleHints,   setVisibleHints]   = useState(0);
  const [showSolution,   setShowSolution]   = useState(false);
  const [showTemplate,   setShowTemplate]   = useState(false);
  const [solConfirmed,   setSolConfirmed]   = useState(false);

  const prog       = progress[id] ?? { status: 'unseen', intentos: 0, vistaSolucion: false, lastSeen: 0 };
  const lessonId   = problem ? TEMA_TO_LESSON_ID[problem.tema] : null;
  const gradColor  = problem ? (TEMA_COLOR[problem.tema] ?? 'from-slate-400 to-slate-500') : '';
  const difColor   = problem ? (DIFICULTAD_COLOR[problem.dificultad] ?? '') : '';

  function handleShowNextHint() {
    if (!problem) return;
    const next = visibleHints + 1;
    setVisibleHints(next);
    markAttempted(id);
  }

  function handleShowSolution() {
    if (!solConfirmed) {
      setSolConfirmed(true);
      return;
    }
    setShowSolution(true);
    markSawSolution(id);
  }

  function handleMarkSolved() {
    markSolved(id);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Card className="text-center py-12">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400">
            {error ?? 'Problema no encontrado.'}
          </p>
          <Link href="/problemas" className="mt-4 inline-block text-primary-600 text-sm font-medium hover:underline">
            ← Volver a la lista
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/problemas" className="hover:text-primary-600 transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Problemas
        </Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 font-medium truncate">{problem.id}</span>
      </div>

      {/* Hero card */}
      <Card padding="none" className="overflow-hidden">
        <div className={cn('h-2 bg-gradient-to-r', gradColor)} />
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="default">{problem.tema}</Badge>
            <Badge variant="default" className="opacity-75">{problem.subtipo}</Badge>
            <span className={cn('inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full', difColor)}>
              {'★'.repeat(problem.dificultad)} {DIFICULTAD_LABEL[problem.dificultad]}
            </span>
            {prog.status === 'solved' && (
              <Badge variant="success" className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Resuelto
              </Badge>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {problem.tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {tag}
              </span>
            ))}
          </div>

          {/* Enunciado */}
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
            {problem.enunciado}
          </p>
        </div>
      </Card>

      {/* I/O + Restricciones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card padding="md" className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Entrada</h3>
          <p className="text-sm text-slate-700 dark:text-slate-300">{problem.entrada}</p>
          {problem.restricciones && problem.restricciones !== 'No especificadas' && (
            <>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider pt-1">Restricciones</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300">{problem.restricciones}</p>
            </>
          )}
        </Card>
        <Card padding="md" className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Salida</h3>
          <p className="text-sm text-slate-700 dark:text-slate-300">{problem.salida}</p>
        </Card>
      </div>

      {/* Ejemplo */}
      {(problem.ejemplo.input || problem.ejemplo.output) && (
        <Card padding="md">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Ejemplo</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {problem.ejemplo.input && (
              <div>
                <span className="text-xs font-medium text-slate-400">Input:</span>
                <pre className="mt-1 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 font-mono overflow-x-auto">
                  {problem.ejemplo.input}
                </pre>
              </div>
            )}
            {problem.ejemplo.output && (
              <div>
                <span className="text-xs font-medium text-slate-400">Output:</span>
                <pre className="mt-1 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 font-mono overflow-x-auto">
                  {problem.ejemplo.output}
                </pre>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Cómo reconocerlo + idea clave */}
      <Section title="Cómo reconocer este problema" icon={<Target className="w-4 h-4 text-primary-500" />}>
        <div className="space-y-3">
          <div className="flex gap-3 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20">
            <Target className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
            <p className="text-sm text-primary-800 dark:text-primary-200">{problem.como_reconocerlo}</p>
          </div>
          <div className="flex gap-3 p-3 rounded-lg bg-violet-50 dark:bg-violet-900/20">
            <Lightbulb className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 mb-1">Idea clave</p>
              <p className="text-sm text-violet-800 dark:text-violet-200">{problem.idea_clave}</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Estrategia */}
      <Section title="Estrategia de resolución" icon={<List className="w-4 h-4 text-emerald-500" />}>
        <ol className="space-y-2">
          {problem.estrategia.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </Section>

      {/* Plantilla de código */}
      <Section title="Plantilla (sin solución)" icon={<Code2 className="w-4 h-4 text-blue-500" />} defaultOpen={false}>
        <p className="text-xs text-slate-500 mb-2">Esqueleto para guiarte sin ver la solución completa.</p>
        <CodeBlock code={problem.plantilla_codigo} />
      </Section>

      {/* Pistas progresivas */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            Pistas ({visibleHints}/{problem.pistas.length})
          </h3>
          {visibleHints < problem.pistas.length && (
            <button
              onClick={handleShowNextHint}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              Ver pista {visibleHints + 1}
            </button>
          )}
        </div>

        {visibleHints === 0 ? (
          <div className="text-center py-4 text-slate-400 text-sm">
            <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-30" />
            Intenta resolver el problema antes de ver las pistas.
          </div>
        ) : (
          <div className="space-y-2">
            {problem.pistas.slice(0, visibleHints).map((hint, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <span className="flex-shrink-0 text-xs font-bold text-yellow-600 dark:text-yellow-400 w-5 h-5 rounded-full bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-sm text-yellow-900 dark:text-yellow-200">{hint}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Solución */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-slate-500" />
            Solución
          </h3>
          {!showSolution && (
            <button
              onClick={handleShowSolution}
              className={cn(
                'text-xs font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors',
                solConfirmed
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300',
              )}
            >
              {solConfirmed ? (
                <><AlertTriangle className="w-3.5 h-3.5" /> Confirmar: ver solución</>
              ) : (
                <><EyeOff className="w-3.5 h-3.5" /> Ver solución</>
              )}
            </button>
          )}
        </div>

        {!showSolution ? (
          <div className="text-center py-4 text-slate-400 text-sm">
            {solConfirmed
              ? 'Haz clic en "Confirmar" para revelar la solución completa.'
              : 'Intenta resolverlo primero. La solución siempre estará aquí.'}
          </div>
        ) : (
          <div className="space-y-4">
            {problem.solucion_codigo && (
              <CodeBlock code={problem.solucion_codigo} />
            )}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Explicación</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{problem.explicacion}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Errores comunes */}
      {problem.errores_comunes.length > 0 && (
        <Section title="Errores comunes" icon={<AlertTriangle className="w-4 h-4 text-red-400" />} defaultOpen={false}>
          <ul className="space-y-2">
            {problem.errores_comunes.map((err, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                {err}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Action bar */}
      <Card padding="md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {prog.status !== 'solved' && (
              <Button onClick={handleMarkSolved} variant="primary" size="sm" className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Marcar como resuelto
              </Button>
            )}
            <Link href={`/problemas/${id}/entrenamiento`}>
              <Button variant="secondary" size="sm" className="flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                Modo entrenamiento
              </Button>
            </Link>
          </div>

          <div className="flex gap-2">
            {lessonId && (
              <Link href={`/formacion/${lessonId}`}>
                <Button variant="ghost" size="sm" className="flex items-center gap-1.5 text-xs">
                  <BookOpen className="w-3.5 h-3.5" />
                  Ver teoría (Tema {lessonId})
                </Button>
              </Link>
            )}
            <Link href="/problemas">
              <Button variant="ghost" size="sm" className="flex items-center gap-1.5 text-xs">
                <ArrowRight className="w-3.5 h-3.5" />
                Siguiente problema
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
