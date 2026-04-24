import { NextResponse } from 'next/server';
import { lessons } from '@/lib/lessons';

export async function GET() {
  return NextResponse.json(lessons, {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  });
}
