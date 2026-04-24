import type { Lesson } from '@/types/lessons';

export const tema1: Lesson = {
  id: 1,
  titulo: 'Análisis de eficiencia',
  subtitulo: 'Cómo medir y comparar el rendimiento de algoritmos',
  descripcion: 'Aprende a calcular el coste de un algoritmo usando notación asintótica y a distinguir entre O, Ω y Θ.',
  color: 'from-blue-500 to-blue-700',
  icono: '⏱️',
  topicKey: 'Tema 1_ Costes',
  duracion: '40 min',
  sections: [
    {
      id: 'por-que',
      titulo: '¿Por qué importa la eficiencia?',
      tipo: 'intro',
      icono: '🚀',
      bloques: [
        {
          tipo: 'texto',
          contenido: 'Un programa que funciona pero tarda años en dar la respuesta es inútil. La eficiencia importa porque hay problemas que, con un algoritmo malo, requieren más tiempo del que tiene el universo — aunque uses el ordenador más rápido del mundo.',
        },
        {
          tipo: 'alerta',
          nivel: 'info',
          titulo: 'El ejemplo de la pandemia',
          contenido: 'Si el número de infectados se duplica cada 3 días partiendo de 1, en 60 días hay más de un millón. En 90 días, mil millones. El crecimiento exponencial hace que un algoritmo O(2^n) sea prácticamente inutilizable para n > 50.',
        },
        {
          tipo: 'tabla',
          cabeceras: ['n', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(2^n)'],
          filas: [
            ['10', '3', '10', '33', '100', '1.024'],
            ['100', '7', '100', '664', '10.000', '10^30'],
            ['1.000', '10', '1.000', '10.000', '1.000.000', '10^301'],
            ['1.000.000', '20', '1M', '20M', '10^12', 'imposible'],
          ],
        },
        {
          tipo: 'texto',
          contenido: 'A partir de un tamaño suficientemente grande, un algoritmo de coste constante SIEMPRE será mejor que uno cuadrático, aunque para datos pequeños el cuadrático pueda parecer más rápido.',
        },
      ],
    },
    {
      id: 'coste',
      titulo: 'El coste de un algoritmo',
      tipo: 'concepto',
      icono: '📐',
      bloques: [
        {
          tipo: 'texto',
          contenido: 'El coste mide cuántos "recursos" (tiempo o memoria) consume un algoritmo en función del tamaño de la entrada. Lo que nos interesa no es el tiempo en segundos (depende del hardware), sino cómo crece el número de operaciones al aumentar n.',
        },
        {
          tipo: 'subtitulo',
          contenido: 'Caso mejor, caso peor y caso promedio',
          nivel: 3,
        },
        {
          tipo: 'comparacion',
          lado1: {
            titulo: '✅ Caso peor (lo que usamos)',
            items: [
              'Cota superior fiable para todos los casos',
              'Más fácil de calcular',
              'Garantiza que nunca tardaremos más',
              'Ejemplo: buscar en vector → el elemento no está',
            ],
          },
          lado2: {
            titulo: '⚖️ Caso promedio (a veces)',
            items: [
              'Requiere conocer distribución de datos',
              'Más complejo de calcular',
              'Útil para análisis estadístico',
              'Ejemplo: Quicksort → O(n log n) en promedio',
            ],
          },
        },
        {
          tipo: 'alerta',
          nivel: 'tip',
          contenido: 'En este curso nos centramos siempre en el CASO PEOR. Es la forma estándar de analizar algoritmos porque da una garantía para todos los datos posibles.',
        },
        {
          tipo: 'codigo',
          titulo: 'Ejemplo: búsqueda lineal',
          lenguaje: 'cpp',
          contenido: `bool search(const vector<T>& v, const T& x) {
    int i = 0;
    while (i < v.size() && v[i] != x) {
        ++i;
    }
    return i < v.size();
}`,
          explicacion: 'Caso mejor: x está en v[0] → 1 comparación → O(1). Caso peor: x no está → n comparaciones → O(n).',
        },
      ],
    },
    {
      id: 'notacion',
      titulo: 'Notación asintótica: O, Ω y Θ',
      tipo: 'concepto',
      icono: '🔣',
      bloques: [
        {
          tipo: 'texto',
          contenido: 'Las tres notaciones describen el comportamiento de una función para valores de n suficientemente grandes. No nos importan las constantes ni los términos de menor orden.',
        },
        {
          tipo: 'tabla',
          cabeceras: ['Notación', 'Significado', 'Dice que…'],
          filas: [
            ['O(g(n))', 'Cota superior', 'f(n) crece como mucho igual que g(n)'],
            ['Ω(g(n))', 'Cota inferior', 'f(n) crece al menos igual que g(n)'],
            ['Θ(g(n))', 'Cota ajustada', 'f(n) crece exactamente igual que g(n)'],
          ],
        },
        {
          tipo: 'alerta',
          nivel: 'warning',
          titulo: 'Error típico',
          contenido: 'Confundir O con Θ. Decir "la búsqueda lineal es O(n)" es correcto pero impreciso: también es O(n²) o O(n!). Lo correcto es Θ(n) cuando queremos la cota ajustada.',
        },
        {
          tipo: 'subtitulo',
          contenido: 'Reglas prácticas',
          nivel: 3,
        },
        {
          tipo: 'lista',
          items: [
            'Regla de la suma: O(f) + O(g) = O(max(f, g))  →  O(n² + n) = O(n²)',
            'Regla del producto: O(f) · O(g) = O(f · g)  →  O(n) · O(log n) = O(n log n)',
            'Constantes: O(5n) = O(n)  →  los factores constantes se ignoran',
            'Logaritmos: O(log₂ n) = O(log₁₀ n) = O(log n)  →  la base no importa',
          ],
        },
        {
          tipo: 'formula',
          contenido: 'O(1) ⊂ O(log n) ⊂ O(n) ⊂ O(n log n) ⊂ O(n²) ⊂ O(n³) ⊂ O(2^n) ⊂ O(n!)',
          explicacion: 'Esta es la jerarquía de órdenes de complejidad. Cada uno crece más rápido que el anterior.',
        },
        {
          tipo: 'alerta',
          nivel: 'info',
          titulo: '¿Cuándo un algoritmo es "preferible"?',
          contenido: 'Un algoritmo de coste O(1) SIEMPRE es preferible a uno O(n²) si el tamaño de los datos es suficientemente grande. Para tamaños pequeños, el constante podría no serlo. En los tests preguntan esto con frecuencia.',
        },
        {
          tipo: 'alerta',
          nivel: 'tip',
          titulo: 'Visualización interactiva de complejidades',
          contenido: 'El siguiente gráfico muestra cómo crecen las distintas complejidades algorítmicas con el tamaño de entrada. Usa los controles para explorar cada clase de complejidad con ejemplos concretos.',
        },
        {
          tipo: 'visualizacion',
          vizId: 'cost-comparison',
        },
      ],
    },
    {
      id: 'iterativos',
      titulo: 'Análisis de algoritmos iterativos',
      tipo: 'concepto',
      icono: '🔄',
      bloques: [
        {
          tipo: 'texto',
          contenido: 'Para calcular el coste de un algoritmo iterativo, el truco es analizar el número de veces que se ejecuta cada instrucción dentro de los bucles.',
        },
        {
          tipo: 'subtitulo',
          contenido: 'Bucle simple',
          nivel: 3,
        },
        {
          tipo: 'codigo',
          titulo: 'Bucle simple — O(n)',
          lenguaje: 'cpp',
          contenido: `for (int i = 0; i < n; i++) {
    // instrucción de coste constante O(1)
    a++;
}`,
          explicacion: 'El cuerpo se ejecuta n veces con coste O(1) cada vez → total O(n).',
        },
        {
          tipo: 'codigo',
          titulo: 'Bucles anidados — O(n²)',
          lenguaje: 'cpp',
          contenido: `for (int i = 0; i < n; i++) {
    for (int j = 0; j < n; j++) {
        a++;  // O(1)
    }
}`,
          explicacion: 'Bucle externo: n veces. Bucle interno: n veces por cada iteración externa → n × n = O(n²).',
        },
        {
          tipo: 'codigo',
          titulo: 'Bucle que divide — O(log n)',
          lenguaje: 'cpp',
          contenido: `int i = n;
while (i > 1) {
    i = i / 2;  // se divide entre 2 cada vez
}`,
          explicacion: 'Cada iteración divide i entre 2. Para llegar de n a 1 hacen falta log₂(n) pasos → O(log n).',
        },
        {
          tipo: 'codigo',
          titulo: 'Bucle con variable externa — O(max(n,m)) o similar',
          lenguaje: 'cpp',
          contenido: `int a = 0;
for (int i = 0, j = m; (i < n) || (j > 0); ++i, --j)
    a--;`,
          explicacion: 'El bucle termina cuando AMBAS condiciones fallan. Si n=5 y m=30, termina en max(n,m)=30 pasos. Si n=30 y m=5, termina en 30. El coste es Θ(max(n,m)).',
        },
        {
          tipo: 'alerta',
          nivel: 'warning',
          titulo: 'Trampa frecuente: condición OR en bucle',
          contenido: 'Con (i < n) || (j > 0), el bucle sigue mientras AL MENOS UNA condición sea verdadera. El peor caso es cuando ambas variables se mueven lento. Con m=30 fijo, el bucle siempre hace exactamente 30 iteraciones → Θ(1) porque m es constante.',
        },
        {
          tipo: 'ejemplo',
          titulo: 'Algoritmo de ordenación por selección',
          bloques: [
            {
              tipo: 'codigo',
              lenguaje: 'cpp',
              contenido: `void ordenaSeleccion(int v[], int n) {
    for (int i = 0; i < n-1; i++) {    // n-1 veces
        int pmin = i;
        for (int j = i+1; j < n; j++)  // n-i-1 veces
            if (v[j] < v[pmin])
                pmin = j;
        swap(v[i], v[pmin]);
    }
}`,
            },
            {
              tipo: 'texto',
              contenido: 'El bucle interior ejecuta (n-1) + (n-2) + ... + 1 = n(n-1)/2 comparaciones en total. Por la regla de sumas: Θ(n²). La ordenación por selección siempre es Θ(n²) en el caso peor Y mejor.',
            },
          ],
        },
      ],
    },
    {
      id: 'reduccion',
      titulo: 'Algoritmos por reducción vs. división',
      tipo: 'concepto',
      icono: '✂️',
      bloques: [
        {
          tipo: 'texto',
          contenido: 'En algoritmos recursivos, el coste se calcula con recurrencias. Hay dos esquemas básicos según cómo se reduce el tamaño del problema:',
        },
        {
          tipo: 'comparacion',
          lado1: {
            titulo: 'Por sustracción (T(n) = aT(n-b) + f(n))',
            items: [
              'Se resta b al problema (b constante)',
              'a=1: coste polinómico si f es polinómica',
              'a>1: SIEMPRE exponencial → a^(n/b)',
              'Ejemplo: fibonacci → a=2, b=1 → O(2^n)',
            ],
          },
          lado2: {
            titulo: 'Por división (T(n) = aT(n/b) + f(n))',
            items: [
              'Se divide entre b el problema',
              'f(n)∈Θ(n^k): usa el Teorema de la división',
              'a < b^k → Θ(n^k)',
              'a = b^k → Θ(n^k · log n)',
              'a > b^k → Θ(n^(log_b a))',
            ],
          },
        },
        {
          tipo: 'alerta',
          nivel: 'danger',
          titulo: 'Clave de examen',
          contenido: 'Si a > 1 en reducción por SUSTRACCIÓN, el coste siempre es exponencial (Θ(a^(n/b))), sin importar cuánto valga b. Esto es un resultado contraintuitivo que sale mucho en tests.',
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
          titulo: 'Confundir O con Θ',
          malo: '2^n + n^10 ∈ O(n^10)',
          bien: '2^n + n^10 ∈ Θ(2^n)  [por regla de la suma]',
          explicacion: 'O solo requiere que f(n) ≤ c·g(n) para n suficientemente grande. Θ requiere tanto la cota superior como inferior.',
        },
        {
          tipo: 'error-frecuente',
          titulo: 'Olvidar que el bucle también puede ser el mejor caso',
          malo: 'El caso mejor de comprobar si un vector es creciente es O(n)',
          bien: 'El caso mejor es O(1): si el primer par no cumple la propiedad, se detiene inmediatamente',
          explicacion: 'El caso mejor ocurre cuando encontramos el "fallo" en la primera iteración.',
        },
        {
          tipo: 'error-frecuente',
          titulo: 'No considerar los bucles condicionados',
          malo: 'while (b && i < n) → siempre O(n)',
          bien: 'Si b se pone a false en la primera iteración → O(1)',
          explicacion: 'Cuando hay una condición booleana como &&, el caso mejor puede ser O(1) si la condición booleana falla inmediatamente.',
        },
        {
          tipo: 'error-frecuente',
          titulo: 'Inserción en vector sin repetidos',
          malo: 'Solo hay que añadir el elemento al final → O(1)',
          bien: 'Hay que BUSCAR si ya existe antes de insertar → O(n)',
          explicacion: 'La búsqueda en un vector no ordenado requiere recorrerlo completo en el caso peor.',
        },
      ],
    },
    {
      id: 'resumen',
      titulo: 'Resumen y conexión con los tests',
      tipo: 'tests',
      icono: '🎯',
      bloques: [
        {
          tipo: 'alerta',
          nivel: 'success',
          titulo: 'Lo más importante de este tema',
          contenido: '1) Θ es la cota ajustada, O es cota superior. 2) Caso peor es lo que usamos. 3) Reducción por sustracción con a>1 → exponencial. 4) Bucle que divide → logarítmico.',
        },
        {
          tipo: 'lista',
          items: [
            'Las preguntas de examen suelen dar un fragmento de código y pedir el coste Θ exacto',
            'Ojo con bucles que tienen condición OR (||): el peor caso es cuando las dos variables se mueven independientemente',
            'Recuerda: O(1) es mejor que O(n²) solo cuando n es suficientemente grande',
            'La frase "ninguna de las anteriores" aparece cuando el coste correcto no está en las opciones',
          ],
        },
      ],
    },
  ],
};
