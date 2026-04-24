import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { Problem, ProblemFilters } from '@/types/problems';

const PROBLEMS_DIR = path.join(process.cwd(), 'problems-json');

function loadAllProblems(): Problem[] {
  if (!fs.existsSync(PROBLEMS_DIR)) return [];

  const files = fs.readdirSync(PROBLEMS_DIR).filter(f => f.endsWith('.json')).sort();
  const problems: Problem[] = [];

  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(PROBLEMS_DIR, file), 'utf-8');
      const p = JSON.parse(raw) as Problem;
      problems.push(p);
    } catch (err) {
      console.warn(`[api/problems] Error parsing ${file}:`, err);
    }
  }

  return problems;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tema        = searchParams.get('tema') || '';
    const subtipo     = searchParams.get('subtipo') || '';
    const dificultad  = searchParams.get('dificultad');
    const tag         = searchParams.get('tag') || '';

    let problems = loadAllProblems();

    if (tema)     problems = problems.filter(p => p.tema === tema);
    if (subtipo)  problems = problems.filter(p => p.subtipo === subtipo);
    if (dificultad) {
      const d = parseInt(dificultad, 10);
      if (!isNaN(d)) problems = problems.filter(p => p.dificultad === d);
    }
    if (tag) problems = problems.filter(p => p.tags.includes(tag));

    return NextResponse.json(problems, {
      headers: { 'Cache-Control': 'public, max-age=60' },
    });
  } catch (err) {
    console.error('[api/problems]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
