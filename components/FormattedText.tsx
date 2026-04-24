'use client';

import { useMemo } from 'react';
import { parseText, isFormalText, isInlineCode } from '@/lib/codeFormat';
import { CodeBlock } from './CodeBlock';
import { cn } from '@/lib/cn';

// ─── Inline formula span ───────────────────────────────────────────────────────

function FormulaSpan({ text }: { text: string }) {
  return (
    <span className="font-mono text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 rounded px-1.5 py-0.5 text-sm border border-amber-200/60 dark:border-amber-700/40 inline-block leading-snug">
      {text}
    </span>
  );
}

// ─── Inline code span ─────────────────────────────────────────────────────────

function InlineCode({ text }: { text: string }) {
  return (
    <code className="font-mono text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/30 rounded px-1.5 py-0.5 text-[0.85em] border border-violet-200/60 dark:border-violet-700/40">
      {text}
    </code>
  );
}

// ─── Text with inline formula/code spans ──────────────────────────────────────

/**
 * Renders a prose string, wrapping any `{predicate}` blocks in formula styling
 * and any obvious inline code references in code styling.
 */
function RichText({ text, className }: { text: string; className?: string }) {
  // Split on {…} blocks so we can style predicates / invariants
  const parts = useMemo(() => {
    const result: Array<{ kind: 'prose' | 'formula'; content: string }> = [];
    const RE = /(\{[^{}]+\})/g;
    let last = 0;
    let m: RegExpExecArray | null;

    while ((m = RE.exec(text)) !== null) {
      if (m.index > last) result.push({ kind: 'prose',   content: text.slice(last, m.index) });
      result.push({ kind: 'formula', content: m[1] });
      last = m.index + m[0].length;
    }
    if (last < text.length) result.push({ kind: 'prose', content: text.slice(last) });

    return result;
  }, [text]);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.kind === 'formula'
          ? <FormulaSpan key={i} text={part.content} />
          : <span key={i}>{part.content}</span>,
      )}
    </span>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

interface FormattedTextProps {
  text:       string;
  className?: string;
  /** When true, never render a full code block — inline only */
  inline?:    boolean;
}

/**
 * Renders question / explanation / option text with:
 *  - Proper C++ syntax-highlighted code blocks
 *  - Styled `{invariant / predicate}` formulas
 *  - Inline code spans for short snippets
 */
export function FormattedText({ text, className, inline = false }: FormattedTextProps) {
  const segments = useMemo(() => parseText(text), [text]);

  if (inline) {
    // For answer options: inline-only formatting
    if (isFormalText(text) || isInlineCode(text)) {
      return (
        <span className={cn('font-mono text-sm leading-relaxed', className)}>
          <RichText text={text} />
        </span>
      );
    }
    return <span className={className}>{text}</span>;
  }

  // Full block rendering
  return (
    <div className={cn('space-y-2', className)}>
      {segments.map((seg, i) => {
        if (seg.type === 'code') {
          return <CodeBlock key={i} code={seg.content} />;
        }
        // Prose segment — still check for inline formulas
        return (
          <p key={i} className="leading-relaxed">
            <RichText text={seg.content} />
          </p>
        );
      })}
    </div>
  );
}
