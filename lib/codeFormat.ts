// ─── Token types for syntax highlighting ──────────────────────────────────────

export type TokenType =
  | 'keyword' | 'type' | 'number' | 'string' | 'comment'
  | 'identifier' | 'operator' | 'punct' | 'space' | 'plain';

export interface Token { type: TokenType; value: string }

// ─── Segment types for parsed text ────────────────────────────────────────────

export type Segment =
  | { type: 'text';    content: string }
  | { type: 'code';    content: string }
  | { type: 'formula'; content: string };  // {logical predicate / invariant}

// ─── Constants ─────────────────────────────────────────────────────────────────

const C_KEYWORDS = new Set([
  'if', 'else', 'for', 'while', 'do', 'return', 'break', 'continue',
  'switch', 'case', 'default', 'new', 'delete', 'nullptr', 'true', 'false',
  'this', 'static', 'inline', 'virtual', 'public', 'private', 'protected',
  'class', 'struct', 'namespace', 'using', 'template', 'typename', 'decltype',
  'sizeof', 'typedef', 'enum',
]);

const C_TYPES = new Set([
  'int', 'bool', 'void', 'char', 'float', 'double', 'long', 'short',
  'unsigned', 'signed', 'const', 'auto', 'string', 'vector', 'size_t',
  'uint8_t', 'uint16_t', 'uint32_t', 'int64_t', 'pair',
]);

// Unicode / formal-notation symbols that indicate a math predicate
const FORMAL_SYMBOLS = /[∧∨∀∃∈∉Σ≤≥→⇒⊆⊂∩∪¬±√#πΩΘ]/;

// ─── Detection helpers ─────────────────────────────────────────────────────────

/** True if this text contains C++ code */
export function hasCxxCode(text: string): boolean {
  const hasCxxKeyword = /\b(int|bool|void|char|float|double|const|auto|return|for|while|if|else)\b/.test(text);
  // Formal predicates also use { } but NOT semicolons
  const hasSemicolon  = /;/.test(text);
  return hasCxxKeyword && hasSemicolon;
}

/** True if this text looks like formal/math notation rather than code */
export function isFormalText(text: string): boolean {
  return FORMAL_SYMBOLS.test(text);
}

/** True if this short text should be rendered inline as code */
export function isInlineCode(text: string): boolean {
  return /\b(int|bool|void|char|return|for|while|if)\b/.test(text) && /[;{}()]/.test(text);
}

// ─── Text parser ───────────────────────────────────────────────────────────────

/**
 * Splits a question/explanation text into segments:
 *  - 'text':    regular prose
 *  - 'code':    C++ code block to display in a pre
 *  - 'formula': a logical/formal predicate {like this}
 *
 * Also strips the trailing "Seleccione una:" artefact.
 */
export function parseText(raw: string): Segment[] {
  const text = raw.replace(/\s*Seleccione\s+una:?\s*$/i, '').trim();

  if (!hasCxxCode(text)) {
    return [{ type: 'text', content: text }];
  }

  // Regex that marks the beginning of C++ code.
  // Conservative set: only keywords that are unambiguous in Spanish prose.
  // Excluded: 'vector'/'string'/'auto'/'long'/'short' — common Spanish/English words.
  const CXX_START =
    /(?<!\w)(int|bool|void|char|float|double|const)\s+\w+|(?<!\w)(for|while|do)\s*\(|(?<!\w)if\s*\(|vector\s*<|#include/;

  const match = CXX_START.exec(text);
  if (!match) return [{ type: 'text', content: text }];

  const codePos  = match.index;
  const beforeCode = text.slice(0, codePos);

  // Find last sentence-end (. or :) before the code
  // so we split cleanly after natural-language prose
  const sentenceEnds = [...beforeCode.matchAll(/[.:]\s+|[.:]\s*$/g)];
  const lastEnd      = sentenceEnds.at(-1);
  const splitAt      = lastEnd ? lastEnd.index! + lastEnd[0].length : codePos;

  const textPart = text.slice(0, splitAt).trim();
  const codePart = text.slice(splitAt).trim();

  const result: Segment[] = [];
  if (textPart) result.push({ type: 'text', content: textPart });
  if (codePart) result.push({ type: 'code', content: codePart });

  return result;
}

// ─── Syntax tokenizer ──────────────────────────────────────────────────────────

const TOKEN_RE =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|"[^"]*"|'[^'](?:[^']|\\.)*'|\b0x[0-9a-fA-F]+\b|\b[0-9]+(?:\.[0-9]+)?[uUlLfF]*\b|\b[a-zA-Z_]\w*\b|[{}()\[\];,]|[<>=!+\-*\/%&|^~:.]+|\s+|.)/g;

export function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let m: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;

  while ((m = TOKEN_RE.exec(code)) !== null) {
    const v = m[0];

    if (/^\/[/*]/.test(v))             tokens.push({ type: 'comment',    value: v });
    else if (/^["']/.test(v))          tokens.push({ type: 'string',     value: v });
    else if (/^\d|^0x/.test(v))        tokens.push({ type: 'number',     value: v });
    else if (C_KEYWORDS.has(v))        tokens.push({ type: 'keyword',    value: v });
    else if (C_TYPES.has(v))           tokens.push({ type: 'type',       value: v });
    else if (/^\s+$/.test(v))          tokens.push({ type: 'space',      value: v });
    else if (/^[{}()\[\];,]$/.test(v)) tokens.push({ type: 'punct',      value: v });
    else if (/^[<>=!+\-*\/%&|^~:.]+$/.test(v)) tokens.push({ type: 'operator', value: v });
    else if (/^[a-zA-Z_]\w*$/.test(v)) tokens.push({ type: 'identifier', value: v });
    else                               tokens.push({ type: 'plain',      value: v });
  }

  return tokens;
}

// ─── Simple pretty-printer ─────────────────────────────────────────────────────

/**
 * Adds newlines and indentation to make C++ code more readable.
 * Handles simple cases without full parser complexity.
 */
export function prettyPrint(code: string): string {
  let indent  = 0;
  let result  = '';
  let i       = 0;
  const TAB   = '  ';

  // Tokenize into meaningful units
  const units = code.split(/(?<=[;{}])\s*/g);

  for (const unit of units) {
    const trimmed = unit.trim();
    if (!trimmed) continue;

    // Closing brace always dedents first
    if (trimmed.startsWith('}')) {
      indent = Math.max(0, indent - 1);
      result += '\n' + TAB.repeat(indent) + trimmed;
      if (trimmed.endsWith('{')) indent++;
    } else {
      result += '\n' + TAB.repeat(indent) + trimmed;
      // Count net braces in this unit to adjust indent
      const opens  = (trimmed.match(/\{/g) ?? []).length;
      const closes = (trimmed.match(/\}/g) ?? []).length;
      indent = Math.max(0, indent + opens - closes);
    }
  }

  return result.trim();
}
