'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuestions } from '@/hooks/useQuestions';
import { useStore } from '@/store/useStore';
import { StudySession } from '@/components/StudySession';
import { filterByTopics, selectQuestions, shuffleArray } from '@/lib/questions';
import type { ExamConfig } from '@/types';

function ExamContent() {
  const params  = useSearchParams();
  const { questions, loading } = useQuestions();
  const { progress } = useStore();

  if (loading) return <Loading />;

  const topicKeys = params.get('topics')?.split(',').filter(Boolean) ?? [];
  const num       = Math.max(1, Number(params.get('num') ?? 10));
  const timer     = params.get('timer') === 'true';
  const timerMin  = Math.max(1, Number(params.get('timerMin') ?? 20));

  const pool     = filterByTopics(questions, topicKeys);
  const selected = selectQuestions(pool, num, true);

  const config: ExamConfig = {
    numPreguntas:  selected.length,
    temas:         topicKeys,
    timerEnabled:  timer,
    timerMinutes:  timerMin,
    modo:          'exam',
  };

  return <StudySession questions={selected} config={config} />;
}

export default function ExamPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ExamContent />
    </Suspense>
  );
}

function Loading() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
