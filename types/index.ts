// ─── Domain types ─────────────────────────────────────────────────────────────

export interface Question {
  id: string;
  tema: string;
  pregunta: string;
  opciones: Record<string, string>;
  /** Normalized to array: "a, b" → ["a","b"] */
  correcta: string[];
  explicacion: string;
  sourceFile: string;
  topicKey: string;
}

export interface Topic {
  key: string;
  displayName: string;
  questionCount: number;
}

// ─── Progress / persistence ────────────────────────────────────────────────────

export interface QuestionProgress {
  aciertos: number;
  fallos: number;
  ultimaVez: number;        // Unix ms, 0 = never seen
  nivelEase: number;        // 0-6 for spaced repetition
  proximaRevision: number;  // Unix ms when due next
  favorita: boolean;
}

export type Progress = Record<string, QuestionProgress>;

export interface SessionRecord {
  id: string;
  fecha: number;
  modo: StudyMode;
  temas: string[];
  totalPreguntas: number;
  aciertos: number;
  fallos: number;
  tiempoSegundos: number;
  detalle: Array<{
    questionId: string;
    acertada: boolean;
    tiempoMs: number;
  }>;
}

export interface AppSettings {
  theme: 'light' | 'dark';
}

// ─── Study session ─────────────────────────────────────────────────────────────

export type StudyMode = 'exam' | 'training' | 'smart-review' | 'failed';

export interface ExamConfig {
  numPreguntas: number;
  temas: string[];
  timerEnabled: boolean;
  timerMinutes: number;
  modo: StudyMode;
}

/** Multi-select: each entry is the set of selected option letters */
export type QuizAnswers = Record<string, string[]>;

export type QuizPhase = 'active' | 'feedback' | 'result';

export interface QuizState {
  phase: QuizPhase;
  questions: Question[];
  currentIndex: number;
  /** Options selected for the current question (before confirming) */
  pendingSelection: string[];
  /** Confirmed answers: questionId → selected options */
  answers: QuizAnswers;
  sessionStartTime: number;
  questionStartTime: number;
  /** Time spent per question in ms */
  questionTimes: Record<string, number>;
  config: ExamConfig;
  timerExpired: boolean;
}
