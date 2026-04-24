'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuestions } from '@/hooks/useQuestions';
import { useStore } from '@/store/useStore';
import { StudySession } from '@/components/StudySession';
import { filterByTopics, filterFailed, shuffleArray } from '@/lib/questions';
import type { ExamConfig } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertCircle, RefreshCw } from 'lucide-react';

function FailedContent() {
  const params              = useSearchParams();
  const { questions, loading } = useQuestions();
  const { progress, resetTopic } = useStore();
  const [resetDone, setResetDone] = useState(false);

  if (loading) return <Loading />;

  const topicKeys  = params.get('topics')?.split(',').filter(Boolean) ?? [];
  const num        = Math.max(1, Number(params.get('num') ?? 50));

  const pool     = filterByTopics(questions, topicKeys);
  const failed   = filterFailed(pool, progress);
  const selected = shuffleArray(failed).slice(0, num);

  if (failed.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <Card padding="lg">
          <AlertCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">¡Sin fallos!</h2>
          <p className="text-slate-500">No tienes preguntas falladas en los temas seleccionados.</p>
          <Button variant="secondary" className="mt-4" onClick={() => window.history.back()}>
            Volver
          </Button>
        </Card>
      </div>
    );
  }

  const config: ExamConfig = {
    numPreguntas: selected.length,
    temas:        topicKeys,
    timerEnabled: false,
    timerMinutes: 0,
    modo:         'failed',
  };

  return (
    <div>
      <div className="max-w-3xl mx-auto px-4 pt-4 pb-0">
        <div className="flex items-center justify-between bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-3 mb-2">
          <p className="text-sm text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {failed.length} preguntas falladas
          </p>
          <button
            onClick={() => {
              const ids = pool.map(q => q.id);
              resetTopic(ids);
              setResetDone(true);
            }}
            className="flex items-center gap-1 text-xs text-rose-600 hover:underline"
          >
            <RefreshCw className="w-3 h-3" />
            Resetear historial
          </button>
        </div>
      </div>
      <StudySession questions={selected} config={config} />
    </div>
  );
}

export default function FailedPage() {
  return (
    <Suspense fallback={<Loading />}>
      <FailedContent />
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
