import { tema1 } from './tema1';
import { tema2 } from './tema2';
import { tema3 } from './tema3';
import { tema4 } from './tema4';
import { tema5 } from './tema5';
import { tema6 } from './tema6';
import type { Lesson } from '@/types/lessons';

export const lessons: Lesson[] = [tema1, tema2, tema3, tema4, tema5, tema6];

export function getLessonById(id: number): Lesson | undefined {
  return lessons.find(l => l.id === id);
}
