'use client';

import { useMemo } from 'react';
import { tokenize, prettyPrint, type Token } from '@/lib/codeFormat';

// ─── Token → Tailwind class ────────────────────────────────────────────────────

const TOKEN_CLASS: Record<string, string> = {
  keyword:    'text-violet-400 font-semibold',
  type:       'text-blue-400 font-semibold',
  number:     'text-orange-400',
  string:     'text-emerald-400',
  comment:    'text-slate-500 italic',
  identifier: 'text-slate-200',
  operator:   'text-pink-400',
  punct:      'text-slate-400',
  space:      '',
  plain:      'text-slate-300',
};

function SyntaxToken({ token }: { token: Token }) {
  const cls = TOKEN_CLASS[token.type] ?? '';
  // Preserve newlines as actual line breaks
  if (token.type === 'space' && token.value.includes('\n')) {
    return <>{token.value}</>;
  }
  return cls ? <span className={cls}>{token.value}</span> : <>{token.value}</>;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface CodeBlockProps {
  code:   string;
  pretty?: boolean;  // attempt auto-indent
}

export function CodeBlock({ code, pretty = true }: CodeBlockProps) {
  const displayed = useMemo(
    () => (pretty ? prettyPrint(code) : code),
    [code, pretty],
  );

  const tokens = useMemo(() => tokenize(displayed), [displayed]);

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-700/60 shadow-lg">
      {/* Title bar */}
      <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 border-b border-slate-700">
        <span className="w-3 h-3 rounded-full bg-red-500/70" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
        <span className="ml-2 text-xs text-slate-500 font-mono">code</span>
      </div>
      {/* Code area */}
      <pre className="bg-slate-900 text-sm font-mono leading-relaxed px-5 py-4 overflow-x-auto whitespace-pre">
        {tokens.map((t, i) => (
          <SyntaxToken key={i} token={t} />
        ))}
      </pre>
    </div>
  );
}
