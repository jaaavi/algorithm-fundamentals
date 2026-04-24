'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Question, ExamConfig, StudyMode, SessionRecord } from '@/types';
import { isAnswerCorrect, isMultiSelect } from '@/lib/questions';
import { useTestEngine } from '@/hooks/useTestEngine';
import { useStore } from '@/store/useStore';
import { AnswerOption } from './AnswerOption';
import { ExplanationBox } from './ExplanationBox';
import { QuestionNavigator } from './QuestionNavigator';
import { ProgressBar } from './ui/ProgressBar';
import { Button } from './ui/Button';
import { Timer } from './Timer';
import { Badge } from './ui/Badge';
import { cn } from '@/lib/cn';
import { ArrowLeft, ArrowRight, CheckCircle, ChevronLeft, Star, BookOpen } from 'lucide-react';
import { formatSeconds } from '@/lib/statistics';
import { FormattedText } from './FormattedText';

interface StudySessionProps {
  questions: Question[];
  config:    ExamConfig;
}

type OptionState = 'idle' | 'selected' | 'correct' | 'incorrect' | 'missed';

export function StudySession({ questions, config }: StudySessionProps) {
  const router = useRouter();
  const engine = useTestEngine();
  const { updateQuestion, addSession, toggleFavorite, progress } = useStore();
  const [elapsedTick, setElapsedTick] = useState(0);

  const isImmediate = config.modo !== 'exam'; // training / smart-review / failed

  // Start on mount
  useEffect(() => {
    engine.start(questions, config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tick for elapsed display — increments every second after session starts
  useEffect(() => {
    if (engine.state.sessionStartTime === 0) return;
    const origin = engine.state.sessionStartTime;
    const id = setInterval(() => {
      setElapsedTick(Math.floor((Date.now() - origin) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [engine.state.sessionStartTime]);

  // Persist progress when result phase reached
  useEffect(() => {
    if (engine.state.phase !== 'result') return;

    const { questions: qs, answers, sessionStartTime, questionTimes, config: cfg } = engine.state;
    const elapsed = Math.round((Date.now() - sessionStartTime) / 1000);
    let aciertos = 0;

    const detalle = qs.map(q => {
      const sel      = answers[q.id] ?? [];
      const acertada = isAnswerCorrect(sel, q.correcta);
      if (acertada) aciertos++;
      updateQuestion(q.id, acertada);
      return { questionId: q.id, acertada, tiempoMs: questionTimes[q.id] ?? 0 };
    });

    const session: SessionRecord = {
      id:             `session_${Date.now()}`,
      fecha:          Date.now(),
      modo:           cfg.modo,
      temas:          cfg.temas,
      totalPreguntas: qs.length,
      aciertos,
      fallos:         qs.length - aciertos,
      tiempoSegundos: elapsed,
      detalle,
    };
    addSession(session);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.state.phase]);

  const { state, currentQuestion, isLastQuestion, isFirstQuestion, remainingSeconds } = engine;

  if (!currentQuestion || state.questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Sin preguntas disponibles.</p>
      </div>
    );
  }

  const progress_pct = ((state.currentIndex + 1) / state.questions.length) * 100;
  const isFav        = !!progress[currentQuestion.id]?.favorita;
  const multi        = isMultiSelect(currentQuestion.correcta);
  const confirmed    = currentQuestion.id in state.answers;
  const inFeedback   = state.phase === 'feedback';

  // Determine the state of each option
  function optionState(letter: string): OptionState {
    if (!inFeedback && !confirmed) {
      return state.pendingSelection.includes(letter) ? 'selected' : 'idle';
    }
    // Show results
    const selected = state.answers[currentQuestion!.id] ?? state.pendingSelection;
    const isCorrectLetter  = currentQuestion!.correcta.includes(letter);
    const isSelectedLetter = selected.includes(letter);

    if (isSelectedLetter && isCorrectLetter)  return 'correct';
    if (isSelectedLetter && !isCorrectLetter) return 'incorrect';
    if (!isSelectedLetter && isCorrectLetter) return 'missed';
    return 'idle';
  }

  const answeredCorrectly = confirmed
    ? isAnswerCorrect(state.answers[currentQuestion.id] ?? [], currentQuestion.correcta)
    : false;

  // ── Result screen ──────────────────────────────────────────────────────────
  if (state.phase === 'result') {
    return <ResultScreen engine={engine} config={config} onBack={() => router.back()} />;
  }

  // ── Active question ────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
          <ChevronLeft className="w-4 h-4" />
          Salir
        </button>

        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">{state.currentIndex + 1}</span>
            <span> / {state.questions.length}</span>
          </span>
          {config.timerEnabled && remainingSeconds !== null && (
            <Timer seconds={remainingSeconds} isCountdown warning={120} />
          )}
          {!config.timerEnabled && state.sessionStartTime > 0 && (
            <Timer seconds={elapsedTick} isCountdown={false} />
          )}
        </div>

        <button onClick={() => toggleFavorite(currentQuestion.id)} title={isFav ? 'Quitar favorito' : 'Marcar favorito'} className={cn('p-1.5 rounded-lg transition-colors', isFav ? 'text-amber-500' : 'text-slate-400 hover:text-amber-400')}>
          <Star className={cn('w-5 h-5', isFav && 'fill-current')} />
        </button>
      </div>

      {/* Progress bar */}
      <ProgressBar value={progress_pct} color={isImmediate ? (inFeedback && confirmed ? (answeredCorrectly ? 'green' : 'red') : 'blue') : 'blue'} />

      {/* Mode badge */}
      <div className="flex items-center gap-2">
        <Badge variant="info">
          {config.modo === 'exam'         ? 'Examen'
           : config.modo === 'training'   ? 'Entrenamiento'
           : config.modo === 'smart-review' ? 'Repaso inteligente'
           : 'Solo falladas'}
        </Badge>
        {multi && <Badge variant="warning">Múltiple respuesta</Badge>}
      </div>

      {/* Question */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        <FormattedText
          text={currentQuestion.pregunta}
          className="text-base text-slate-800 dark:text-slate-100 font-medium"
        />
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {Object.entries(currentQuestion.opciones).map(([letter, text]) => (
          <AnswerOption
            key={letter}
            letter={letter}
            text={text}
            state={optionState(letter)}
            disabled={inFeedback || (config.modo === 'exam' && false) /* exam allows re-selection */}
            isMulti={multi}
            onClick={() => {
              if (!inFeedback) engine.toggleOption(letter);
            }}
          />
        ))}
      </div>

      {/* Explanation (immediate feedback modes) */}
      {inFeedback && (
        <ExplanationBox text={currentQuestion.explicacion} correct={answeredCorrectly} />
      )}

      {/* Bottom actions */}
      <div className="flex items-center justify-between pt-2">
        {config.modo === 'exam' ? (
          <>
            <Button variant="secondary" size="sm" onClick={engine.prevQuestion} disabled={isFirstQuestion}>
              <ArrowLeft className="w-4 h-4" /> Anterior
            </Button>

            <div className="hidden md:block">
              <QuestionNavigator
                questions={state.questions}
                currentIndex={state.currentIndex}
                answers={state.answers}
                onGoto={engine.goTo}
              />
            </div>

            {isLastQuestion
              ? <Button variant="success" onClick={engine.finish}>
                  <CheckCircle className="w-4 h-4" /> Finalizar
                </Button>
              : <Button onClick={engine.nextQuestion}>
                  Siguiente <ArrowRight className="w-4 h-4" />
                </Button>
            }
          </>
        ) : (
          <>
            <div /> {/* spacer */}
            {!inFeedback
              ? <Button
                  onClick={engine.confirmAnswer}
                  disabled={state.pendingSelection.length === 0}
                  size="md"
                >
                  {multi ? `Confirmar (${state.pendingSelection.length} seleccionadas)` : 'Confirmar respuesta'}
                </Button>
              : <Button onClick={isLastQuestion ? engine.finish : engine.nextQuestion} variant={answeredCorrectly ? 'success' : 'primary'}>
                  {isLastQuestion ? <><CheckCircle className="w-4 h-4" /> Ver resultados</> : <>Siguiente <ArrowRight className="w-4 h-4" /></>}
                </Button>
            }
          </>
        )}
      </div>

      {/* Navigator for non-exam modes on mobile */}
      {config.modo !== 'exam' && (
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
          <QuestionNavigator
            questions={state.questions}
            currentIndex={state.currentIndex}
            answers={state.answers}
            onGoto={() => {}}
          />
        </div>
      )}
    </div>
  );
}

// ─── Result screen ─────────────────────────────────────────────────────────────

function ResultScreen({
  engine,
  config,
  onBack,
}: {
  engine: ReturnType<typeof useTestEngine>;
  config: ExamConfig;
  onBack: () => void;
}) {
  const { state } = engine;
  const total    = state.questions.length;
  const elapsed  = Math.round((Date.now() - state.sessionStartTime) / 1000);

  let aciertos = 0;
  for (const q of state.questions) {
    const sel = state.answers[q.id] ?? [];
    if (isAnswerCorrect(sel, q.correcta)) aciertos++;
  }

  const pct  = total > 0 ? Math.round((aciertos / total) * 100) : 0;
  const nota = (pct / 10).toFixed(1);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      {/* Score card */}
      <div className={cn(
        'rounded-2xl p-8 text-center border',
        pct >= 70 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                  : pct >= 50 ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      )}>
        <div className={cn('text-7xl font-black', pct >= 70 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-500' : 'text-red-500')}>
          {nota}
        </div>
        <p className="text-slate-600 dark:text-slate-400 mt-1">sobre 10</p>
        <div className="flex justify-center gap-8 mt-6 text-sm">
          <Stat label="Correctas" value={`${aciertos}/${total}`} color="green" />
          <Stat label="Falladas"  value={`${total - aciertos}/${total}`} color="red" />
          <Stat label="Precisión" value={`${pct}%`} color={pct >= 70 ? 'green' : 'orange'} />
          <Stat label="Tiempo"    value={formatSeconds(elapsed)} color="blue" />
        </div>
      </div>

      {/* Detailed review */}
      <div className="space-y-3">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Resumen detallado
        </h2>
        {state.questions.map((q, i) => {
          const sel      = state.answers[q.id] ?? [];
          const correct  = isAnswerCorrect(sel, q.correcta);
          const expanded = expandedId === q.id;
          return (
            <div key={q.id} className={cn('rounded-xl border overflow-hidden transition-all', correct ? 'border-emerald-200 dark:border-emerald-800' : 'border-red-200 dark:border-red-800')}>
              <button
                className={cn('w-full flex items-start gap-3 p-4 text-left', correct ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20')}
                onClick={() => setExpandedId(expanded ? null : q.id)}
              >
                <span className={cn('flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold', correct ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white')}>
                  {correct ? '✓' : '✗'}
                </span>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Pregunta {i + 1}</p>
                  <FormattedText text={q.pregunta} inline className="text-sm text-slate-800 dark:text-slate-200 line-clamp-2" />
                </div>
                <span className="text-xs text-slate-400 mt-1">{expanded ? '▲' : '▼'}</span>
              </button>

              {expanded && (
                <div className="px-4 py-4 bg-white dark:bg-slate-800 space-y-3">
                  {Object.entries(q.opciones).map(([letter, text]) => {
                    const isCorrect  = q.correcta.includes(letter);
                    const isSelected = sel.includes(letter);
                    return (
                      <div key={letter} className={cn(
                        'flex items-start gap-2 p-2 rounded-lg text-sm',
                        isCorrect && isSelected  && 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200',
                        !isCorrect && isSelected && 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200',
                        isCorrect && !isSelected && 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200',
                      )}>
                        <span className="font-semibold uppercase w-4">{letter})</span>
                        <FormattedText text={text} inline />
                        {isCorrect && <span className="ml-auto">✓</span>}
                        {!isCorrect && isSelected && <span className="ml-auto">✗</span>}
                      </div>
                    );
                  })}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 font-medium mb-1">Explicación</p>
                    <FormattedText text={q.explicacion} className="text-sm text-slate-600 dark:text-slate-300" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">Volver al inicio</Button>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: 'green'|'red'|'orange'|'blue' }) {
  const c = { green: 'text-emerald-600', red: 'text-red-500', orange: 'text-orange-500', blue: 'text-primary-600' }[color];
  return (
    <div className="text-center">
      <div className={cn('text-2xl font-bold', c)}>{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}
