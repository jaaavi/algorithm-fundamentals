'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Progress, SessionRecord, AppSettings, QuestionProgress } from '@/types';
import { applyAnswer, defaultProgress } from '@/lib/spacedRepetition';

interface ProgressStore {
  // ── Persisted state ──────────────────────────────────────────────────────────
  progress: Progress;
  sessions: SessionRecord[];
  settings: AppSettings;

  // ── Actions ──────────────────────────────────────────────────────────────────
  updateQuestion:  (questionId: string, correct: boolean) => void;
  addSession:      (session: SessionRecord) => void;
  toggleFavorite:  (questionId: string) => void;
  setTheme:        (theme: 'light' | 'dark') => void;
  resetAll:        () => void;
  resetTopic:      (questionIds: string[]) => void;
  exportData:      () => string;
  importData:      (json: string) => boolean;
}

const initialSettings: AppSettings = { theme: 'light' };

export const useStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      progress: {},
      sessions: [],
      settings: initialSettings,

      updateQuestion(questionId, correct) {
        set(state => {
          const current: QuestionProgress = state.progress[questionId] ?? defaultProgress();
          return {
            progress: {
              ...state.progress,
              [questionId]: applyAnswer(current, correct),
            },
          };
        });
      },

      addSession(session) {
        set(state => ({ sessions: [...state.sessions, session] }));
      },

      toggleFavorite(questionId) {
        set(state => {
          const current: QuestionProgress = state.progress[questionId] ?? defaultProgress();
          return {
            progress: {
              ...state.progress,
              [questionId]: { ...current, favorita: !current.favorita },
            },
          };
        });
      },

      setTheme(theme) {
        set(state => ({ settings: { ...state.settings, theme } }));
      },

      resetAll() {
        set({ progress: {}, sessions: [] });
      },

      resetTopic(questionIds) {
        set(state => {
          const next = { ...state.progress };
          for (const id of questionIds) delete next[id];
          return { progress: next };
        });
      },

      exportData() {
        const { progress, sessions, settings } = get();
        return JSON.stringify({ progress, sessions, settings }, null, 2);
      },

      importData(json) {
        try {
          const parsed = JSON.parse(json);
          if (typeof parsed !== 'object') return false;
          set({
            progress: parsed.progress ?? {},
            sessions: parsed.sessions ?? [],
            settings: parsed.settings ?? initialSettings,
          });
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name:    'fal-study-progress',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

// Convenience selectors
export const selectProgress  = (s: ProgressStore) => s.progress;
export const selectSessions  = (s: ProgressStore) => s.sessions;
export const selectSettings  = (s: ProgressStore) => s.settings;
export const selectFavorites = (s: ProgressStore) =>
  Object.entries(s.progress)
    .filter(([, p]) => p.favorita)
    .map(([id]) => id);
