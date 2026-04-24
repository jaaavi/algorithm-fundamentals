'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Problem, ProblemFilters } from '@/types/problems';

interface UseProblemsResult {
  problems: Problem[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProblems(filters?: ProblemFilters): UseProblemsResult {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters?.tema)        params.set('tema', filters.tema);
      if (filters?.subtipo)     params.set('subtipo', filters.subtipo);
      if (filters?.dificultadMin != null) params.set('dificultadMin', String(filters.dificultadMin));
      if (filters?.dificultadMax != null) params.set('dificultadMax', String(filters.dificultadMax));

      const url = `/api/problems${params.toString() ? `?${params}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Problem[] = await res.json();
      setProblems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.tema, filters?.subtipo, filters?.dificultadMin, filters?.dificultadMax]);

  useEffect(() => { fetchProblems(); }, [fetchProblems]);

  return { problems, loading, error, refetch: fetchProblems };
}

interface UseProblemResult {
  problem: Problem | null;
  loading: boolean;
  error: string | null;
}

export function useProblem(id: string): UseProblemResult {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    fetch(`/api/problems/${encodeURIComponent(id)}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: Problem) => { setProblem(data); })
      .catch(e => { setError(e instanceof Error ? e.message : String(e)); })
      .finally(() => setLoading(false));
  }, [id]);

  return { problem, loading, error };
}
