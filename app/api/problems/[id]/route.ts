import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { Problem } from '@/types/problems';

const PROBLEMS_DIR = path.join(process.cwd(), 'problems-json');

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const filePath = path.join(PROBLEMS_DIR, `${id}.json`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    const problem = JSON.parse(raw) as Problem;

    return NextResponse.json(problem, {
      headers: { 'Cache-Control': 'public, max-age=60' },
    });
  } catch (err) {
    console.error('[api/problems/[id]]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
