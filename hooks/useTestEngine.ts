'use client';

import { useReducer, useCallback, useEffect, useRef } from 'react';
import type { Question, ExamConfig, QuizState } from '@/types';
import { isAnswerCorrect } from '@/lib/questions';

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'START';         questions: Question[]; config: ExamConfig }
  | { type: 'TOGGLE_OPTION'; option: string }
  | { type: 'CONFIRM_ANSWER' }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREV_QUESTION' }
  | { type: 'GOTO';          index: number }
  | { type: 'FINISH' }
  | { type: 'TIMER_EXPIRE' };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function initialState(): QuizState {
  return {
    phase:             'active',
    questions:         [],
    currentIndex:      0,
    pendingSelection:  [],
    answers:           {},
    sessionStartTime:  0,
    questionStartTime: 0,
    questionTimes:     {},
    config:            { numPreguntas: 10, temas: [], timerEnabled: false, timerMinutes: 10, modo: 'exam' },
    timerExpired:      false,
  };
}

function recordTime(state: QuizState): QuizState {
  const q     = state.questions[state.currentIndex];
  if (!q) return state;
  const spent = Date.now() - state.questionStartTime;
  return {
    ...state,
    questionTimes: { ...state.questionTimes, [q.id]: (state.questionTimes[q.id] ?? 0) + spent },
  };
}

function reducer(state: QuizState, action: Action): QuizState {
  switch (action.type) {
    case 'START': {
      const now = Date.now();
      return {
        ...initialState(),
        questions:         action.questions,
        config:            action.config,
        sessionStartTime:  now,
        questionStartTime: now,
      };
    }

    case 'TOGGLE_OPTION': {
      const q       = state.questions[state.currentIndex];
      const isMulti = q?.correcta.length > 1;
      const { option } = action;
      const pending = isMulti
        ? state.pendingSelection.includes(option)
          ? state.pendingSelection.filter(o => o !== option)
          : [...state.pendingSelection, option]
        : [option];
      return { ...state, pendingSelection: pending };
    }

    case 'CONFIRM_ANSWER': {
      const q         = state.questions[state.currentIndex];
      const withTime  = recordTime(state);
      const answers   = { ...state.answers, [q.id]: state.pendingSelection };

      if (state.config.modo === 'exam') {
        const next     = state.currentIndex + 1;
        const nextQ    = state.questions[next];
        return {
          ...withTime,
          answers,
          currentIndex:      Math.min(next, state.questions.length - 1),
          pendingSelection:  nextQ ? (answers[nextQ.id] ?? []) : [],
          questionStartTime: Date.now(),
        };
      }

      // Immediate feedback modes → show feedback phase
      return { ...withTime, phase: 'feedback', answers };
    }

    case 'NEXT_QUESTION': {
      const next = state.currentIndex + 1;
      if (next >= state.questions.length) return { ...state, phase: 'result' };
      const nextQ = state.questions[next];
      return {
        ...recordTime(state),
        phase:             'active',
        currentIndex:      next,
        pendingSelection:  state.answers[nextQ.id] ?? [],
        questionStartTime: Date.now(),
      };
    }

    case 'PREV_QUESTION': {
      if (state.currentIndex === 0) return state;
      const prev  = state.currentIndex - 1;
      const prevQ = state.questions[prev];
      return {
        ...recordTime(state),
        phase:             'active',
        currentIndex:      prev,
        pendingSelection:  state.answers[prevQ.id] ?? [],
        questionStartTime: Date.now(),
      };
    }

    case 'GOTO': {
      if (action.index < 0 || action.index >= state.questions.length) return state;
      const targetQ = state.questions[action.index];
      return {
        ...recordTime(state),
        phase:             'active',
        currentIndex:      action.index,
        pendingSelection:  state.answers[targetQ.id] ?? [],
        questionStartTime: Date.now(),
      };
    }

    case 'FINISH':
      return { ...recordTime(state), phase: 'result' };

    case 'TIMER_EXPIRE':
      return { ...state, timerExpired: true, phase: 'result' };

    default:
      return state;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface TestEngine {
  state:            QuizState;
  currentQuestion:  Question | null;
  isLastQuestion:   boolean;
  isFirstQuestion:  boolean;
  answeredCount:    number;
  correctCount:     number;
  start:            (questions: Question[], config: ExamConfig) => void;
  toggleOption:     (option: string) => void;
  confirmAnswer:    () => void;
  nextQuestion:     () => void;
  prevQuestion:     () => void;
  goTo:             (index: number) => void;
  finish:           () => void;
  hasAnswered:      (questionId: string) => boolean;
  isCorrect:        (questionId: string) => boolean;
  /** Remaining seconds for countdown timer, null if timer disabled */
  remainingSeconds: number | null;
}

export function useTestEngine(): TestEngine {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const timerRef          = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown timer — only tracks expiry, display handled by StudySession
  useEffect(() => {
    if (!state.config.timerEnabled || state.phase === 'result' || state.sessionStartTime === 0) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }
    timerRef.current = setInterval(() => {
      const elapsed    = Math.floor((Date.now() - state.sessionStartTime) / 1000);
      const remaining  = state.config.timerMinutes * 60 - elapsed;
      if (remaining <= 0) {
        dispatch({ type: 'TIMER_EXPIRE' });
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      }
    }, 500);
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, [state.config.timerEnabled, state.config.timerMinutes, state.sessionStartTime, state.phase]);

  const start = useCallback((questions: Question[], config: ExamConfig) => {
    dispatch({ type: 'START', questions, config });
  }, []);

  const correctCount = Object.entries(state.answers).filter(([id, sel]) => {
    const q = state.questions.find(q => q.id === id);
    return q ? isAnswerCorrect(sel, q.correcta) : false;
  }).length;

  // Compute remaining seconds synchronously from sessionStartTime (re-computed on each render)
  const remainingSeconds = state.config.timerEnabled && state.sessionStartTime > 0
    ? Math.max(0, state.config.timerMinutes * 60 - Math.floor((Date.now() - state.sessionStartTime) / 1000))
    : null;

  return {
    state,
    currentQuestion:  state.questions[state.currentIndex] ?? null,
    isLastQuestion:   state.currentIndex === state.questions.length - 1,
    isFirstQuestion:  state.currentIndex === 0,
    answeredCount:    Object.keys(state.answers).length,
    correctCount,
    start,
    remainingSeconds,
    toggleOption:  option => dispatch({ type: 'TOGGLE_OPTION', option }),
    confirmAnswer: ()     => dispatch({ type: 'CONFIRM_ANSWER' }),
    nextQuestion:  ()     => dispatch({ type: 'NEXT_QUESTION'  }),
    prevQuestion:  ()     => dispatch({ type: 'PREV_QUESTION'  }),
    goTo:          index  => dispatch({ type: 'GOTO',          index }),
    finish:        ()     => dispatch({ type: 'FINISH'         }),
    hasAnswered:   id     => id in state.answers,
    isCorrect:     id     => {
      const q = state.questions.find(q => q.id === id);
      return q ? isAnswerCorrect(state.answers[id] ?? [], q.correcta) : false;
    },
  };
}
