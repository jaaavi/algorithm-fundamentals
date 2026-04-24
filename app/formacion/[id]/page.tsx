'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { getLessonById } from '@/lib/lessons';
import { Block } from '@/components/lessons/BlockRenderer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import {
  ChevronLeft, ChevronRight, BookOpen, Dumbbell,
  Brain, CheckCircle, AlertCircle, Clock, Star,
  Menu, X,
} from 'lucide-react';
import type { LessonSection, SectionTipo } from '@/types/lessons';

// ─── Section type icon ────────────────────────────────────────────────────────

const SECTION_ICONS: Record<SectionTipo, React.ReactNode> = {
  intro:    <BookOpen  className="w-4 h-4" />,
  concepto: <Brain     className="w-4 h-4" />,
  ejemplo:  <Star      className="w-4 h-4" />,
  errores:  <AlertCircle className="w-4 h-4" />,
  resumen:  <CheckCircle className="w-4 h-4" />,
  tests:    <Dumbbell  className="w-4 h-4" />,
};

const SECTION_COLORS: Record<SectionTipo, string> = {
  intro:    'text-primary-600 dark:text-primary-400',
  concepto: 'text-violet-600 dark:text-violet-400',
  ejemplo:  'text-amber-600 dark:text-amber-400',
  errores:  'text-red-600 dark:text-red-400',
  resumen:  'text-emerald-600 dark:text-emerald-400',
  tests:    'text-rose-600 dark:text-rose-400',
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function SectionNav({
  sections,
  activeId,
  onSelect,
}: {
  sections: LessonSection[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <nav className="space-y-1">
      {sections.map((s, i) => (
        <button
          key={s.id}
          onClick={() => onSelect(s.id)}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-all duration-100',
            activeId === s.id
              ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-medium'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700',
          )}
        >
          <span className={cn('flex-shrink-0', activeId === s.id ? 'text-primary-500' : 'text-slate-400')}>
            {s.icono ?? SECTION_ICONS[s.tipo]}
          </span>
          <span className="truncate">{s.titulo}</span>
        </button>
      ))}
    </nav>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LessonPage() {
  const params    = useParams();
  const router    = useRouter();
  const { progress } = useStore();
  const lessonId  = Number(params.id);
  const lesson    = getLessonById(lessonId);

  const [activeSection, setActiveSection] = useState<string>('');
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement>>({});

  useEffect(() => {
    if (lesson?.sections.length) {
      setActiveSection(lesson.sections[0].id);
    }
  }, [lesson]);

  // Intersection observer to highlight current section in sidebar
  useEffect(() => {
    if (!lesson) return;
    const observers: IntersectionObserver[] = [];
    for (const section of lesson.sections) {
      const el = sectionRefs.current[section.id];
      if (!el) continue;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(section.id); },
        { rootMargin: '-20% 0px -70% 0px' },
      );
      obs.observe(el);
      observers.push(obs);
    }
    return () => observers.forEach(o => o.disconnect());
  }, [lesson]);

  if (!lesson) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Lección no encontrada.</p>
      </div>
    );
  }

  function scrollToSection(id: string) {
    const el = sectionRefs.current[id];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(id);
    setSidebarOpen(false);
  }

  const currentIdx  = lesson.sections.findIndex(s => s.id === activeSection);
  const prevSection = lesson.sections[currentIdx - 1];
  const nextSection = lesson.sections[currentIdx + 1];

  // Topic progress
  const topicEntries = Object.entries(progress).filter(([id]) => id.startsWith(lesson.topicKey));
  const totalAciertos = topicEntries.reduce((s, [,p]) => s + p.aciertos, 0);
  const totalFallos   = topicEntries.reduce((s, [,p]) => s + p.fallos, 0);
  const pct           = totalAciertos + totalFallos > 0 ? Math.round((totalAciertos / (totalAciertos + totalFallos)) * 100) : -1;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-14 left-0 h-[calc(100vh-3.5rem)] w-64 z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 lg:sticky lg:top-14 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      )}>
        {/* Sidebar header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <button onClick={() => router.push('/formacion')} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-3 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" /> Todos los temas
          </button>
          <div className="flex items-center gap-2">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0 bg-gradient-to-br', lesson.color)}>
              {lesson.icono}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Tema {lesson.id}</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{lesson.titulo}</p>
            </div>
          </div>
          {pct >= 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className={cn('h-full rounded-full transition-all', pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-orange-400' : 'bg-red-500')} style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-slate-500">{pct}%</span>
            </div>
          )}
        </div>

        {/* Sections list */}
        <div className="flex-1 overflow-y-auto p-3">
          <SectionNav sections={lesson.sections} activeId={activeSection} onSelect={scrollToSection} />
        </div>

        {/* Practice button */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <Button
            size="sm"
            className="w-full"
            onClick={() => router.push(`/?preselect=${lesson.topicKey}`)}
          >
            <Dumbbell className="w-4 h-4" /> Practicar este tema
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-14 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium truncate">{lesson.titulo}</span>
          <Badge variant="default" className="ml-auto text-xs flex-shrink-0">Tema {lesson.id}</Badge>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8 space-y-12">
          {/* Lesson hero */}
          <div className={cn('rounded-2xl p-6 bg-gradient-to-br text-white', lesson.color)}>
            <div className="text-4xl mb-3">{lesson.icono}</div>
            <Badge className="bg-white/20 text-white border-0 mb-3">Tema {lesson.id}</Badge>
            <h1 className="text-2xl font-bold mb-1">{lesson.titulo}</h1>
            <p className="text-white/80 text-sm">{lesson.subtitulo}</p>
            <div className="flex items-center gap-4 mt-4 text-sm text-white/70">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{lesson.duracion}</span>
              <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{lesson.sections.length} secciones</span>
            </div>
          </div>

          {/* Sections */}
          {lesson.sections.map((section, idx) => (
            <section
              key={section.id}
              ref={el => { if (el) sectionRefs.current[section.id] = el; }}
              id={`section-${section.id}`}
              className="scroll-mt-20"
            >
              {/* Section header */}
              <div className="flex items-center gap-3 mb-5">
                <div className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                  section.tipo === 'errores'  ? 'bg-red-100 dark:bg-red-900/30' :
                  section.tipo === 'resumen'  ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                  section.tipo === 'tests'    ? 'bg-rose-100 dark:bg-rose-900/30' :
                  section.tipo === 'ejemplo'  ? 'bg-amber-100 dark:bg-amber-900/30' :
                  section.tipo === 'concepto' ? 'bg-violet-100 dark:bg-violet-900/30' :
                  'bg-primary-100 dark:bg-primary-900/30',
                )}>
                  <span className="text-xl">{section.icono}</span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                    {section.tipo === 'intro' ? 'Introducción' :
                     section.tipo === 'concepto' ? 'Concepto' :
                     section.tipo === 'ejemplo' ? 'Ejemplo' :
                     section.tipo === 'errores' ? 'Errores frecuentes' :
                     section.tipo === 'resumen' ? 'Resumen' :
                     'Conexión con tests'}
                  </p>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{section.titulo}</h2>
                </div>
              </div>

              {/* Blocks */}
              <div className="space-y-5">
                {section.bloques.map((block, i) => (
                  <Block key={i} block={block} />
                ))}
              </div>

              {/* Section divider */}
              {idx < lesson.sections.length - 1 && (
                <div className="mt-10 border-t border-slate-200 dark:border-slate-700" />
              )}
            </section>
          ))}

          {/* Bottom navigation */}
          <div className="flex justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            {prevSection ? (
              <Button variant="secondary" onClick={() => scrollToSection(prevSection.id)}>
                <ChevronLeft className="w-4 h-4" />
                <span className="truncate max-w-[150px]">{prevSection.titulo}</span>
              </Button>
            ) : (
              <Button variant="secondary" onClick={() => router.push('/formacion')}>
                <ChevronLeft className="w-4 h-4" /> Todos los temas
              </Button>
            )}

            {nextSection ? (
              <Button onClick={() => scrollToSection(nextSection.id)}>
                <span className="truncate max-w-[150px]">{nextSection.titulo}</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button variant="success" onClick={() => router.push(`/?preselect=${lesson.topicKey}`)}>
                <Dumbbell className="w-4 h-4" /> Practicar tests
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
