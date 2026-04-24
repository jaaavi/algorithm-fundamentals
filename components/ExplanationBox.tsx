import { Lightbulb } from 'lucide-react';
import { cn } from '@/lib/cn';
import { FormattedText } from './FormattedText';

interface ExplanationBoxProps {
  text:    string;
  correct: boolean;
}

export function ExplanationBox({ text, correct }: ExplanationBoxProps) {
  return (
    <div className={cn(
      'rounded-xl border p-4 mt-4 animate-slide-up',
      correct
        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
        : 'bg-amber-50  dark:bg-amber-900/20  border-amber-200  dark:border-amber-800',
    )}>
      <div className="flex items-start gap-3">
        <Lightbulb className={cn('w-5 h-5 mt-0.5 flex-shrink-0', correct ? 'text-emerald-600' : 'text-amber-600')} />
        <div className="flex-1 min-w-0">
          <p className={cn('text-xs font-semibold uppercase tracking-wider mb-2', correct ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300')}>
            {correct ? '¡Correcto!' : 'Explicación'}
          </p>
          <FormattedText
            text={text}
            className="text-sm text-slate-700 dark:text-slate-300"
          />
        </div>
      </div>
    </div>
  );
}
