import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { Question } from '@/types';
import { getTopicKey, parseCorrectAnswer } from '@/lib/questions';

const JSON_DIR = path.join(process.cwd(), '..', 'json');

export async function GET() {
  try {
    const allFiles = fs.readdirSync(JSON_DIR).filter(f => f.endsWith('.json')).sort();

    // Prefer normalized files (tema1.json, tema3.json, …).
    // If any normalized file exists, skip legacy split files (Tema X_..._N.json).
    const hasNormalized = allFiles.some(f => /^(tema\d+|repaso(_eval)?)\.json$/.test(f));
    const files = hasNormalized
      ? allFiles.filter(f => /^(tema\d+|repaso(_eval)?)\.json$/.test(f))
      : allFiles;
    const questions: Question[] = [];

    for (const file of files) {
      const topicKey = getTopicKey(file);
      const raw      = fs.readFileSync(path.join(JSON_DIR, file), 'utf-8');
      const entries  = JSON.parse(raw) as Array<{
        tema: string;
        pregunta: string;
        opciones: Record<string, string>;
        correcta: string;
        explicacion: string;
      }>;

      for (let i = 0; i < entries.length; i++) {
        const e = entries[i];
        questions.push({
          id:          `${file.replace('.json', '')}_q${i}`,
          tema:        e.tema,
          pregunta:    e.pregunta,
          opciones:    e.opciones,
          correcta:    parseCorrectAnswer(e.correcta),
          explicacion: e.explicacion,
          sourceFile:  file,
          topicKey,
        });
      }
    }

    return NextResponse.json(questions, {
      headers: { 'Cache-Control': 'public, max-age=3600' },
    });
  } catch (err) {
    console.error('[api/questions]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
