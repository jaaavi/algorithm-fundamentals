'use client';

import { useState, useMemo } from 'react';
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
  List, FileText, Settings2, ArrowDownToLine, ArrowUpFromLine,
  FlaskConical, Sparkles,
} from 'lucide-react';

// ─── Parser ───────────────────────────────────────────────────────────────────

interface ParsedStatement {
  title: string | null;
  description: string[];   // narrative paragraphs
  requirements: string[];  // items from "Se pide"
}

function parseEnunciado(raw: string): ParsedStatement {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  if (!lines.length) return { title: null, description: [], requirements: [] };

  // First short line not starting with a number → title
  const hasTitle = lines.length > 1 && lines[0].length < 100 && !/^\d+[.)]/.test(lines[0]);
  const title = hasTitle ? lines[0] : null;
  const body = (hasTitle ? lines.slice(1) : lines).join('\n');

  // Split on "Se pide" marker
  const sePideMatch = /\bSe pide[\s:]/i.exec(body);
  const descRaw = (sePideMatch ? body.slice(0, sePideMatch.index) : body).trim();
  const reqRaw  = sePideMatch ? body.slice(sePideMatch.index + sePideMatch[0].length).trim() : '';

  // Description paragraphs — skip stray I/O headers already covered as separate fields
  const description = descRaw
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !/^(Entrada|Salida)[\s:]?$/i.test(l));

  // Requirements: numbered items or whole block as single item
  const requirements: string[] = [];
  if (reqRaw) {
    const chunks = reqRaw.split(/(?=\d+[.)]\s)/);
    for (const chunk of chunks) {
      const m = chunk.match(/^\d+[.)]\s+([\s\S]+)/);
      if (m) {
        requirements.push(m[1].trim().replace(/\n+/g, ' '));
      } else if (chunk.trim() && requirements.length === 0) {
        requirements.push(chunk.trim().replace(/\n+/g, ' '));
      }
    }
    if (!requirements.length) {
      requirements.push(reqRaw.trim().replace(/\n+/g, ' '));
    }
  }

  return { title, description, requirements };
}

// ─── Inline variable highlighter ─────────────────────────────────────────────

// Single uppercase letter surrounded by word boundaries, excluding A (Spanish preposition)
const VAR_RE = /\b([B-Z])\b/g;

function InlineText({ text }: { text: string }) {
  const nodes = useMemo(() => {
    const result: React.ReactNode[] = [];
    let last = 0;
    VAR_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = VAR_RE.exec(text)) !== null) {
      if (m.index > last) result.push(text.slice(last, m.index));
      result.push(
        <code
          key={m.index}
          className="font-mono text-[0.82em] text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/30 rounded px-1 py-0.5 border border-violet-200/60 dark:border-violet-700/40 mx-px not-italic"
        >
          {m[1]}
        </code>,
      );
      last = m.index + m[0].length;
    }
    if (last < text.length) result.push(text.slice(last));
    return result;
  }, [text]);

  return <>{nodes}</>;
}

// ─── Collapsible section ──────────────────────────────────────────────────────

function Section({
  title, icon, children, defaultOpen = true,
}: {
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

// ─── Section header row ───────────────────────────────────────────────────────

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2 bg-slate-50/60 dark:bg-slate-800/40">
      {icon}
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProblemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { problem, loading, error } = useProblem(id);
  const { progress, markAttempted, markSolved, markSawSolution } = useProblemStore();

  const [visibleHints, setVisibleHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [solConfirmed, setSolConfirmed] = useState(false);

  const prog      = progress[id] ?? { status: 'unseen', intentos: 0, vistaSolucion: false, lastSeen: 0 };
  const lessonId  = problem ? TEMA_TO_LESSON_ID[problem.tema] : null;
  const gradColor = problem ? (TEMA_COLOR[problem.tema] ?? 'from-slate-400 to-slate-500') : '';
  const difColor  = problem ? (DIFICULTAD_COLOR[problem.dificultad] ?? '') : '';

  const parsed = useMemo(
    () => (problem ? parseEnunciado(problem.enunciado) : null),
    [problem],
  );

  function handleShowNextHint() {
    if (!problem) return;
    setVisibleHints(v => v + 1);
    markAttempted(id);
  }

  function handleShowSolution() {
    if (!solConfirmed) { setSolConfirmed(true); return; }
    setShowSolution(true);
    markSawSolution(id);
  }

  /* ── Loading / error ────────────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !problem || !parsed) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Card className="text-center py-12">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400">{error ?? 'Problema no encontrado.'}</p>
          <Link href="/problemas" className="mt-4 inline-block text-primary-600 text-sm font-medium hover:underline">
            ← Volver a la lista
          </Link>
        </Card>
      </div>
    );
  }

  const hasExample      = !!(problem.ejemplo.input || problem.ejemplo.output);
  const hasRestrictions = !!(problem.restricciones && problem.restricciones !== 'No especificadas');

  /* ── Render ─────────────────────────────────────────────────────────────── */

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4 scroll-smooth">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/problemas" className="hover:text-primary-600 transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Problemas
        </Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 font-medium truncate">{problem.id}</span>
      </div>

      {/* ── HEADER CARD ─────────────────────────────────────────────────────── */}
      <Card padding="none" className="overflow-hidden">
        <div className={cn('h-2 bg-gradient-to-r', gradColor)} />
        <div className="p-6 space-y-4">

          {/* Meta badges */}
          <div className="flex flex-wrap items-center gap-2">
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

          {/* Title */}
          {parsed.title && (
            <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
              {parsed.title}
            </h1>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {problem.tags.map(tag => (
              <span
                key={tag}
                className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Quick summary — TL;DR */}
          <div className="flex gap-3 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/40">
            <Sparkles className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary-500 dark:text-primary-400 mb-1">
                Idea clave
              </p>
              <p className="text-sm text-primary-900 dark:text-primary-100 leading-relaxed">
                {problem.idea_clave}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* ── DESCRIPCIÓN ─────────────────────────────────────────────────────── */}
      {parsed.description.length > 0 && (
        <Card padding="none" className="overflow-hidden">
          <SectionHeader icon={<FileText className="w-3.5 h-3.5 text-slate-400" />} label="Descripción" />
          <div className="px-6 py-5 space-y-4">
            {parsed.description.map((para, i) => (
              <p
                key={i}
                className="text-[15px] text-slate-700 dark:text-slate-300 leading-[1.8] tracking-[0.01em]"
              >
                <InlineText text={para} />
              </p>
            ))}
          </div>
        </Card>
      )}

      {/* ── SE PIDE ─────────────────────────────────────────────────────────── */}
      {parsed.requirements.length > 0 && (
        <Card padding="none" className="overflow-hidden">
          <SectionHeader icon={<Settings2 className="w-3.5 h-3.5 text-orange-400" />} label="Se pide" />
          <div className="px-6 py-5 space-y-4">
            {parsed.requirements.map((req, i) => (
              <div key={i} className="flex gap-4">
                {parsed.requirements.length > 1 && (
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-bold flex items-center justify-center mt-0.5 shadow-sm">
                    {i + 1}
                  </span>
                )}
                <p className="text-[15px] text-slate-700 dark:text-slate-300 leading-[1.8]">
                  <InlineText text={req} />
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── ENTRADA / SALIDA ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Entrada */}
        <Card padding="none" className="overflow-hidden">
          <SectionHeader icon={<ArrowDownToLine className="w-3.5 h-3.5 text-emerald-500" />} label="Entrada" />
          <div className="px-5 py-4 space-y-4">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <InlineText text={problem.entrada} />
            </p>
            {hasRestrictions && (
              <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Restricciones
                </p>
                <p className="text-xs font-mono text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/60 rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700">
                  {problem.restricciones}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Salida */}
        <Card padding="none" className="overflow-hidden">
          <SectionHeader icon={<ArrowUpFromLine className="w-3.5 h-3.5 text-blue-500" />} label="Salida" />
          <div className="px-5 py-4">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <InlineText text={problem.salida} />
            </p>
          </div>
        </Card>
      </div>

      {/* ── EJEMPLO ─────────────────────────────────────────────────────────── */}
      {hasExample && (
        <Card padding="none" className="overflow-hidden">
          <SectionHeader icon={<FlaskConical className="w-3.5 h-3.5 text-violet-500" />} label="Ejemplo" />
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {problem.ejemplo.input && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm" />
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Input</span>
                </div>
                <pre className="text-xs bg-slate-900 text-emerald-300 rounded-xl px-4 py-3.5 font-mono overflow-x-auto leading-relaxed border border-slate-700/80 shadow-inner">
                  {problem.ejemplo.input}
                </pre>
              </div>
            )}
            {problem.ejemplo.output && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 shadow-sm" />
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Output</span>
                </div>
                <pre className="text-xs bg-slate-900 text-blue-300 rounded-xl px-4 py-3.5 font-mono overflow-x-auto leading-relaxed border border-slate-700/80 shadow-inner">
                  {problem.ejemplo.output}
                </pre>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ── CÓMO RECONOCERLO ───────────────────────────────────────────────── */}
      <Section
        title="Cómo reconocer este problema"
        icon={<Target className="w-4 h-4 text-primary-500" />}
      >
        <div className="flex gap-3 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/40">
          <Target className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
          <p className="text-sm text-primary-900 dark:text-primary-100 leading-relaxed">
            {problem.como_reconocerlo}
          </p>
        </div>
      </Section>

      {/* ── ESTRATEGIA ──────────────────────────────────────────────────────── */}
      <Section
        title="Estrategia de resolución"
        icon={<List className="w-4 h-4 text-emerald-500" />}
      >
        <ol className="space-y-3">
          {problem.estrategia.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center shadow-sm">
                {i + 1}
              </span>
              <span className="leading-relaxed pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </Section>

      {/* ── PLANTILLA ───────────────────────────────────────────────────────── */}
      <Section
        title="Plantilla (sin solución)"
        icon={<Code2 className="w-4 h-4 text-blue-500" />}
        defaultOpen={false}
      >
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
          Esqueleto para guiarte sin ver la solución completa.
        </p>
        <CodeBlock code={problem.plantilla_codigo} />
      </Section>

      {/* ── PISTAS ──────────────────────────────────────────────────────────── */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            Pistas ({visibleHints}/{problem.pistas.length})
          </h3>
          {visibleHints < problem.pistas.length && (
            <button
              onClick={handleShowNextHint}
              className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium flex items-center gap-1 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              Ver pista {visibleHints + 1}
            </button>
          )}
        </div>
        {visibleHints === 0 ? (
          <div className="text-center py-6 text-slate-400 text-sm">
            <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-25" />
            Intenta resolver el problema antes de ver las pistas.
          </div>
        ) : (
          <div className="space-y-2">
            {problem.pistas.slice(0, visibleHints).map((hint, i) => (
              <div
                key={i}
                className="flex gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
              >
                <span className="flex-shrink-0 text-xs font-bold text-yellow-600 dark:text-yellow-400 w-5 h-5 rounded-full bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-sm text-yellow-900 dark:text-yellow-200 leading-relaxed">{hint}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── SOLUCIÓN ────────────────────────────────────────────────────────── */}
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
                'text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors',
                solConfirmed
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300',
              )}
            >
              {solConfirmed
                ? <><AlertTriangle className="w-3.5 h-3.5" /> Confirmar: ver solución</>
                : <><EyeOff className="w-3.5 h-3.5" /> Ver solución</>}
            </button>
          )}
        </div>
        {!showSolution ? (
          <div className="text-center py-6 text-slate-400 text-sm">
            {solConfirmed
              ? 'Haz clic en "Confirmar" para revelar la solución completa.'
              : 'Intenta resolverlo primero. La solución siempre estará aquí.'}
          </div>
        ) : (
          <div className="space-y-4">
            {problem.solucion_codigo && <CodeBlock code={problem.solucion_codigo} />}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Explicación</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{problem.explicacion}</p>
            </div>
          </div>
        )}
      </Card>

      {/* ── ERRORES COMUNES ─────────────────────────────────────────────────── */}
      {problem.errores_comunes.length > 0 && (
        <Section
          title="Errores comunes"
          icon={<AlertTriangle className="w-4 h-4 text-red-400" />}
          defaultOpen={false}
        >
          <ul className="space-y-2">
            {problem.errores_comunes.map((err, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                {err}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ── ACTION BAR ──────────────────────────────────────────────────────── */}
      <Card padding="md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {prog.status !== 'solved' && (
              <Button
                onClick={() => markSolved(id)}
                variant="primary"
                size="sm"
                className="flex items-center gap-1.5"
              >
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
