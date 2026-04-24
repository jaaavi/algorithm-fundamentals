'use client';

import { cn } from '@/lib/cn';
import type { Question, QuizAnswers } from '@/types';
import { isAnswerCorrect } from '@/lib/questions';

interface QuestionNavigatorProps {
  questions:    Question[];
  currentIndex: number;
  answers:      QuizAnswers;
  showResults?: boolean;
  onGoto:       (index: number) => void;
}

export function QuestionNavigator({
  questions,
  currentIndex,
  answers,
  showResults = false,
  onGoto,
}: QuestionNavigatorProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {questions.map((q, i) => {
        const answered = q.id in answers;
        const isCurrent = i === currentIndex;
        let correct: boolean | null = null;
        if (showResults && answered) {
          correct = isAnswerCorrect(answers[q.id], q.correcta);
        }

        return (
          <button
            key={q.id}
            onClick={() => onGoto(i)}
            title={`Pregunta ${i + 1}`}
            className={cn(
              'w-8 h-8 rounded-lg text-xs font-semibold transition-all duration-100',
              isCurrent && 'ring-2 ring-primary-500 ring-offset-1',
              !answered && !isCurrent && 'bg-slate-100 dark:bg-slate-700 text-slate-500',
              !answered && isCurrent  && 'bg-primary-600 text-white',
              answered  && !showResults && 'bg-primary-200 dark:bg-primary-800 text-primary-800 dark:text-primary-200',
              correct === true  && 'bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200',
              correct === false && 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200',
            )}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}
