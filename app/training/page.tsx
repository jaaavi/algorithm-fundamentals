'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuestions } from '@/hooks/useQuestions';
import { StudySession } from '@/components/StudySession';
import { filterByTopics, selectQuestions } from '@/lib/questions';
import type { ExamConfig } from '@/types';

function TrainingContent() {
  const params  = useSearchParams();
  const { questions, loading } = useQuestions();

  if (loading) return <Loading />;

  const topicKeys = params.get('topics')?.split(',').filter(Boolean) ?? [];
  const num       = Math.max(1, Number(params.get('num') ?? 10));

  const pool     = filterByTopics(questions, topicKeys);
  const selected = selectQuestions(pool, num, true);

  const config: ExamConfig = {
    numPreguntas: selected.length,
    temas:        topicKeys,
    timerEnabled: false,
    timerMinutes: 0,
    modo:         'training',
  };

  return <StudySession questions={selected} config={config} />;
}

export default function TrainingPage() {
  return (
    <Suspense fallback={<Loading />}>
      <TrainingContent />
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
