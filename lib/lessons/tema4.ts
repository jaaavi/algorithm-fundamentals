import type { Lesson } from '@/types/lessons';

export const tema4: Lesson = {
  id: 4,
  titulo: 'Diseño recursivo',
  subtitulo: 'Resolver problemas descomponiéndolos en versiones más simples de sí mismos',
  descripcion: 'Aprende los tipos de recursión, cómo verificar su corrección, calcular su eficiencia y los algoritmos de ordenación clásicos.',
  color: 'from-amber-500 to-orange-600',
  icono: '🌀',
  topicKey: 'Tema 4_ Recursión',
  duracion: '60 min',
  sections: [
    {
      id: 'que-es',
      titulo: '¿Qué es la recursión?',
      tipo: 'intro',
      icono: '🔁',
      bloques: [
        {
          tipo: 'texto',
          contenido: 'La recursión permite que una función se llame a sí misma. La clave está en que cada llamada resuelve una versión más pequeña del mismo problema, hasta llegar a un caso tan simple que se resuelve directamente.',
        },
        {
          tipo: 'alerta',
          nivel: 'info',
          titulo: 'La magia de la recursión',
          contenido: 'Para diseñar un algoritmo recursivo, ASUME que la función ya funciona correctamente para datos más pequeños. No pienses en cómo funciona internamente. Simplemente usa el resultado de la llamada recursiva como si fuera correcto.',
        },
        {
          tipo: 'codigo',
          titulo: 'Estructura básica de todo algoritmo recursivo',
          lenguaje: 'cpp',
          contenido: `T1 f(T2 x) {
    if (B(x))
        return trivial(x);   // CASO BASE: se resuelve directamente
    else
        return comp(f(x_a), x);  // CASO RECURSIVO: usa f en un dato más simple
}`,
          explicacion: 'B(x) es la condición del caso base. x_a es un dato más simple que x (ej: n-1). comp combina el resultado recursivo con x.',
        },
      ],
    },
    {
      id: 'tipos',
      titulo: 'Tipos de recursión',
      tipo: 'concepto',
      icono: '🗂️',
      bloques: [
        {
          tipo: 'tabla',
          cabeceras: ['Tipo', 'Descripción', 'Ejemplo clásico', 'Coste típico'],
          filas: [
            ['Lineal no final', 'Una llamada recursiva; el resultado se procesa después', 'factorial(n) = n * factorial(n-1)', 'O(n)'],
            ['Lineal final', 'Una llamada recursiva; su resultado se devuelve directamente', 'euclides(a, b)', 'O(n)'],
            ['Múltiple', 'Más de una llamada recursiva por invocación', 'fibonacci(n) = fib(n-1) + fib(n-2)', 'O(2^n)'],
            ['Anidada (mutuamente)', 'A llama a B que llama a A', 'isEven/isOdd', 'Varía'],
          ],
        },
        {
          tipo: 'codigo',
          titulo: 'Recursión lineal NO final — factorial',
          lenguaje: 'cpp',
          contenido: `// {n >= 0}
int factorial(const int n)  /* dev y */ {
    int y;
    if (n == 0)     // CASO BASE
        y = 1;
    else            // CASO RECURSIVO: procesa el resultado de f(n-1)
        y = n * factorial(n-1);
    return y;
}
// {y = n!}`,
          explicacion: 'No final porque después de factorial(n-1) hay que multiplicar por n. La pila de llamadas crece hasta n.',
        },
        {
          tipo: 'codigo',
          titulo: 'Recursión lineal FINAL — euclides',
          lenguaje: 'cpp',
          contenido: `// {a > 0  ∧  b > 0}
int euclides(const int a, const int b)  /* dev mcd */ {
    int mcd;
    if (a == b)         // CASO BASE
        mcd = a;
    else if (a > b)     // CASO RECURSIVO FINAL
        mcd = euclides(a - b, b);
    else
        mcd = euclides(a, b - a);
    return mcd;
}
// {mcd = MCD(a, b)}`,
          explicacion: 'Final porque el resultado de la llamada recursiva se devuelve directamente sin procesarlo. Se puede convertir en iterativo sin usar pila.',
        },
        {
          tipo: 'codigo',
          titulo: 'Recursión MÚLTIPLE — fibonacci',
          lenguaje: 'cpp',
          contenido: `// {n >= 0}
int fibonacci(const int n)  /* dev f */ {
    int f;
    if (n == 0 || n == 1)   // CASO BASE
        f = n;
    else                     // DOS llamadas recursivas
        f = fibonacci(n-1) + fibonacci(n-2);
    return f;
}
// {f = fib(n)}`,
          explicacion: 'Dos llamadas recursivas → árbol de llamadas exponencial → O(2^n). Muy ineficiente para n grande. Cada valor se recalcula múltiples veces.',
        },
        {
          tipo: 'alerta',
          nivel: 'danger',
          titulo: 'Recursión múltiple = exponencial (casi siempre)',
          contenido: 'Con a llamadas recursivas y reducción por sustracción de 1, el coste es O(a^n). fibonacci con a=2 → O(2^n). Esto es muy caro para n > 40.',
        },
      ],
    },
    {
      id: 'verificacion',
      titulo: 'Verificación de algoritmos recursivos',
      tipo: 'concepto',
      icono: '✅',
      bloques: [
        {
          tipo: 'texto',
          contenido: 'La corrección de un algoritmo recursivo se demuestra por inducción. Hay 5 condiciones que demostrar (4 de corrección + 1 de terminación):',
        },
        {
          tipo: 'lista-numerada',
          items: [
            'EXHAUSTIVIDAD: los casos base y recursivo cubren todos los posibles valores válidos. P(x) ⇒ Bbase(x) ∨ Brec(x)',
            'CASO BASE correcto: trivial(x) cumple la postcondición cuando x es caso base',
            'PRECONDICIÓN recursiva: la llamada recursiva se hace con datos que cumplen la precondición. P(x) ∧ Brec(x) ⇒ P(x_a)',
            'INDUCCIÓN: si asumimos que f(x_a) es correcto, entonces comp(f(x_a), x) es correcto',
            'TERMINACIÓN: existe función de cota t(x) ≥ 0 que decrece en cada llamada recursiva',
          ],
        },
        {
          tipo: 'ejemplo',
          titulo: 'Verificación de factorial',
          bloques: [
            {
              tipo: 'codigo',
              lenguaje: 'cpp',
              contenido: `// {n >= 0}  factorial(n)  {y = n!}`,
            },
            {
              tipo: 'lista',
              items: [
                '1. EXHAUSTIVIDAD: n≥0 ⇒ n=0 ∨ n>0. ✓',
                '2. CASO BASE: n=0 → y=1=0! ✓',
                '3. PRECONDICIÓN: n>0 → n-1≥0 (precondición de factorial). ✓',
                '4. INDUCCIÓN: Asumimos factorial(n-1)=(n-1)!. Entonces n*(n-1)! = n! ✓',
                '5. TERMINACIÓN: t(n) = n, que es ≥ 0 y decrece en cada llamada (de n a n-1). ✓',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'eficiencia',
      titulo: 'Eficiencia de algoritmos recursivos',
      tipo: 'concepto',
      icono: '📊',
      bloques: [
        {
          tipo: 'texto',
          contenido: 'El coste de un algoritmo recursivo se expresa como una recurrencia T(n). Hay dos casos principales:',
        },
        {
          tipo: 'comparacion',
          lado1: {
            titulo: 'Por sustracción: T(n) = aT(n-b) + f(n)',
            items: [
              'a=1: coste = n·f(n) si f es constante → O(n)',
              'a>1: SIEMPRE exponencial → Θ(a^(n/b))',
              'Ejemplo: factorial (a=1,b=1,f=O(1)) → O(n)',
              'Ejemplo: fibonacci (a=2,b=1,f=O(1)) → O(2^n)',
            ],
          },
          lado2: {
            titulo: 'Por división: T(n) = aT(n/b) + f(n)',
            items: [
              'Aplica el Teorema de la División (Master)',
              'f(n)∈Θ(n^k):',
              '  a < b^k → Θ(n^k)',
              '  a = b^k → Θ(n^k · log n)',
              '  a > b^k → Θ(n^(log_b a))',
              'Ejemplo: búsqueda binaria → Θ(log n)',
            ],
          },
        },
        {
          tipo: 'ejemplo',
          titulo: 'Búsqueda binaria: T(n) = T(n/2) + O(1)',
          bloques: [
            {
              tipo: 'formula',
              contenido: 'T(n) = T(n/2) + c  →  a=1, b=2, k=0  →  a = b^k (1 = 2^0 = 1)  →  Θ(n^0 · log n) = Θ(log n)',
            },
          ],
        },
        {
          tipo: 'ejemplo',
          titulo: 'Mergesort: T(n) = 2T(n/2) + O(n)',
          bloques: [
            {
              tipo: 'formula',
              contenido: 'T(n) = 2T(n/2) + cn  →  a=2, b=2, k=1  →  a = b^k (2 = 2^1 = 2)  →  Θ(n · log n)',
            },
          ],
        },
      ],
    },
    {
      id: 'quicksort-mergesort',
      titulo: 'Quicksort y Mergesort',
      tipo: 'ejemplo',
      icono: '🔀',
      bloques: [
        {
          tipo: 'subtitulo',
          contenido: 'Quicksort',
          nivel: 3,
        },
        {
          tipo: 'texto',
          contenido: 'Quicksort divide el vector usando un pivote: los menores a la izquierda, los mayores a la derecha. Luego ordena recursivamente cada mitad.',
        },
        {
          tipo: 'codigo',
          titulo: 'Partición y Quicksort',
          lenguaje: 'cpp',
          contenido: `// Partición con 3 zonas: menores, iguales, mayores
struct par { int a, b; };

par particion(vector<int>& v, int ini, int fin) {
    int pivote = v[ini];
    int k = ini, a = ini, b = fin;
    while (k <= b) {
        if (v[k] == pivote)      ++k;
        else if (v[k] < pivote) { swap(v[k], v[a]); ++a; ++k; }
        else                    { swap(v[k], v[b]); --b; }
    }
    return {a, b};  // [ini,a) menores, [a,b] iguales, (b,fin] mayores
}

void quickSort(vector<int>& v, int ini, int fin) {
    if (ini < fin) {
        par idx = particion(v, ini, fin);
        quickSort(v, ini, idx.a - 1);
        quickSort(v, idx.b + 1, fin);
    }
}`,
        },
        {
          tipo: 'tabla',
          cabeceras: ['Caso', 'Coste', '¿Cuándo ocurre?'],
          filas: [
            ['Mejor', 'Θ(n log n)', 'El pivote siempre divide en mitades iguales'],
            ['Promedio', 'Θ(n log n)', 'En la mayoría de casos con pivote aleatorio'],
            ['Peor', 'Θ(n²)', 'Vector ya ordenado con pivote = primer elemento'],
          ],
        },
        {
          tipo: 'alerta',
          nivel: 'warning',
          titulo: 'Los peores casos de Quicksort',
          contenido: 'Con pivote = primer elemento: vector ordenado y vector ordenado inversamente son ambos casos PEORES (todos los elementos van a un lado). El pivote queda en un extremo y hay n-1 elementos en el subproblema mayor.',
        },
        {
          tipo: 'subtitulo',
          contenido: 'Mergesort',
          nivel: 3,
        },
        {
          tipo: 'codigo',
          titulo: 'Mergesort — siempre Θ(n log n)',
          lenguaje: 'cpp',
          contenido: `void mezcla(vector<int>& v, int ini, int m, int fin) {
    int i = ini, j = m + 1;
    vector<int> aux(fin - ini + 1);
    int k = 0;
    while (i <= m && j <= fin) {
        if (v[i] < v[j]) aux[k++] = v[i++];
        else              aux[k++] = v[j++];
    }
    while (i <= m)   aux[k++] = v[i++];
    while (j <= fin) aux[k++] = v[j++];
    for (int l = 0; l < aux.size(); l++) v[ini + l] = aux[l];
}

void mergeSort(vector<int>& v, int ini, int fin) {
    if (ini < fin) {
        int m = (ini + fin) / 2;
        mergeSort(v, ini, m);
        mergeSort(v, m + 1, fin);
        mezcla(v, ini, m, fin);
    }
}`,
          explicacion: 'Mergesort siempre parte en 2 mitades y mezcla en O(n). T(n) = 2T(n/2) + O(n) → Θ(n log n) en todos los casos.',
        },
        {
          tipo: 'comparacion',
          lado1: {
            titulo: '⚡ Quicksort',
            items: [
              'Θ(n log n) mejor y promedio',
              'Θ(n²) caso peor',
              'In-place: no necesita memoria extra',
              'En práctica: más rápido que Mergesort',
              'Peor con datos ya ordenados',
            ],
          },
          lado2: {
            titulo: '🔒 Mergesort',
            items: [
              'Θ(n log n) SIEMPRE (mejor, promedio, peor)',
              'Necesita O(n) memoria auxiliar',
              'Estable: mantiene orden relativo de iguales',
              'Más predecible que Quicksort',
              'Preferido cuando la garantía importa',
            ],
          },
        },
      ],
    },
    {
      id: 'busqueda-binaria',
      titulo: 'Búsqueda binaria recursiva',
      tipo: 'ejemplo',
      icono: '🔍',
      bloques: [
        {
          tipo: 'texto',
          contenido: 'La búsqueda binaria es el ejemplo canónico de algoritmo divide-y-vencerás recursivo con coste logarítmico.',
        },
        {
          tipo: 'codigo',
          titulo: 'Búsqueda binaria recursiva — Θ(log n)',
          lenguaje: 'cpp',
          contenido: `// Busca en v[i, f)  (intervalo abierto por la derecha)
pair<bool, int> busqueda_bin_rec(const vector<int>& v, int valor, int i, int f) {
    if (i >= f) {  // CASO BASE: intervalo vacío o un elemento
        return {i < v.size() && v[i] == valor, i};
    }
    int m = (i + f) / 2;
    if (v[m] < valor)
        return busqueda_bin_rec(v, valor, m + 1, f);  // buscar a la derecha
    else
        return busqueda_bin_rec(v, valor, i, m);       // buscar a la izquierda
}

pair<bool, int> busqueda_binaria(const vector<int>& v, int valor) {
    return busqueda_bin_rec(v, valor, 0, v.size());
}`,
          explicacion: 'En cada llamada el intervalo se divide a la mitad. Máximo log₂(n) llamadas → O(log n).',
        },
      ],
    },
    {
      id: 'errores',
      titulo: 'Errores frecuentes',
      tipo: 'errores',
      icono: '⚠️',
      bloques: [
        {
          tipo: 'error-frecuente',
          titulo: 'Olvidar el caso base',
          malo: 'int factorial(int n) { return n * factorial(n-1); }',
          bien: 'if (n == 0) return 1; else return n * factorial(n-1);',
          explicacion: 'Sin caso base el algoritmo recursiona infinitamente (stack overflow).',
        },
        {
          tipo: 'error-frecuente',
          titulo: 'Confundir recursión lineal final con no final',
          malo: 'euclides es no final porque hay comparaciones antes de la llamada',
          bien: 'euclides ES final: el resultado de la llamada recursiva SE DEVUELVE directamente (return euclides(...))',
          explicacion: 'Final = el resultado de la llamada recursiva es el resultado de la función, sin ningún procesamiento posterior.',
        },
        {
          tipo: 'error-frecuente',
          titulo: 'Pensar que todos los elementos iguales son caso peor de Quicksort',
          malo: 'Todos los elementos iguales es un caso peor de Quicksort',
          bien: 'Con partición en 3 zonas (menores/iguales/mayores), todos iguales van a la zona "iguales" → O(n)',
          explicacion: 'Con la implementación de 3 zonas, todos los iguales se excluyen de las llamadas recursivas. El caso peor real es cuando el pivote queda en un extremo.',
        },
      ],
    },
    {
      id: 'resumen',
      titulo: 'Resumen y conexión con tests',
      tipo: 'tests',
      icono: '🎯',
      bloques: [
        {
          tipo: 'alerta',
          nivel: 'success',
          titulo: 'Lo esencial',
          contenido: '1) Final = el resultado se devuelve sin procesar. 2) Múltiple → exponencial. 3) Para calcular coste: recurrencia + teorema de la división. 4) Quicksort: O(n²) en peor caso (vector ordenado con pivote en extremo). 5) Mergesort: Θ(n log n) siempre.',
        },
        {
          tipo: 'lista',
          items: [
            'Los tests preguntan: ¿cuándo no termina este algoritmo? → cuando el argumento no decrece hacia el caso base',
            'Recurrencia T(n)=T(n-1)+T(n-2)+c → como fibonacci → O(2^n)',
            'Recurrencia con sustracción y a>1 → SIEMPRE exponencial',
            'Los casos peores de Quicksort: vector ordenado de forma ESTRICTA (elementos distintos)',
          ],
        },
      ],
    },
  ],
};
