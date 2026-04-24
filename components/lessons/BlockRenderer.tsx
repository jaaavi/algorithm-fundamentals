'use client';

import type { ContentBlock, AlertLevel } from '@/types/lessons';
import { CodeBlock } from '@/components/CodeBlock';
import { FormattedText } from '@/components/FormattedText';
import { cn } from '@/lib/cn';
import {
  Lightbulb, AlertTriangle, Info, CheckCircle, XCircle,
  ArrowRight, BookOpen,
} from 'lucide-react';

// ─── Alert / tip block ────────────────────────────────────────────────────────

const ALERT_STYLES: Record<AlertLevel, { bg: string; border: string; icon: React.ReactNode; titleColor: string }> = {
  info:    { bg: 'bg-blue-50 dark:bg-blue-900/20',   border: 'border-blue-200 dark:border-blue-800',   icon: <Info         className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />, titleColor: 'text-blue-700 dark:text-blue-300' },
  warning: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />, titleColor: 'text-amber-700 dark:text-amber-300' },
  tip:     { bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-200 dark:border-violet-800', icon: <Lightbulb className="w-4 h-4 text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5" />, titleColor: 'text-violet-700 dark:text-violet-300' },
  danger:  { bg: 'bg-red-50 dark:bg-red-900/20',     border: 'border-red-200 dark:border-red-800',     icon: <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />, titleColor: 'text-red-700 dark:text-red-300' },
  success: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', icon: <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />, titleColor: 'text-emerald-700 dark:text-emerald-300' },
};

// ─── Individual block renderers ────────────────────────────────────────────────

function TextoBlock({ contenido }: { contenido: string }) {
  return (
    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
      <FormattedText text={contenido} inline />
    </p>
  );
}

function SubtituloBlock({ contenido, nivel = 3 }: { contenido: string; nivel?: number }) {
  const Tag = `h${nivel}` as keyof JSX.IntrinsicElements;
  return (
    <Tag className={cn(
      'font-semibold text-slate-800 dark:text-slate-100',
      nivel === 2 ? 'text-xl mt-4' : 'text-base mt-3',
    )}>
      {contenido}
    </Tag>
  );
}

function AlertaBlock({ nivel, titulo, contenido }: { nivel: AlertLevel; titulo?: string; contenido: string }) {
  const s = ALERT_STYLES[nivel];
  return (
    <div className={cn('rounded-xl border p-4', s.bg, s.border)}>
      <div className="flex items-start gap-3">
        {s.icon}
        <div className="flex-1">
          {titulo && <p className={cn('text-xs font-bold uppercase tracking-wider mb-1', s.titleColor)}>{titulo}</p>}
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{contenido}</p>
        </div>
      </div>
    </div>
  );
}

function ListaBlock({ items, numerada }: { items: string[]; numerada?: boolean }) {
  const Tag = numerada ? 'ol' : 'ul';
  return (
    <Tag className={cn('space-y-1.5', numerada ? 'list-decimal list-inside' : 'list-none')}>
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
          {!numerada && <span className="text-primary-500 mt-1 flex-shrink-0">▸</span>}
          {numerada && <span className="font-semibold text-slate-500 mr-1 flex-shrink-0">{i + 1}.</span>}
          <span className="leading-relaxed"><FormattedText text={item} inline /></span>
        </li>
      ))}
    </Tag>
  );
}

function TablaBlock({ cabeceras, filas }: { cabeceras: string[]; filas: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="w-full text-sm">
        <thead className="bg-slate-100 dark:bg-slate-700">
          <tr>
            {cabeceras.map((h, i) => (
              <th key={i} className="px-4 py-2.5 text-left font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
          {filas.map((fila, i) => (
            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              {fila.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 text-slate-600 dark:text-slate-300 leading-snug">
                  <FormattedText text={cell} inline />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FormulaBlock({ contenido, explicacion }: { contenido: string; explicacion?: string }) {
  return (
    <div className="my-2">
      <div className="font-mono text-sm bg-slate-900 text-amber-300 rounded-xl px-5 py-4 overflow-x-auto border border-slate-700">
        {contenido}
      </div>
      {explicacion && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic ml-1">{explicacion}</p>
      )}
    </div>
  );
}

function ComparacionBlock({
  lado1, lado2,
}: { lado1: { titulo: string; items: string[] }; lado2: { titulo: string; items: string[] } }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[lado1, lado2].map((lado, i) => (
        <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">{lado.titulo}</h4>
          <ul className="space-y-1.5">
            {lado.items.map((item, j) => (
              <li key={j} className="flex items-start gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                <span className="text-slate-400 flex-shrink-0 mt-0.5">•</span>
                <span><FormattedText text={item} inline /></span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function ErrorFrecuenteBlock({ titulo, malo, bien, explicacion }: { titulo: string; malo: string; bien: string; explicacion: string }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700">
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{titulo}</h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-700">
        <div className="bg-red-50 dark:bg-red-900/20 p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-red-700 dark:text-red-300 mb-1.5">
            <XCircle className="w-3.5 h-3.5" /> Incorrecto
          </div>
          <code className="font-mono text-xs text-red-800 dark:text-red-200 break-all">{malo}</code>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1.5">
            <CheckCircle className="w-3.5 h-3.5" /> Correcto
          </div>
          <code className="font-mono text-xs text-emerald-800 dark:text-emerald-200 break-all">{bien}</code>
        </div>
      </div>
      <div className="px-4 py-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-600 dark:text-slate-400">{explicacion}</p>
      </div>
    </div>
  );
}

function EjemploBlock({ titulo, bloques }: { titulo: string; bloques: ContentBlock[] }) {
  return (
    <div className="rounded-xl border border-primary-200 dark:border-primary-800 overflow-hidden">
      <div className="bg-primary-50 dark:bg-primary-900/30 px-4 py-2.5 border-b border-primary-200 dark:border-primary-800 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-primary-600" />
        <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">{titulo}</span>
      </div>
      <div className="bg-white dark:bg-slate-800 p-4 space-y-4">
        {bloques.map((b, i) => <Block key={i} block={b} />)}
      </div>
    </div>
  );
}

// ─── Main dispatcher ───────────────────────────────────────────────────────────

export function Block({ block }: { block: ContentBlock }) {
  switch (block.tipo) {
    case 'texto':          return <TextoBlock contenido={block.contenido} />;
    case 'subtitulo':      return <SubtituloBlock contenido={block.contenido} nivel={block.nivel} />;
    case 'alerta':         return <AlertaBlock nivel={block.nivel} titulo={block.titulo} contenido={block.contenido} />;
    case 'codigo':         return (
      <div>
        <CodeBlock code={block.contenido} pretty />
        {block.explicacion && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 italic px-1">💡 {block.explicacion}</p>
        )}
      </div>
    );
    case 'lista':          return <ListaBlock items={block.items} />;
    case 'lista-numerada': return <ListaBlock items={block.items} numerada />;
    case 'tabla':          return <TablaBlock cabeceras={block.cabeceras} filas={block.filas} />;
    case 'formula':        return <FormulaBlock contenido={block.contenido} explicacion={block.explicacion} />;
    case 'comparacion':    return <ComparacionBlock lado1={block.lado1} lado2={block.lado2} />;
    case 'tip':            return <AlertaBlock nivel="tip" titulo={block.titulo} contenido={block.contenido} />;
    case 'error-frecuente': return <ErrorFrecuenteBlock titulo={block.titulo} malo={block.malo} bien={block.bien} explicacion={block.explicacion} />;
    case 'ejemplo':        return <EjemploBlock titulo={block.titulo} bloques={block.bloques} />;
    default:               return null;
  }
}
