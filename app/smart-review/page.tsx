'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuestions } from '@/hooks/useQuestions';
import { useStore } from '@/store/useStore';
import { StudySession } from '@/components/StudySession';
import { filterByTopics } from '@/lib/questions';
import { sortForReview } from '@/lib/spacedRepetition';
import type { ExamConfig } from '@/types';

function SmartReviewContent() {
  const params   = useSearchParams();
  const { questions, loading } = useQuestions();
  const { progress } = useStore();

  if (loading) return <Loading />;

  const topicKeys = params.get('topics')?.split(',').filter(Boolean) ?? [];
  const num       = Math.max(1, Number(params.get('num') ?? 30));

  const pool     = filterByTopics(questions, topicKeys);
  const sorted   = sortForReview(pool, progress);
  const selected = sorted.slice(0, num);

  const config: ExamConfig = {
    numPreguntas: selected.length,
    temas:        topicKeys,
    timerEnabled: false,
    timerMinutes: 0,
    modo:         'smart-review',
  };

  return <StudySession questions={selected} config={config} />;
}

export default function SmartReviewPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SmartReviewContent />
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
