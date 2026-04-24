import type {
  VisualizationConfig,
  VectorSearchConfig,
  BinarySearchConfig,
  RecursionTreeConfig,
  BacktrackingConfig,
  CostAnalysisConfig,
} from '@/types/visualizations';

// ─── Vector Search ────────────────────────────────────────────────────────────

const vsBasic: VectorSearchConfig = {
  type: 'vector-search',
  id: 'vs-basic',
  title: 'Búsqueda lineal paso a paso',
  description: 'Recorremos el vector de izquierda a derecha comparando cada elemento con el valor buscado.',
  array: [3, 1, 4, 1, 5, 9, 2, 6],
  target: 5,
  steps: [
    {
      title: 'Inicialización',
      description: 'El vector contiene 8 elementos. Queremos encontrar el valor 5. Comenzamos por el índice 0.',
      currentIndex: null, foundAt: null, phase: 'init',
    },
    {
      title: 'Comparar v[0] = 3',
      description: 'v[0] = 3 ≠ 5. No es el valor buscado. Avanzamos al siguiente índice.',
      currentIndex: 0, foundAt: null, phase: 'comparing',
    },
    {
      title: 'Comparar v[1] = 1',
      description: 'v[1] = 1 ≠ 5. No es el valor buscado. Avanzamos al siguiente índice.',
      currentIndex: 1, foundAt: null, phase: 'comparing',
    },
    {
      title: 'Comparar v[2] = 4',
      description: 'v[2] = 4 ≠ 5. No es el valor buscado. Avanzamos al siguiente índice.',
      currentIndex: 2, foundAt: null, phase: 'comparing',
    },
    {
      title: 'Comparar v[3] = 1',
      description: 'v[3] = 1 ≠ 5. No es el valor buscado. Avanzamos al siguiente índice.',
      currentIndex: 3, foundAt: null, phase: 'comparing',
    },
    {
      title: '¡Encontrado en v[4] = 5!',
      description: 'v[4] = 5 = 5 ✓. El valor buscado está en la posición 4. Terminamos la búsqueda. Coste: O(n) en el peor caso.',
      currentIndex: 4, foundAt: 4, phase: 'found',
    },
  ],
};

const vsNotFound: VectorSearchConfig = {
  type: 'vector-search',
  id: 'vs-not-found',
  title: 'Búsqueda lineal — elemento no encontrado',
  description: 'Cuando el elemento no existe, hay que recorrer todo el vector: O(n) operaciones.',
  array: [2, 7, 1, 8, 4, 6],
  target: 3,
  steps: [
    { title: 'Inicialización', description: 'Buscamos 3 en el vector. No sabemos si existe.', currentIndex: null, foundAt: null, phase: 'init' },
    { title: 'v[0] = 2 ≠ 3', description: 'No encontrado. Continuamos.', currentIndex: 0, foundAt: null, phase: 'comparing' },
    { title: 'v[1] = 7 ≠ 3', description: 'No encontrado. Continuamos.', currentIndex: 1, foundAt: null, phase: 'comparing' },
    { title: 'v[2] = 1 ≠ 3', description: 'No encontrado. Continuamos.', currentIndex: 2, foundAt: null, phase: 'comparing' },
    { title: 'v[3] = 8 ≠ 3', description: 'No encontrado. Continuamos.', currentIndex: 3, foundAt: null, phase: 'comparing' },
    { title: 'v[4] = 4 ≠ 3', description: 'No encontrado. Continuamos.', currentIndex: 4, foundAt: null, phase: 'comparing' },
    { title: 'v[5] = 6 ≠ 3', description: 'No encontrado. Continuamos.', currentIndex: 5, foundAt: null, phase: 'comparing' },
    { title: 'Elemento no encontrado', description: 'Hemos recorrido todo el vector (6 comparaciones) sin encontrar el 3. Este es el peor caso: O(n).', currentIndex: null, foundAt: null, phase: 'not-found' },
  ],
};

// ─── Binary Search ────────────────────────────────────────────────────────────

const bsBasic: BinarySearchConfig = {
  type: 'binary-search',
  id: 'bs-basic',
  title: 'Búsqueda binaria paso a paso',
  description: 'En un vector ordenado, podemos descartar la mitad del espacio de búsqueda en cada paso: O(log n).',
  array: [1, 3, 5, 7, 9, 11, 13, 15],
  target: 9,
  steps: [
    {
      title: 'Inicialización',
      description: 'El vector está ordenado. Colocamos left=0 y right=7 (extremos del vector). El vector tiene 8 elementos; buscaremos 9.',
      left: 0, right: 7, mid: null, discarded: [], phase: 'init',
    },
    {
      title: 'Calcular mid = (0+7)/2 = 3',
      description: 'El punto medio es el índice 3. v[3] = 7. Comparamos con el objetivo 9.',
      left: 0, right: 7, mid: 3, discarded: [], phase: 'comparing',
    },
    {
      title: 'v[3]=7 < 9 → descartar mitad izquierda',
      description: 'Como 7 < 9, el elemento buscado está en la mitad derecha. Descartamos índices 0..3. Actualizamos left = mid+1 = 4.',
      left: 4, right: 7, mid: 3, discarded: [0, 1, 2, 3], phase: 'discard-left',
    },
    {
      title: 'Calcular mid = (4+7)/2 = 5',
      description: 'Nuevo punto medio: índice 5. v[5] = 11. Comparamos con 9.',
      left: 4, right: 7, mid: 5, discarded: [0, 1, 2, 3], phase: 'comparing',
    },
    {
      title: 'v[5]=11 > 9 → descartar mitad derecha',
      description: 'Como 11 > 9, el elemento buscado está en la mitad izquierda. Descartamos índices 5..7. Actualizamos right = mid-1 = 4.',
      left: 4, right: 4, mid: 5, discarded: [0, 1, 2, 3, 5, 6, 7], phase: 'discard-right',
    },
    {
      title: '¡Encontrado! mid = (4+4)/2 = 4',
      description: 'Queda un solo candidato: índice 4. v[4] = 9 = 9 ✓. ¡Encontrado en solo 3 comparaciones! Si buscáramos linealmente necesitaríamos 5.',
      left: 4, right: 4, mid: 4, discarded: [0, 1, 2, 3, 5, 6, 7], phase: 'found',
    },
  ],
};

// ─── Recursion Tree ───────────────────────────────────────────────────────────

const recFibonacci: RecursionTreeConfig = {
  type: 'recursion-tree',
  id: 'rec-fibonacci',
  title: 'Árbol de llamadas: fib(3)',
  description: 'Visualización de la recursión múltiple de Fibonacci. Cada nodo hace DOS llamadas recursivas.',
  root: {
    id: 'f3', label: 'fib(3)', returnValue: '2',
    children: [
      {
        id: 'f2', label: 'fib(2)', returnValue: '1',
        children: [
          { id: 'f1a', label: 'fib(1)', returnValue: '1', children: [] },
          { id: 'f0a', label: 'fib(0)', returnValue: '0', children: [] },
        ],
      },
      { id: 'f1b', label: 'fib(1)', returnValue: '1', children: [] },
    ],
  },
  steps: [
    {
      title: 'Estructura del árbol',
      description: 'Este es el árbol completo de llamadas de fib(3). Cada nodo interno hace 2 llamadas recursivas. Los nodos hoja son casos base.',
      activeNodeId: null, completedNodeIds: [], phase: 'init',
    },
    {
      title: 'Llamar fib(3)',
      description: 'Se llama fib(3). Como 3 > 1, no es caso base. Necesita calcular fib(2) + fib(1).',
      activeNodeId: 'f3', completedNodeIds: [], phase: 'calling',
    },
    {
      title: 'Llamar fib(2) [rama izquierda]',
      description: 'Para calcular fib(3), primero llamamos a fib(2). La ejecución de fib(3) queda pendiente en la pila.',
      activeNodeId: 'f2', completedNodeIds: [], phase: 'calling',
    },
    {
      title: 'Llamar fib(1) → caso base',
      description: 'Para calcular fib(2), primero llamamos a fib(1). fib(1) = 1 directamente (caso base). Retorna inmediatamente.',
      activeNodeId: 'f1a', completedNodeIds: [], phase: 'base-case',
    },
    {
      title: 'fib(1) retorna 1',
      description: 'fib(1) = 1. Retorna el valor 1 a su llamador (fib(2)).',
      activeNodeId: 'f1a', completedNodeIds: ['f1a'], phase: 'returning',
    },
    {
      title: 'Llamar fib(0) → caso base',
      description: 'fib(2) ahora llama a fib(0). fib(0) = 0 directamente (caso base).',
      activeNodeId: 'f0a', completedNodeIds: ['f1a'], phase: 'base-case',
    },
    {
      title: 'fib(0) retorna 0',
      description: 'fib(0) = 0. Retorna el valor 0 a su llamador (fib(2)).',
      activeNodeId: 'f0a', completedNodeIds: ['f1a', 'f0a'], phase: 'returning',
    },
    {
      title: 'fib(2) retorna 1+0=1',
      description: 'fib(2) tiene los resultados de sus dos llamadas: fib(1)=1 y fib(0)=0. Calcula 1+0=1 y retorna.',
      activeNodeId: 'f2', completedNodeIds: ['f1a', 'f0a', 'f2'], phase: 'returning',
    },
    {
      title: 'Llamar fib(1) [rama derecha] → caso base',
      description: 'Ahora fib(3) llama a su segunda llamada recursiva: fib(1). Atención: ¡ya calculamos fib(1) antes! Esto muestra la ineficiencia O(2ⁿ).',
      activeNodeId: 'f1b', completedNodeIds: ['f1a', 'f0a', 'f2'], phase: 'base-case',
    },
    {
      title: 'fib(1) retorna 1',
      description: 'fib(1) = 1. Retorna el valor 1.',
      activeNodeId: 'f1b', completedNodeIds: ['f1a', 'f0a', 'f2', 'f1b'], phase: 'returning',
    },
    {
      title: 'fib(3) retorna 1+1=2',
      description: 'fib(3) tiene los dos resultados: fib(2)=1 y fib(1)=1. Calcula 1+1=2. ¡Árbol de llamadas completado!',
      activeNodeId: 'f3', completedNodeIds: ['f1a', 'f0a', 'f2', 'f1b', 'f3'], phase: 'returning',
    },
    {
      title: 'Completado — coste O(2ⁿ)',
      description: 'Para calcular fib(3)=2 hemos hecho 11 operaciones sobre un árbol de 5 nodos. Para fib(n) el árbol tiene ~2ⁿ nodos: coste exponencial O(2ⁿ).',
      activeNodeId: null, completedNodeIds: ['f1a', 'f0a', 'f2', 'f1b', 'f3'], phase: 'done',
    },
  ],
};

const recFactorial: RecursionTreeConfig = {
  type: 'recursion-tree',
  id: 'rec-factorial',
  title: 'Árbol de llamadas: factorial(4)',
  description: 'Recursión lineal: cada llamada genera exactamente una llamada recursiva más pequeña. Coste O(n).',
  root: {
    id: 'fa4', label: 'fact(4)', returnValue: '24',
    children: [{
      id: 'fa3', label: 'fact(3)', returnValue: '6',
      children: [{
        id: 'fa2', label: 'fact(2)', returnValue: '2',
        children: [{
          id: 'fa1', label: 'fact(1)', returnValue: '1',
          children: [{ id: 'fa0', label: 'fact(0)', returnValue: '1', children: [] }],
        }],
      }],
    }],
  },
  steps: [
    { title: 'Árbol de llamadas', description: 'Recursión lineal no final: cada llamada hace UNA llamada recursiva y procesa el resultado después. La pila crece hasta n.', activeNodeId: null, completedNodeIds: [], phase: 'init' },
    { title: 'Llamar fact(4)', description: 'fact(4): 4≠0, llamamos fact(3). fact(4) queda suspendido esperando el resultado.', activeNodeId: 'fa4', completedNodeIds: [], phase: 'calling' },
    { title: 'Llamar fact(3)', description: 'fact(3): 3≠0, llamamos fact(2). Pila: [fact(4), fact(3)].', activeNodeId: 'fa3', completedNodeIds: [], phase: 'calling' },
    { title: 'Llamar fact(2)', description: 'fact(2): 2≠0, llamamos fact(1). Pila: [fact(4), fact(3), fact(2)].', activeNodeId: 'fa2', completedNodeIds: [], phase: 'calling' },
    { title: 'Llamar fact(1)', description: 'fact(1): 1≠0, llamamos fact(0). Pila: [fact(4), fact(3), fact(2), fact(1)].', activeNodeId: 'fa1', completedNodeIds: [], phase: 'calling' },
    { title: 'fact(0) → caso base', description: 'fact(0) = 1 directamente. Este es el caso base que detiene la recursión. Pila máxima alcanzada.', activeNodeId: 'fa0', completedNodeIds: [], phase: 'base-case' },
    { title: 'fact(1) = 1×1 = 1', description: 'fact(1) recibe 1 de fact(0) y calcula 1×1=1.', activeNodeId: 'fa1', completedNodeIds: ['fa0', 'fa1'], phase: 'returning' },
    { title: 'fact(2) = 2×1 = 2', description: 'fact(2) recibe 1 de fact(1) y calcula 2×1=2.', activeNodeId: 'fa2', completedNodeIds: ['fa0', 'fa1', 'fa2'], phase: 'returning' },
    { title: 'fact(3) = 3×2 = 6', description: 'fact(3) recibe 2 de fact(2) y calcula 3×2=6.', activeNodeId: 'fa3', completedNodeIds: ['fa0', 'fa1', 'fa2', 'fa3'], phase: 'returning' },
    { title: 'fact(4) = 4×6 = 24', description: 'fact(4) recibe 6 de fact(3) y calcula 4×6=24. ¡Resultado final! Coste: O(n) tiempo y espacio de pila.', activeNodeId: 'fa4', completedNodeIds: ['fa0', 'fa1', 'fa2', 'fa3', 'fa4'], phase: 'returning' },
    { title: 'Completado — coste O(n)', description: 'Árbol lineal de profundidad n=4. Exactamente n+1 nodos. Coste O(n) en tiempo y espacio. Contraste con Fibonacci que es O(2ⁿ).', activeNodeId: null, completedNodeIds: ['fa0', 'fa1', 'fa2', 'fa3', 'fa4'], phase: 'done' },
  ],
};

// ─── Backtracking ─────────────────────────────────────────────────────────────

const btBinaryStrings: BacktrackingConfig = {
  type: 'backtracking-tree',
  id: 'bt-binary-strings',
  title: 'Backtracking: cadenas con ≤1 vocal',
  description: 'Generamos cadenas de longitud 3 sobre {a,b} con como máximo UNA "a". Podamos cuando detectamos una violación.',
  root: {
    id: 'root', label: '""',
    children: [
      {
        id: 'a', label: '"a"',
        children: [
          { id: 'aa', label: '"aa"', children: [] },
          {
            id: 'ab', label: '"ab"',
            children: [
              { id: 'aba', label: '"aba"', children: [] },
              { id: 'abb', label: '"abb"', children: [] },
            ],
          },
        ],
      },
      {
        id: 'b', label: '"b"',
        children: [
          {
            id: 'ba', label: '"ba"',
            children: [
              { id: 'baa', label: '"baa"', children: [] },
              { id: 'bab', label: '"bab"', children: [] },
            ],
          },
          {
            id: 'bb', label: '"bb"',
            children: [
              { id: 'bba', label: '"bba"', children: [] },
              { id: 'bbb', label: '"bbb"', children: [] },
            ],
          },
        ],
      },
    ],
  },
  steps: [
    { title: 'Árbol de decisiones', description: 'Exploramos todas las cadenas binarias de longitud 3 sobre {a,b}. En cada nivel elegimos el siguiente carácter. Podamos cuando hay más de 1 "a".', activeNodeId: null, activePath: [], prunedNodeIds: [], solutionNodeIds: [], phase: 'init' },
    { title: 'Raíz — cadena vacía', description: 'Comenzamos con la cadena vacía "". Tenemos 2 opciones: añadir "a" o añadir "b".', activeNodeId: 'root', activePath: ['root'], prunedNodeIds: [], solutionNodeIds: [], phase: 'exploring' },
    { title: 'Probar "a"', description: 'Añadimos "a". Cadena actual: "a". Tiene 1 "a" (≤1), podemos continuar.', activeNodeId: 'a', activePath: ['root', 'a'], prunedNodeIds: [], solutionNodeIds: [], phase: 'exploring' },
    { title: 'Probar "aa" → PODA', description: '¡Añadir otra "a" daría "aa" con 2 "a"! Esto viola la restricción. PODAMOS esta rama. No exploramos los posibles hijos de "aa".', activeNodeId: 'aa', activePath: ['root', 'a', 'aa'], prunedNodeIds: ['aa'], solutionNodeIds: [], phase: 'pruning' },
    { title: 'Probar "ab"', description: 'Retrocedemos (backtrack) y probamos añadir "b". Cadena: "ab". Tiene 1 "a" (≤1), podemos continuar.', activeNodeId: 'ab', activePath: ['root', 'a', 'ab'], prunedNodeIds: ['aa'], solutionNodeIds: [], phase: 'exploring' },
    { title: 'Probar "aba" → PODA', description: 'Añadir "a" a "ab" daría "aba" con 2 "a". Violación. PODAMOS.', activeNodeId: 'aba', activePath: ['root', 'a', 'ab', 'aba'], prunedNodeIds: ['aa', 'aba'], solutionNodeIds: [], phase: 'pruning' },
    { title: '"abb" → SOLUCIÓN ✓', description: '"abb" tiene 1 "a" y longitud 3. ¡Es una solución válida! La registramos y continuamos buscando más.', activeNodeId: 'abb', activePath: ['root', 'a', 'ab', 'abb'], prunedNodeIds: ['aa', 'aba'], solutionNodeIds: ['abb'], phase: 'solution' },
    { title: 'Probar "b" (rama derecha)', description: 'Retrocedemos hasta la raíz. Ahora probamos con "b". Cadena: "b". Tiene 0 "a", podemos continuar.', activeNodeId: 'b', activePath: ['root', 'b'], prunedNodeIds: ['aa', 'aba'], solutionNodeIds: ['abb'], phase: 'exploring' },
    { title: 'Probar "ba"', description: 'Añadimos "a". Cadena: "ba". Tiene 1 "a" (≤1), podemos continuar.', activeNodeId: 'ba', activePath: ['root', 'b', 'ba'], prunedNodeIds: ['aa', 'aba'], solutionNodeIds: ['abb'], phase: 'exploring' },
    { title: 'Probar "baa" → PODA', description: '"baa" tendría 2 "a". PODAMOS esta rama.', activeNodeId: 'baa', activePath: ['root', 'b', 'ba', 'baa'], prunedNodeIds: ['aa', 'aba', 'baa'], solutionNodeIds: ['abb'], phase: 'pruning' },
    { title: '"bab" → SOLUCIÓN ✓', description: '"bab" tiene 1 "a" y longitud 3. ¡Solución válida!', activeNodeId: 'bab', activePath: ['root', 'b', 'ba', 'bab'], prunedNodeIds: ['aa', 'aba', 'baa'], solutionNodeIds: ['abb', 'bab'], phase: 'solution' },
    { title: 'Probar "bb"', description: 'Retrocedemos a "b" y probamos "b" de nuevo. Cadena: "bb". Tiene 0 "a", podemos continuar.', activeNodeId: 'bb', activePath: ['root', 'b', 'bb'], prunedNodeIds: ['aa', 'aba', 'baa'], solutionNodeIds: ['abb', 'bab'], phase: 'exploring' },
    { title: '"bba" → SOLUCIÓN ✓', description: '"bba" tiene 1 "a" y longitud 3. ¡Solución válida!', activeNodeId: 'bba', activePath: ['root', 'b', 'bb', 'bba'], prunedNodeIds: ['aa', 'aba', 'baa'], solutionNodeIds: ['abb', 'bab', 'bba'], phase: 'solution' },
    { title: '"bbb" → SOLUCIÓN ✓', description: '"bbb" tiene 0 "a" y longitud 3. ¡Solución válida! También se considera solución (satisface ≤1 "a").', activeNodeId: 'bbb', activePath: ['root', 'b', 'bb', 'bbb'], prunedNodeIds: ['aa', 'aba', 'baa'], solutionNodeIds: ['abb', 'bab', 'bba', 'bbb'], phase: 'solution' },
    { title: 'Completado — 4 soluciones, 3 podas', description: 'Hemos explorado todo el árbol. 4 soluciones válidas: "abb", "bab", "bba", "bbb". 3 ramas podadas: "aa", "aba", "baa". Sin poda habría 8 nodos hoja; con poda ahorramos trabajo.', activeNodeId: null, activePath: [], prunedNodeIds: ['aa', 'aba', 'baa'], solutionNodeIds: ['abb', 'bab', 'bba', 'bbb'], phase: 'done' },
  ],
};

const btPermutations: BacktrackingConfig = {
  type: 'backtracking-tree',
  id: 'bt-permutations',
  title: 'Backtracking: permutaciones de {1,2,3}',
  description: 'Generamos todas las permutaciones de {1,2,3} usando backtracking. Sin poda (todas son válidas).',
  root: {
    id: 'root', label: '()',
    children: [
      {
        id: 'n1', label: '(1)',
        children: [
          { id: 'n12', label: '(1,2)', children: [{ id: 'n123', label: '(1,2,3)', children: [] }] },
          { id: 'n13', label: '(1,3)', children: [{ id: 'n132', label: '(1,3,2)', children: [] }] },
        ],
      },
      {
        id: 'n2', label: '(2)',
        children: [
          { id: 'n21', label: '(2,1)', children: [{ id: 'n213', label: '(2,1,3)', children: [] }] },
          { id: 'n23', label: '(2,3)', children: [{ id: 'n231', label: '(2,3,1)', children: [] }] },
        ],
      },
      {
        id: 'n3', label: '(3)',
        children: [
          { id: 'n31', label: '(3,1)', children: [{ id: 'n312', label: '(3,1,2)', children: [] }] },
          { id: 'n32', label: '(3,2)', children: [{ id: 'n321', label: '(3,2,1)', children: [] }] },
        ],
      },
    ],
  },
  steps: [
    { title: 'Árbol de permutaciones', description: 'Para 3 elementos hay 3! = 6 permutaciones. En cada nivel elegimos el siguiente número (sin repetir). Profundidad 3, factor de ramificación decreciente.', activeNodeId: null, activePath: [], prunedNodeIds: [], solutionNodeIds: [], phase: 'init' },
    { title: 'Elegir primer elemento: 1', description: 'Primera elección: 1. Quedan disponibles {2,3}.', activeNodeId: 'n1', activePath: ['root', 'n1'], prunedNodeIds: [], solutionNodeIds: [], phase: 'exploring' },
    { title: 'Elegir segundo: 2', description: 'Segunda elección: 2. Disponibles: {3}.', activeNodeId: 'n12', activePath: ['root', 'n1', 'n12'], prunedNodeIds: [], solutionNodeIds: [], phase: 'exploring' },
    { title: '(1,2,3) → SOLUCIÓN', description: 'Solución completa: (1,2,3).', activeNodeId: 'n123', activePath: ['root', 'n1', 'n12', 'n123'], prunedNodeIds: [], solutionNodeIds: ['n123'], phase: 'solution' },
    { title: 'Elegir segundo: 3', description: 'Retrocedemos. Segunda elección: 3. Disponibles: {2}.', activeNodeId: 'n13', activePath: ['root', 'n1', 'n13'], prunedNodeIds: [], solutionNodeIds: ['n123'], phase: 'exploring' },
    { title: '(1,3,2) → SOLUCIÓN', description: 'Solución: (1,3,2).', activeNodeId: 'n132', activePath: ['root', 'n1', 'n13', 'n132'], prunedNodeIds: [], solutionNodeIds: ['n123', 'n132'], phase: 'solution' },
    { title: 'Elegir primero: 2', description: 'Retrocedemos a raíz. Primera elección: 2. Disponibles: {1,3}.', activeNodeId: 'n2', activePath: ['root', 'n2'], prunedNodeIds: [], solutionNodeIds: ['n123', 'n132'], phase: 'exploring' },
    { title: '(2,1,3) → SOLUCIÓN', description: 'Solución: (2,1,3).', activeNodeId: 'n213', activePath: ['root', 'n2', 'n21', 'n213'], prunedNodeIds: [], solutionNodeIds: ['n123', 'n132', 'n213'], phase: 'solution' },
    { title: '(2,3,1) → SOLUCIÓN', description: 'Solución: (2,3,1).', activeNodeId: 'n231', activePath: ['root', 'n2', 'n23', 'n231'], prunedNodeIds: [], solutionNodeIds: ['n123', 'n132', 'n213', 'n231'], phase: 'solution' },
    { title: '(3,1,2) y (3,2,1) → SOLUCIONES', description: 'Últimas dos soluciones con primer elemento 3.', activeNodeId: 'n321', activePath: ['root', 'n3', 'n32', 'n321'], prunedNodeIds: [], solutionNodeIds: ['n123', 'n132', 'n213', 'n231', 'n312', 'n321'], phase: 'solution' },
    { title: 'Completado — 6 permutaciones', description: '3! = 6 permutaciones encontradas. Árbol de 13 nodos, sin podas. El coste es O(n!×n) — exponencial. Para n=10 serían 36 millones de operaciones.', activeNodeId: null, activePath: [], prunedNodeIds: [], solutionNodeIds: ['n123', 'n132', 'n213', 'n231', 'n312', 'n321'], phase: 'done' },
  ],
};

// ─── Cost Analysis ────────────────────────────────────────────────────────────

const costComparison: CostAnalysisConfig = {
  type: 'cost-analysis',
  id: 'cost-comparison',
  title: 'Comparativa de complejidades algorítmicas',
  description: 'Visualiza cómo crece el tiempo de ejecución para distintos tipos de algoritmos a medida que n aumenta.',
  steps: [
    {
      title: 'O(1) — Tiempo constante',
      highlightedClass: 'O(1)',
      description: 'El tiempo de ejecución NO depende del tamaño de la entrada. Siempre la misma cantidad de operaciones, independientemente de n.',
      example: 'Acceder a v[5], comprobar si un número es par, push/pop de una pila.',
      algorithms: ['Acceso a array', 'Push/pop pila', 'Hash map insert'],
    },
    {
      title: 'O(log n) — Tiempo logarítmico',
      highlightedClass: 'O(log n)',
      description: 'El tamaño del problema se DIVIDE a la mitad en cada paso. Para n=1.000.000 solo se necesitan ~20 pasos. Crece muy lentamente.',
      example: 'Con n=1024 elementos: log₂(1024)=10 comparaciones.',
      algorithms: ['Búsqueda binaria', 'Árbol binario equilibrado', 'Euclides'],
    },
    {
      title: 'O(n) — Tiempo lineal',
      highlightedClass: 'O(n)',
      description: 'El tiempo crece proporcionalmente al tamaño de la entrada. Duplicar n duplica el tiempo. Es el mínimo posible cuando hay que examinar todos los elementos.',
      example: 'Para n=1000: hasta 1000 comparaciones. Para n=2000: hasta 2000.',
      algorithms: ['Búsqueda lineal', 'Máximo/mínimo', 'Suma de vector', 'Recorrido de lista'],
    },
    {
      title: 'O(n log n) — Tiempo cuasi-lineal',
      highlightedClass: 'O(n log n)',
      description: 'El límite inferior teórico para algoritmos de ordenación por comparación. Ligeramente peor que O(n) pero mucho mejor que O(n²).',
      example: 'Para n=1000: ~10.000 operaciones. Para n=1.000.000: ~20.000.000 operaciones.',
      algorithms: ['Merge Sort', 'Quick Sort (promedio)', 'Heap Sort'],
    },
    {
      title: 'O(n²) — Tiempo cuadrático',
      highlightedClass: 'O(n²)',
      description: 'Típico de algoritmos con dos bucles anidados sobre n elementos. Duplicar n cuadruplica el tiempo. Aceptable para n pequeño (<1000), lento para n grande.',
      example: 'Para n=1000: 1.000.000 operaciones. Para n=10.000: 100.000.000.',
      algorithms: ['Burbuja', 'Inserción', 'Selección', 'Comparar todos los pares'],
    },
    {
      title: 'O(2ⁿ) — Tiempo exponencial',
      highlightedClass: 'O(2ⁿ)',
      description: 'Cada elemento duplica el trabajo. Para n=30 ya son más de 1.000 millones de operaciones. Solo viable para n muy pequeño (≤20-25). Es el coste de fuerza bruta.',
      example: 'Para n=10: 1.024 operaciones. Para n=20: 1.048.576. Para n=30: más de 1 billón.',
      algorithms: ['Backtracking sin poda', 'Fibonacci recursivo', 'Subconjuntos', 'Torres de Hanói'],
    },
  ],
};

// ─── Registry ─────────────────────────────────────────────────────────────────

const REGISTRY: Record<string, VisualizationConfig> = {
  'vs-basic':          vsBasic,
  'vs-not-found':      vsNotFound,
  'bs-basic':          bsBasic,
  'rec-fibonacci':     recFibonacci,
  'rec-factorial':     recFactorial,
  'bt-binary-strings': btBinaryStrings,
  'bt-permutations':   btPermutations,
  'cost-comparison':   costComparison,
};

export function getVisualization(id: string): VisualizationConfig | null {
  return REGISTRY[id] ?? null;
}

export function getAllVisualizations(): VisualizationConfig[] {
  return Object.values(REGISTRY);
}

// ─── Auto-select for problems ─────────────────────────────────────────────────

export function getVisualizationForProblem(
  tema: string,
  subtipo: string,
): VisualizationConfig | null {
  const sub = subtipo.toLowerCase();
  const t   = tema.toLowerCase();

  if (t.includes('backtracking') || t.includes('vuelta atrás') || t.includes('vuelta atras')) {
    return btBinaryStrings;
  }
  if (t.includes('recursión') || t.includes('recursion')) {
    if (sub.includes('factorial')) return recFactorial;
    return recFibonacci;
  }
  if (sub.includes('búsqueda binaria') || sub.includes('busqueda binaria') || sub.includes('binaria')) {
    return bsBasic;
  }
  if (sub.includes('búsqueda') || sub.includes('busqueda') || sub.includes('recorrido')) {
    return vsBasic;
  }
  if (sub.includes('máximo') || sub.includes('maximo') || sub.includes('mínimo') || sub.includes('minimo') || sub.includes('acumulador')) {
    return vsBasic;
  }
  if (t.includes('iterativo') || t.includes('iterativos')) {
    return vsBasic;
  }
  return null;
}
