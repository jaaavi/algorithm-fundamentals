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
import { DIFICULTAD_LABEL, DIFICULTAD_COLOR, TEMA_COLOR } from '@/types/problems';
import { cn } from '@/lib/cn';
import {
  ArrowLeft, Lightbulb, Eye, CheckCircle2, XCircle,
  Target, List, AlertTriangle, Code2, BookOpen, Zap,
} from 'lucide-react';

type TrainingPhase = 'reading' | 'solving' | 'hinting' | 'solution' | 'done';

export default function EntrenamientoPage() {
  const { id } = useParams<{ id: string }>();
  const { problem, loading, error } = useProblem(id);
  const { markAttempted, markSolved, markSawSolution } = useProblemStore();

  const [phase,        setPhase]        = useState<TrainingPhase>('reading');
  const [hintIndex,    setHintIndex]    = useState(0);
  const [selfResult,   setSelfResult]   = useState<'solved' | 'failed' | null>(null);
  const [showCode,     setShowCode]     = useState(false);

  const gradColor = problem ? (TEMA_COLOR[problem.tema] ?? 'from-slate-400 to-slate-500') : '';
  const difColor  = problem ? (DIFICULTAD_COLOR[problem.dificultad] ?? '') : '';

  function startSolving() {
    markAttempted(id);
    setPhase('solving');
  }

  function requestHint() {
    if (!problem) return;
    if (hintIndex < problem.pistas.length) {
      setHintIndex(i => i + 1);
    }
    setPhase('hinting');
  }

  function revealSolution() {
    markSawSolution(id);
    setPhase('solution');
  }

  function finishSolved() {
    markSolved(id);
    setSelfResult('solved');
    setPhase('done');
  }

  function finishFailed() {
    setSelfResult('failed');
    setPhase('done');
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
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-slate-500">{error ?? 'Problema no encontrado.'}</p>
        <Link href="/problemas" className="text-primary-600 text-sm mt-3 inline-block">← Volver</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href={`/problemas/${id}`} className="hover:text-primary-600 flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver al problema
        </Link>
        <span>/</span>
        <span className="text-slate-700 dark:text-slate-300 font-medium">Entrenamiento</span>
      </div>

      {/* Problem header */}
      <Card padding="none" className="overflow-hidden">
        <div className={cn('h-1.5 bg-gradient-to-r', gradColor)} />
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="default">{problem.tema}</Badge>
            <Badge variant="default" className="opacity-75">{problem.subtipo}</Badge>
            <span className={cn('inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full', difColor)}>
              {'★'.repeat(problem.dificultad)} {DIFICULTAD_LABEL[problem.dificultad]}
            </span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {problem.enunciado}
          </p>
        </div>
      </Card>

      {/* I/O */}
      <div className="grid grid-cols-2 gap-3">
        <Card padding="sm">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Entrada</p>
          <p className="text-xs text-slate-700 dark:text-slate-300">{problem.entrada}</p>
        </Card>
        <Card padding="sm">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Salida</p>
          <p className="text-xs text-slate-700 dark:text-slate-300">{problem.salida}</p>
        </Card>
      </div>

      {/* Ejemplo */}
      {(problem.ejemplo.input || problem.ejemplo.output) && (
        <Card padding="sm">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Ejemplo</p>
          <div className="grid grid-cols-2 gap-2">
            {problem.ejemplo.input && (
              <pre className="text-xs bg-slate-50 dark:bg-slate-800 rounded p-2 font-mono overflow-x-auto">
                {problem.ejemplo.input}
              </pre>
            )}
            {problem.ejemplo.output && (
              <pre className="text-xs bg-slate-50 dark:bg-slate-800 rounded p-2 font-mono overflow-x-auto">
                {problem.ejemplo.output}
              </pre>
            )}
          </div>
        </Card>
      )}

      {/* ── Phase: READING ── */}
      {phase === 'reading' && (
        <Card padding="md" className="text-center">
          <Zap className="w-10 h-10 text-primary-500 mx-auto mb-3" />
          <h2 className="font-bold text-slate-900 dark:text-white mb-1">¿Listo para intentarlo?</h2>
          <p className="text-sm text-slate-500 mb-5">
            Lee el enunciado, piensa la solución y luego pulsa "Comenzar". Tendrás pistas si las necesitas.
          </p>
          <Button onClick={startSolving} size="lg" className="w-full">
            Comenzar a resolver
          </Button>
        </Card>
      )}

      {/* ── Phase: SOLVING ── */}
      {phase === 'solving' && (
        <div className="space-y-3">
          {/* Idea clave box */}
          <div className="flex gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <Target className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-0.5">Patrón del problema</p>
              <p className="text-sm text-blue-800 dark:text-blue-200">{problem.como_reconocerlo}</p>
            </div>
          </div>

          <Card padding="md">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">¿Cómo te fue?</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={finishSolved} variant="primary" className="flex items-center justify-center gap-2 py-3">
                <CheckCircle2 className="w-5 h-5" />
                Lo resolví solo
              </Button>
              <Button onClick={requestHint} variant="secondary" className="flex items-center justify-center gap-2 py-3">
                <Lightbulb className="w-5 h-5" />
                Necesito una pista
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── Phase: HINTING ── */}
      {phase === 'hinting' && (
        <div className="space-y-3">
          {/* Mostrar pistas desbloqueadas */}
          <Card padding="md">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              Pistas ({hintIndex}/{problem.pistas.length})
            </h3>
            <div className="space-y-2 mb-4">
              {problem.pistas.slice(0, hintIndex).map((hint, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="text-sm text-yellow-900 dark:text-yellow-200">{hint}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button onClick={finishSolved} variant="primary" size="sm" className="flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Ya lo sé
              </Button>
              {hintIndex < problem.pistas.length && (
                <Button onClick={requestHint} variant="secondary" size="sm" className="flex items-center justify-center gap-1.5">
                  <Lightbulb className="w-4 h-4" />
                  Otra pista
                </Button>
              )}
              <Button onClick={revealSolution} variant="ghost" size="sm" className="flex items-center justify-center gap-1.5 text-orange-600 hover:bg-orange-50">
                <Eye className="w-4 h-4" />
                Ver solución
              </Button>
            </div>
          </Card>

          {/* Estrategia */}
          <Card padding="md">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <List className="w-4 h-4 text-emerald-500" />
              Estrategia
            </h3>
            <ol className="space-y-1.5">
              {problem.estrategia.map((step, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </Card>
        </div>
      )}

      {/* ── Phase: SOLUTION ── */}
      {phase === 'solution' && (
        <div className="space-y-3">
          {problem.solucion_codigo && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                <Code2 className="w-4 h-4 text-primary-500" />
                Solución completa
              </h3>
              <CodeBlock code={problem.solucion_codigo} />
            </div>
          )}

          <Card padding="md">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Explicación</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{problem.explicacion}</p>
          </Card>

          {problem.errores_comunes.length > 0 && (
            <Card padding="md">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Errores comunes
              </h3>
              <ul className="space-y-1.5">
                {problem.errores_comunes.map((err, i) => (
                  <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    {err}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={finishSolved} variant="primary" className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Lo entendí
            </Button>
            <Button onClick={finishFailed} variant="secondary" className="flex items-center justify-center gap-2">
              <XCircle className="w-4 h-4" />
              Necesito más práctica
            </Button>
          </div>
        </div>
      )}

      {/* ── Phase: DONE ── */}
      {phase === 'done' && (
        <Card padding="lg" className="text-center">
          {selfResult === 'solved' ? (
            <>
              <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                ¡Bien hecho!
              </h2>
              <p className="text-slate-500 text-sm mb-5">
                Has marcado este problema como resuelto. Vuelve para repasarlo cuando quieras.
              </p>
            </>
          ) : (
            <>
              <BookOpen className="w-14 h-14 text-orange-400 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                Sin problema, sigue practicando
              </h2>
              <p className="text-slate-500 text-sm mb-5">
                Repasa la teoría del tema y vuelve a intentarlo. La práctica repetida es la clave.
              </p>
            </>
          )}

          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/problemas">
              <Button variant="primary">
                Más problemas
              </Button>
            </Link>
            <Link href={`/problemas/${id}`}>
              <Button variant="secondary">
                Ver detalle completo
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
