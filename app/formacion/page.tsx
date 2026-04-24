'use client';

import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { lessons } from '@/lib/lessons';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/cn';
import { BookOpen, ChevronRight, GraduationCap, Sparkles, Clock, Target } from 'lucide-react';

export default function FormacionPage() {
  const { progress } = useStore();

  function getTopicProgress(topicKey: string) {
    const entries = Object.entries(progress).filter(([id]) => id.startsWith(topicKey));
    if (entries.length === 0) return { pct: -1, attempted: 0 };
    let aciertos = 0, fallos = 0, seen = 0;
    for (const [, p] of entries) {
      if (p.ultimaVez > 0) { seen++; aciertos += p.aciertos; fallos += p.fallos; }
    }
    const total = aciertos + fallos;
    return { pct: total > 0 ? Math.round((aciertos / total) * 100) : -1, attempted: seen };
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary-500" />
          Formación
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Teoría procesada y estructurada de los 6 temas del curso — de los PDFs a lecciones claras
        </p>
      </div>

      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-violet-600 p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Aprende antes de practicar
            </h2>
            <p className="text-white/80 text-sm">
              Cada lección incluye explicaciones claras, ejemplos en C++ con syntax highlighting y conexión directa con los tests.
            </p>
          </div>
          <Link href="/" className="flex-shrink-0 bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5">
            Ir a Tests <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Lessons grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {lessons.map(lesson => {
          const { pct, attempted } = getTopicProgress(lesson.topicKey);
          return (
            <Link key={lesson.id} href={`/formacion/${lesson.id}`} className="group block">
              <Card padding="none" className="overflow-hidden hover:shadow-md transition-all duration-200 group-hover:border-primary-300 dark:group-hover:border-primary-700">
                {/* Colored top bar */}
                <div className={cn('h-2 bg-gradient-to-r', lesson.color)} />

                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 bg-gradient-to-br', lesson.color)}>
                      {lesson.icono}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge variant="default" className="text-xs">Tema {lesson.id}</Badge>
                        <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {lesson.duracion}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">{lesson.titulo}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{lesson.descripcion}</p>
                    </div>
                  </div>

                  {/* Sections preview */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {lesson.sections.slice(0, 5).map(s => (
                      <span key={s.id} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {s.icono} {s.titulo}
                      </span>
                    ))}
                    {lesson.sections.length > 5 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500">
                        +{lesson.sections.length - 5} más
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center gap-3">
                    {pct >= 0 ? (
                      <>
                        <ProgressBar
                          value={pct}
                          color={pct >= 70 ? 'green' : pct >= 40 ? 'orange' : 'red'}
                          className="flex-1"
                        />
                        <span className={cn('text-xs font-semibold flex-shrink-0', pct >= 70 ? 'text-emerald-600' : pct >= 40 ? 'text-orange-500' : 'text-red-500')}>
                          {pct}%
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Target className="w-3 h-3" /> Sin intentar en tests
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-slate-400 group-hover:text-primary-500 transition-colors">
                      <span className="text-xs font-medium">Estudiar</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
