'use client';

import { useState, useEffect } from 'react';
import type { Question, Topic } from '@/types';
import { buildTopicList } from '@/lib/questions';

interface QuestionsState {
  questions: Question[];
  topics:    Topic[];
  loading:   boolean;
  error:     string | null;
}

let cache: { questions: Question[]; topics: Topic[] } | null = null;

export function useQuestions(): QuestionsState {
  const [state, setState] = useState<QuestionsState>({
    questions: cache?.questions ?? [],
    topics:    cache?.topics    ?? [],
    loading:   cache === null,
    error:     null,
  });

  useEffect(() => {
    if (cache) return;
    fetch('/api/questions')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<Question[]>;
      })
      .then(questions => {
        const topics = buildTopicList(questions);
        cache = { questions, topics };
        setState({ questions, topics, loading: false, error: null });
      })
      .catch(err => {
        setState(s => ({ ...s, loading: false, error: String(err) }));
      });
  }, []);

  return state;
}
