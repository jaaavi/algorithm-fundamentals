import type { Question, Topic } from '@/types';

// ─── Topic display names for normalized files ─────────────────────────────────
const NORMALIZED_DISPLAY: Record<string, string> = {
  tema1:       'Tema 1: Costes',
  tema3:       'Tema 3: Diseño de algoritmos iterativos',
  tema4:       'Tema 4: Recursión',
  tema5:       'Tema 5: Divide y vencerás',
  tema6:       'Tema 6: Vuelta atrás',
  repaso:      'Repaso Temas 1 al 5',
  repaso_eval: 'Repaso del test de evaluación',
};

// ─── Topic key helpers ─────────────────────────────────────────────────────────

/**
 * Extracts a stable topic key from a filename.
 * Works with both normalized names (tema1.json) and legacy names (Tema 1_ Costes_0.json).
 */
export function getTopicKey(filename: string): string {
  const base = filename.replace(/\.json$/, '');
  // Normalized file: tema1, tema3, tema4, tema5, tema6, repaso, repaso_eval
  if (/^(tema\d+|repaso(_eval)?)$/.test(base)) return base;
  // Legacy file: strip trailing _N suffix
  return base.replace(/_\d+$/, '');
}

/** Converts a topic key to a human-readable display name. */
export function keyToDisplayName(key: string): string {
  if (key in NORMALIZED_DISPLAY) return NORMALIZED_DISPLAY[key];
  // Fallback for legacy keys: "Tema 1_ Costes" → "Tema 1: Costes"
  return key.replace(/_ /g, ': ');
}

// ─── Answer helpers ────────────────────────────────────────────────────────────

export function parseCorrectAnswer(correcta: string): string[] {
  return correcta.split(',').map(s => s.trim()).filter(Boolean);
}

export function isAnswerCorrect(selected: string[], correcta: string[]): boolean {
  if (selected.length !== correcta.length) return false;
  const ss = [...selected].sort().join(',');
  const sc = [...correcta].sort().join(',');
  return ss === sc;
}

export function isMultiSelect(correcta: string[]): boolean {
  return correcta.length > 1;
}

// ─── Filtering & shuffling ─────────────────────────────────────────────────────

export function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function filterByTopics(questions: Question[], topicKeys: string[]): Question[] {
  if (topicKeys.length === 0) return questions;
  return questions.filter(q => topicKeys.includes(q.topicKey));
}

export function filterFailed(questions: Question[], progress: Record<string, { fallos: number }>): Question[] {
  return questions.filter(q => (progress[q.id]?.fallos ?? 0) > 0);
}

export function selectQuestions(
  questions: Question[],
  count: number,
  shuffle = true,
): Question[] {
  const pool = shuffle ? shuffleArray(questions) : [...questions];
  return pool.slice(0, Math.min(count, pool.length));
}

// ─── Topic list ────────────────────────────────────────────────────────────────

export function buildTopicList(questions: Question[]): Topic[] {
  const map = new Map<string, number>();
  for (const q of questions) {
    map.set(q.topicKey, (map.get(q.topicKey) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([key, count]) => ({
    key,
    displayName: keyToDisplayName(key),
    questionCount: count,
  }));
}
