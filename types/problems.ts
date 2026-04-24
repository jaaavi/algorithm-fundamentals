// ─── Problem domain types ──────────────────────────────────────────────────────

export type ProblemTema = 'Iterativos' | 'Recursión' | 'Backtracking';

export type ProblemSubtipoIterativos =
  | 'acumulador'
  | 'máximo/mínimo'
  | 'búsqueda'
  | 'conteo'
  | 'doble bucle'
  | 'ventana';

export type ProblemSubtipoRecursion =
  | 'recursión simple'
  | 'recursión final'
  | 'divide y vencerás';

export type ProblemSubtipoBacktracking =
  | 'generación'
  | 'combinaciones'
  | 'permutaciones'
  | 'con restricciones'
  | 'con poda';

export type ProblemSubtipo =
  | ProblemSubtipoIterativos
  | ProblemSubtipoRecursion
  | ProblemSubtipoBacktracking;

export interface Problem {
  id: string;
  tema: ProblemTema | string;
  subtipo: ProblemSubtipo | string;
  dificultad: 1 | 2 | 3 | 4 | 5;

  enunciado: string;
  entrada: string;
  salida: string;
  restricciones: string;

  ejemplo: {
    input: string | null;
    output: string | null;
  };

  tags: string[];

  como_reconocerlo: string;
  idea_clave: string;

  estrategia: string[];
  plantilla_codigo: string;

  pistas: string[];

  solucion_codigo: string;
  explicacion: string;

  errores_comunes: string[];
}

// ─── Filters ───────────────────────────────────────────────────────────────────

export interface ProblemFilters {
  tema?: ProblemTema | '';
  subtipo?: string;
  dificultadMin?: number;
  dificultadMax?: number;
  tags?: string[];
}

// ─── Mapping to quiz topics ────────────────────────────────────────────────────

export const TEMA_TO_TOPIC_KEY: Record<string, string> = {
  'Iterativos':       'Tema 3_ Diseño de algoritmos iterativos',
  'Recursión':        'Tema 4_ Recursión',
  'Divide y vencerás':'Tema 5_ Divide y vencerás',
  'Backtracking':     'Tema 6_ Vuelta atrás',
  'Vuelta atrás':     'Tema 6_ Vuelta atrás',
};

export const TEMA_TO_LESSON_ID: Record<string, number> = {
  'Iterativos':       3,
  'Recursión':        4,
  'Divide y vencerás':5,
  'Backtracking':     6,
  'Vuelta atrás':     6,
};

export const SUBTIPOS_BY_TEMA: Record<ProblemTema, string[]> = {
  'Iterativos':   ['acumulador', 'máximo/mínimo', 'búsqueda', 'conteo', 'doble bucle', 'ventana'],
  'Recursión':    ['recursión simple', 'recursión final', 'divide y vencerás'],
  'Backtracking': ['generación', 'combinaciones', 'permutaciones', 'con restricciones', 'con poda'],
};

export const DIFICULTAD_LABEL: Record<number, string> = {
  1: 'Trivial',
  2: 'Fácil',
  3: 'Medio',
  4: 'Difícil',
  5: 'Muy difícil',
};

export const DIFICULTAD_COLOR: Record<number, string> = {
  1: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400',
  2: 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400',
  3: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-400',
  4: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400',
  5: 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400',
};

export const TEMA_COLOR: Record<string, string> = {
  'Iterativos':   'from-blue-500 to-cyan-500',
  'Recursión':    'from-violet-500 to-purple-600',
  'Backtracking': 'from-orange-500 to-red-500',
};
