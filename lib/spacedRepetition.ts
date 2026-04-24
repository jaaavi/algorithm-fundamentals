import type { QuestionProgress, Question, Progress } from '@/types';

// Intervals in days for each ease level 0-6
const INTERVALS: number[] = [0, 1, 3, 7, 14, 30, 60];
const MAX_EASE = INTERVALS.length - 1;

export function defaultProgress(): QuestionProgress {
  return {
    aciertos: 0,
    fallos: 0,
    ultimaVez: 0,
    nivelEase: 0,
    proximaRevision: 0,
    favorita: false,
  };
}

export function applyAnswer(
  progress: QuestionProgress,
  correct: boolean,
): QuestionProgress {
  const now = Date.now();
  const nivelEase = correct
    ? Math.min(progress.nivelEase + 1, MAX_EASE)
    : Math.max(progress.nivelEase - 2, 0);

  const intervalMs = INTERVALS[nivelEase] * 24 * 60 * 60 * 1000;

  return {
    ...progress,
    aciertos:        progress.aciertos + (correct ? 1 : 0),
    fallos:          progress.fallos   + (correct ? 0 : 1),
    ultimaVez:       now,
    nivelEase,
    proximaRevision: now + intervalMs,
  };
}

/**
 * Returns a score where higher = more urgent to review.
 * New/never-seen questions → Infinity (always top priority).
 */
export function reviewPriority(progress: QuestionProgress | undefined): number {
  if (!progress || progress.ultimaVez === 0) return Infinity;
  const overdue = Date.now() - progress.proximaRevision;
  return overdue; // positive = overdue, negative = still fresh
}

/**
 * Sorts questions for smart-review:
 * - Unseen questions first
 * - Then most overdue
 * - Small shuffle to avoid same order every time
 */
export function sortForReview(questions: Question[], progressMap: Progress): Question[] {
  const unseen   = questions.filter(q => !progressMap[q.id] || progressMap[q.id].ultimaVez === 0);
  const overdue  = questions
    .filter(q => progressMap[q.id] && progressMap[q.id].ultimaVez > 0)
    .sort((a, b) => reviewPriority(progressMap[b.id]) - reviewPriority(progressMap[a.id]));

  // Shuffle within each tier separately to avoid fully deterministic ordering
  const shuffled = (arr: Question[]) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  return [...shuffled(unseen), ...overdue];
}

export function formatInterval(nivelEase: number): string {
  const days = INTERVALS[nivelEase] ?? 0;
  if (days === 0) return 'Hoy';
  if (days === 1) return '1 día';
  if (days < 30) return `${days} días`;
  return `${Math.round(days / 30)} mes(es)`;
}
