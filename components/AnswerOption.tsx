'use client';

import { cn } from '@/lib/cn';
import { Check, X } from 'lucide-react';
import { FormattedText } from './FormattedText';

type OptionState = 'idle' | 'selected' | 'correct' | 'incorrect' | 'missed';

interface AnswerOptionProps {
  letter:   string;
  text:     string;
  state:    OptionState;
  disabled: boolean;
  isMulti:  boolean;
  onClick:  () => void;
}

const stateStyles: Record<OptionState, string> = {
  idle:      'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 cursor-pointer',
  selected:  'border-primary-500 bg-primary-50 dark:bg-primary-900/30 shadow-sm cursor-pointer ring-1 ring-primary-400',
  correct:   'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 cursor-default',
  incorrect: 'border-red-500 bg-red-50 dark:bg-red-900/30 cursor-default',
  missed:    'border-emerald-400 bg-emerald-50/60 dark:bg-emerald-900/20 cursor-default border-dashed',
};

const letterBg: Record<OptionState, string> = {
  idle:      'bg-slate-100 dark:bg-slate-700 text-slate-500',
  selected:  'bg-primary-200 dark:bg-primary-800 text-primary-700 dark:text-primary-200',
  correct:   'bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200',
  incorrect: 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200',
  missed:    'bg-emerald-200 dark:bg-emerald-800 text-emerald-700',
};

const textColor: Record<OptionState, string> = {
  idle:      'text-slate-700 dark:text-slate-200',
  selected:  'text-primary-800 dark:text-primary-100',
  correct:   'text-emerald-800 dark:text-emerald-200',
  incorrect: 'text-red-800 dark:text-red-200',
  missed:    'text-emerald-700 dark:text-emerald-300',
};

export function AnswerOption({ letter, text, state, disabled, isMulti, onClick }: AnswerOptionProps) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-150 animate-fade-in',
        stateStyles[state],
        disabled && state === 'idle' && 'opacity-60 cursor-not-allowed',
      )}
    >
      {/* Letter badge */}
      <span className={cn(
        'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold uppercase transition-colors mt-0.5',
        letterBg[state],
      )}>
        {letter}
      </span>

      {/* Text — inline mode: handles formulas and inline code */}
      <span className={cn('flex-1 text-sm leading-relaxed pt-0.5', textColor[state])}>
        <FormattedText text={text} inline />
      </span>

      {/* State icon */}
      {state === 'correct'   && <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />}
      {state === 'incorrect' && <X     className="w-5 h-5 text-red-600    flex-shrink-0 mt-0.5" />}
      {state === 'missed'    && <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5 opacity-70" />}

      {/* Multi-select checkbox visual */}
      {isMulti && (state === 'idle' || state === 'selected') && (
        <span className={cn(
          'w-4 h-4 rounded border-2 flex-shrink-0 mt-0.5 transition-all',
          state === 'selected' ? 'border-primary-500 bg-primary-500' : 'border-slate-300 dark:border-slate-500',
        )} />
      )}
    </button>
  );
}
