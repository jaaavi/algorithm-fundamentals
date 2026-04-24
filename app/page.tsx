'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuestions } from '@/hooks/useQuestions';
import { useStore } from '@/store/useStore';
import { TopicSelector } from '@/components/TopicSelector';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { StudyMode } from '@/types';
import { cn } from '@/lib/cn';
import { filterByTopics, filterFailed } from '@/lib/questions';
import {
  GraduationCap, Dumbbell, Brain, AlertCircle,
  Timer as TimerIcon, ChevronRight, BookOpen, Sparkles,
} from 'lucide-react';

interface ModeConfig {
  id:          StudyMode;
  label:       string;
  description: string;
  icon:        React.ReactNode;
  color:       string;
  badge?:      string;
}

const MODES: ModeConfig[] = [
  {
    id:          'exam',
    label:       'Modo Examen',
    description: 'Responde todas las preguntas y obtén tu nota al final. Temporizador opcional.',
    icon:        <GraduationCap className="w-6 h-6" />,
    color:       'from-blue-500 to-blue-600',
  },
  {
    id:          'training',
    label:       'Entrenamiento',
    description: 'Feedback inmediato con explicación tras cada respuesta. Ideal para aprender.',
    icon:        <Dumbbell className="w-6 h-6" />,
    color:       'from-violet-500 to-violet-600',
  },
  {
    id:          'smart-review',
    label:       'Repaso Inteligente',
    description: 'Sistema Anki: prioriza las preguntas más difíciles con repetición espaciada.',
    icon:        <Brain className="w-6 h-6" />,
    color:       'from-emerald-500 to-emerald-600',
    badge:       'Anki',
  },
  {
    id:          'failed',
    label:       'Solo Falladas',
    description: 'Repasa únicamente las preguntas que has fallado para reforzar puntos débiles.',
    icon:        <AlertCircle className="w-6 h-6" />,
    color:       'from-rose-500 to-rose-600',
  },
];

export default function HomePage() {
  const router = useRouter();
  const { questions, topics, loading, error } = useQuestions();
  const { progress } = useStore();

  const [selectedTopics, setSelectedTopics]   = useState<string[]>([]);
  const [selectedMode,   setSelectedMode]     = useState<StudyMode>('exam');
  const [numPreguntas,   setNumPreguntas]      = useState(10);
  const [timerEnabled,   setTimerEnabled]      = useState(false);
  const [timerMinutes,   setTimerMinutes]      = useState(20);

  const toggleTopic    = useCallback((key: string) => {
    setSelectedTopics(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  }, []);
  const selectAll      = useCallback(() => setSelectedTopics(topics.map(t => t.key)), [topics]);
  const deselectAll    = useCallback(() => setSelectedTopics([]), []);

  // Calculate available questions for current selection
  const filtered     = filterByTopics(questions, selectedTopics);
  const failedCount  = filterFailed(filtered, progress).length;
  const available    = selectedMode === 'failed' ? failedCount : filtered.length;
  const maxAllowed   = Math.min(available, selectedMode === 'smart-review' ? 50 : available);

  const canStart = selectedTopics.length > 0 && available > 0;

  function handleStart() {
    if (!canStart) return;
    const params = new URLSearchParams({
      topics:   selectedTopics.join(','),
      num:      String(Math.min(numPreguntas, maxAllowed)),
      timer:    String(timerEnabled),
      timerMin: String(timerMinutes),
    });
    router.push(`/${selectedMode}?${params.toString()}`);
  }

  // Global progress summary
  const totalSeen      = Object.values(progress).filter(p => p.ultimaVez > 0).length;
  const totalResponses = Object.values(progress).reduce((s, p) => s + p.aciertos + p.fallos, 0);
  const totalAciertos  = Object.values(progress).reduce((s, p) => s + p.aciertos, 0);
  const globalPct      = totalResponses > 0 ? Math.round((totalAciertos / totalResponses) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500">Cargando preguntas…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="text-center max-w-md p-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="font-semibold text-lg mb-2">Error cargando preguntas</h2>
          <p className="text-slate-500 text-sm">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Hero / stats summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary-500" />
            ¿Qué estudiamos hoy?
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            {questions.length} preguntas disponibles en {topics.length} temas
          </p>
        </div>
        {totalSeen > 0 && (
          <Card padding="sm" className="flex items-center gap-4 min-w-[220px]">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{globalPct}%</div>
              <div className="text-xs text-slate-500">acierto global</div>
            </div>
            <div className="flex-1">
              <ProgressBar value={globalPct} color={globalPct >= 70 ? 'green' : globalPct >= 40 ? 'orange' : 'red'} />
              <p className="text-xs text-slate-500 mt-1">{totalSeen} / {questions.length} vistas</p>
            </div>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topic selector */}
        <Card padding="md" className="lg:col-span-1">
          <TopicSelector
            topics={topics}
            selectedTopics={selectedTopics}
            onToggle={toggleTopic}
            onSelectAll={selectAll}
            onDeselectAll={deselectAll}
          />
        </Card>

        {/* Right column: mode + config */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mode cards */}
          <Card padding="md">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Modo de estudio
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MODES.map(mode => {
                const isSelected = selectedMode === mode.id;
                const disabled   = mode.id === 'failed' && failedCount === 0;
                return (
                  <button
                    key={mode.id}
                    onClick={() => !disabled && setSelectedMode(mode.id)}
                    disabled={disabled}
                    className={cn(
                      'relative flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-150',
                      isSelected
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800',
                      disabled && 'opacity-50 cursor-not-allowed',
                    )}
                  >
                    <div className={cn('p-2 rounded-lg bg-gradient-to-br text-white flex-shrink-0', mode.color)}>
                      {mode.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn('text-sm font-semibold', isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-slate-800 dark:text-slate-100')}>
                          {mode.label}
                        </span>
                        {mode.badge && <Badge variant="info">{mode.badge}</Badge>}
                        {mode.id === 'failed' && failedCount > 0 && <Badge variant="error">{failedCount}</Badge>}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {mode.description}
                      </p>
                    </div>
                    {isSelected && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-500" />}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Configuration */}
          <Card padding="md">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Configuración
            </h3>
            <div className="space-y-5">
              {/* Number of questions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Número de preguntas
                  </label>
                  <span className="text-sm font-semibold text-primary-600">
                    {Math.min(numPreguntas, maxAllowed)} / {available} disponibles
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={Math.max(1, maxAllowed)}
                  value={Math.min(numPreguntas, maxAllowed)}
                  onChange={e => setNumPreguntas(Number(e.target.value))}
                  disabled={available === 0}
                  className="w-full h-2 appearance-none rounded-full cursor-pointer accent-primary-600 bg-slate-200 dark:bg-slate-700"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>1</span>
                  <span className="text-center">
                    {[5,10,15,20,25,50].filter(n => n <= maxAllowed).slice(-3).map(n =>
                      <button key={n} onClick={() => setNumPreguntas(n)} className="mx-2 hover:text-primary-600 transition-colors">{n}</button>
                    )}
                  </span>
                  <span>{maxAllowed}</span>
                </div>
              </div>

              {/* Timer (exam only) */}
              {selectedMode === 'exam' && (
                <div className="flex items-start gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <TimerIcon className="w-4 h-4 text-slate-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Temporizador
                      </label>
                      <button
                        onClick={() => setTimerEnabled(v => !v)}
                        className={cn(
                          'relative w-10 h-5 rounded-full transition-colors',
                          timerEnabled ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600',
                        )}
                      >
                        <span className={cn(
                          'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                          timerEnabled && 'translate-x-5',
                        )} />
                      </button>
                    </div>
                    {timerEnabled && (
                      <div className="mt-3 flex items-center gap-3">
                        <input
                          type="number"
                          min={1}
                          max={180}
                          value={timerMinutes}
                          onChange={e => setTimerMinutes(Math.max(1, Number(e.target.value)))}
                          className="w-20 text-center px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                        />
                        <span className="text-sm text-slate-500">minutos</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Start button */}
          <Button
            onClick={handleStart}
            disabled={!canStart}
            size="lg"
            className="w-full"
          >
            {canStart
              ? <>Comenzar <ChevronRight className="w-5 h-5" /></>
              : selectedTopics.length === 0
                ? 'Selecciona al menos un tema'
                : 'Sin preguntas disponibles'}
          </Button>
        </div>
      </div>
    </div>
  );
}
