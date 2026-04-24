import type { Question, Progress, SessionRecord } from '@/types';
import { keyToDisplayName } from './questions';

export interface GlobalStats {
  totalQuestions:    number;
  questionsAttempted: number;
  globalAccuracy:    number;
  totalSessions:     number;
  totalTimeSeconds:  number;
  avgTimePerQuestion: number;
}

export interface TopicStats {
  topicKey:       string;
  displayName:    string;
  totalQuestions: number;
  attempted:      number;
  aciertos:       number;
  fallos:         number;
  accuracy:       number;
}

export interface FailedEntry {
  question: Question;
  fallos:   number;
  aciertos: number;
}

export interface TimelinePoint {
  date:     string;
  accuracy: number;
  sessions: number;
}

export function computeGlobalStats(
  questions: Question[],
  progress: Progress,
  sessions: SessionRecord[],
): GlobalStats {
  let totalAciertos = 0;
  let totalFallos   = 0;
  let attempted     = 0;

  for (const q of questions) {
    const p = progress[q.id];
    if (p && p.ultimaVez > 0) {
      attempted++;
      totalAciertos += p.aciertos;
      totalFallos   += p.fallos;
    }
  }

  const totalResponses = totalAciertos + totalFallos;
  const totalTime      = sessions.reduce((s, r) => s + r.tiempoSegundos, 0);
  const totalAnswered  = sessions.reduce((s, r) => s + r.totalPreguntas, 0);

  return {
    totalQuestions:     questions.length,
    questionsAttempted: attempted,
    globalAccuracy:     totalResponses > 0 ? Math.round((totalAciertos / totalResponses) * 100) : 0,
    totalSessions:      sessions.length,
    totalTimeSeconds:   totalTime,
    avgTimePerQuestion: totalAnswered > 0 ? Math.round((totalTime / totalAnswered) * 10) / 10 : 0,
  };
}

export function computeTopicStats(
  questions: Question[],
  progress: Progress,
): TopicStats[] {
  const map = new Map<string, { qs: Question[]; aciertos: number; fallos: number; attempted: number }>();

  for (const q of questions) {
    if (!map.has(q.topicKey)) map.set(q.topicKey, { qs: [], aciertos: 0, fallos: 0, attempted: 0 });
    const entry = map.get(q.topicKey)!;
    entry.qs.push(q);
    const p = progress[q.id];
    if (p && p.ultimaVez > 0) {
      entry.attempted++;
      entry.aciertos += p.aciertos;
      entry.fallos   += p.fallos;
    }
  }

  return Array.from(map.entries()).map(([topicKey, { qs, aciertos, fallos, attempted }]) => ({
    topicKey,
    displayName:    keyToDisplayName(topicKey),
    totalQuestions: qs.length,
    attempted,
    aciertos,
    fallos,
    accuracy:
      aciertos + fallos > 0 ? Math.round((aciertos / (aciertos + fallos)) * 100) : 0,
  }));
}

export function getMostFailed(
  questions: Question[],
  progress: Progress,
  limit = 10,
): FailedEntry[] {
  return questions
    .filter(q => (progress[q.id]?.fallos ?? 0) > 0)
    .map(q => ({
      question: q,
      fallos:   progress[q.id]?.fallos   ?? 0,
      aciertos: progress[q.id]?.aciertos ?? 0,
    }))
    .sort((a, b) => b.fallos - a.fallos)
    .slice(0, limit);
}

export function buildTimeline(sessions: SessionRecord[]): TimelinePoint[] {
  const map = new Map<string, { aciertos: number; total: number; sessions: number }>();

  for (const s of [...sessions].sort((a, b) => a.fecha - b.fecha)) {
    const d = new Date(s.fecha);
    const key = d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    const existing = map.get(key) ?? { aciertos: 0, total: 0, sessions: 0 };
    map.set(key, {
      aciertos: existing.aciertos + s.aciertos,
      total:    existing.total    + s.totalPreguntas,
      sessions: existing.sessions + 1,
    });
  }

  return Array.from(map.entries())
    .slice(-20)
    .map(([date, { aciertos, total, sessions }]) => ({
      date,
      accuracy: total > 0 ? Math.round((aciertos / total) * 100) : 0,
      sessions,
    }));
}

export function formatSeconds(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
