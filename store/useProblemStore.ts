'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ProblemStatus = 'unseen' | 'attempted' | 'solved';

export interface ProblemProgress {
  status: ProblemStatus;
  intentos: number;
  vistaSolucion: boolean;
  lastSeen: number;
}

interface ProblemStore {
  progress: Record<string, ProblemProgress>;
  markAttempted:   (id: string) => void;
  markSolved:      (id: string) => void;
  markSawSolution: (id: string) => void;
  getProgress:     (id: string) => ProblemProgress;
  reset:           () => void;
}

function defaultProblemProgress(): ProblemProgress {
  return { status: 'unseen', intentos: 0, vistaSolucion: false, lastSeen: 0 };
}

export const useProblemStore = create<ProblemStore>()(
  persist(
    (set, get) => ({
      progress: {},

      markAttempted(id) {
        set(state => {
          const current = state.progress[id] ?? defaultProblemProgress();
          return {
            progress: {
              ...state.progress,
              [id]: {
                ...current,
                intentos: current.intentos + 1,
                status: current.status === 'unseen' ? 'attempted' : current.status,
                lastSeen: Date.now(),
              },
            },
          };
        });
      },

      markSolved(id) {
        set(state => {
          const current = state.progress[id] ?? defaultProblemProgress();
          return {
            progress: {
              ...state.progress,
              [id]: {
                ...current,
                status: 'solved',
                lastSeen: Date.now(),
              },
            },
          };
        });
      },

      markSawSolution(id) {
        set(state => {
          const current = state.progress[id] ?? defaultProblemProgress();
          return {
            progress: {
              ...state.progress,
              [id]: {
                ...current,
                vistaSolucion: true,
                status: current.status === 'unseen' ? 'attempted' : current.status,
                lastSeen: Date.now(),
              },
            },
          };
        });
      },

      getProgress(id) {
        return get().progress[id] ?? defaultProblemProgress();
      },

      reset() {
        set({ progress: {} });
      },
    }),
    {
      name:    'fal-problem-progress',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
