import type { Lesson } from '@/types/lessons';

export const tema5: Lesson = {
  id: 5,
  titulo: 'Divide y vencerás',
  subtitulo: 'El esquema algorítmico que divide, resuelve y combina',
  descripcion: 'Aprende el esquema DyV, el Teorema de la División y los problemas clásicos: selección, suma de vector y subvector de suma máxima.',
  color: 'from-rose-500 to-red-600',
  icono: '⚔️',
  topicKey: 'Tema 5_ Divide y vencerás',
  duracion: '45 min',
  sections: [
    {
      id: 'esquema',
      titulo: 'El esquema Divide y Vencerás',
      tipo: 'intro',
      icono: '🗡️',
      bloques: [
        {
          tipo: 'texto',
          contenido: 'Divide y Vencerás (DyV) es un caso especial de diseño recursivo con una característica clave: los subproblemas generados son instancias del mismo problema pero de MENOR TAMAÑO, y se generan k ≥ 2 subproblemas (o 1 pero que se divide por un factor ≥ 2).',
        },
        {
          tipo: 'lista-numerada',
          items: [
            'DIVIDE: descomponer el problema en k subproblemas más pequeños del mismo tipo',
            'RESUELVE: resolver cada subproblema recursivamente (o directamente si es suficientemente pequeño)',
            'COMBINA: unir las soluciones de los subproblemas para construir la solución del problema original',
          ],
        },
        {
          tipo: 'codigo',
          titulo: 'Esquema general DyV',
          lenguaje: 'cpp',
          contenido: `tSol divide_y_venceras(T x) {
    if (pequeño(x))
        return metodo_directo(x);  // caso base
    else {
        // Divide: x en k subproblemas x1, ..., xk
        // Resuelve: yi = divide_y_venceras(xi) para cada i
        // Combina: y = combina(y1, ..., yk)
        return y;
    }
}`,
        },
        {
          tipo: 'alerta',
          nivel: 'info',
          titulo: 'DyV vs. recursión simple',
          contenido: 'En DyV el tamaño del problema se DIVIDE (reduce por factor > 1), no solo se resta. Esto es lo que le da la eficiencia logarítmica o n·log(n). La diferencia con recursión simple: en DyV siempre se divide por al menos 2.',
        },
        {
          tipo: 'alerta',
          nivel: 'tip',
          titulo: 'Divide y vencerás en acción: búsqueda binaria',
          contenido: 'La búsqueda binaria es el ejemplo canónico de DyV: divide el espacio de búsqueda por 2 en cada paso. Observa cómo se descartan mitades enteras del vector.',
        },
        {
          tipo: 'visualizacion',
          vizId: 'bs-basic',
        },
      ],
    },
    {
      id: 'costes',
      titulo: 'Calculando el coste: Teorema de la División',
      tipo: 'concepto',
      icono: '📐',
      bloques: [
        {
          tipo: 'texto',
          contenido: 'El coste de un algoritmo DyV se expresa como T(n) = aT(n/b) + f(n). Si f(n) ∈ Θ(n^k):',
        },
        {
          tipo: 'tabla',
          cabeceras: ['Caso', 'Condición', 'Coste', 'Ejemplo'],
          filas: [
            ['Combinar domina', 'a < b^k', 'Θ(n^k)', 'búsqueda en vector: a=2, b=2, k=0 → a>b^k, no aplica'],
            ['Equilibrado', 'a = b^k', 'Θ(n^k · log n)', 'Mergesort: a=2, b=2, k=1 → 2=2^1 → Θ(n log n)'],
            ['Dividir domina', 'a > b^k', 'Θ(n^(log_b a))', 'a=4, b=2, k=1 → 4>2 → Θ(n^(log_2 4)) = Θ(n²)'],
          ],
        },
        {
          tipo: 'alerta',
          nivel: 'tip',
          titulo: 'Cómo aplicar el teorema paso a paso',
          contenido: '1) Identifica a (nº subproblemas), b (factor de división), k (grado de f(n)). 2) Compara a con b^k. 3) Aplica la fórmula correspondiente.',
        },
        {
          tipo: 'ejemplo',
          titulo: 'Ejercicio: T(n) = 3T(n/2) + Θ(n)',
          bloques: [
            {
              tipo: 'formula',
              contenido: 'a=3, b=2, k=1  →  b^k = 2^1 = 2  →  a > b^k (3 > 2)  →  Θ(n^(log_2 3)) ≈ Θ(n^1.58)',
              explicacion: 'El coste de dividir domina. log_2(3) ≈ 1.58.',
            },
          ],
        },
        {
          tipo: 'alerta',
          nivel: 'warning',
          titulo: 'Para obtener eficiencia con DyV',
          contenido: 'Maximiza b (divide en trozos más grandes), minimiza a (genera menos subproblemas) y minimiza k (hace que la combinación sea más barata). Si el coste sale igual o peor que el algoritmo existente, DyV no merece la pena.',
        },
      ],
    },
    {
      id: 'seleccion',
      titulo: 'Problema de selección: el k-ésimo menor',
      tipo: 'ejemplo',
      icono: '🎯',
      bloques: [
        {
          tipo: 'texto',
          contenido: 'Dado un vector y un valor k, encontrar el k-ésimo menor elemento. La mediana es el caso especial k = ⌈n/2⌉.',
        },
        {
          tipo: 'comparacion',
          lado1: {
            titulo: 'Solución naive: ordenar',
            items: [
              'Ordenar el vector: O(n log n)',
              'Acceder a la posición k',
              'Total: Θ(n log n)',
              'Innecesariamente lento',
            ],
          },
          lado2: {
            titulo: 'DyV con partición: O(n) esperado',
            items: [
              'Particionar con Quicksort',
              'Solo seguir por un lado',
              'T(n) = T(n/2) + O(n) en promedio',
              'Caso peor O(n²) con mal pivote',
            ],
          },
        },
        {
          tipo: 'codigo',
          titulo: 'Selección con partición — O(n²) peor caso',
          lenguaje: 'cpp',
          contenido: `// Busca el k-ésimo menor en v[c..f]
int seleccion(const vector<int>& v, int c, int f, int k) {
    if (c == f)
        return v[c];     // caso base: un solo elemento
    int p, q;
    particion(v, c, f, v[c], p, q);  // particiona con v[c] como pivote
    if (p <= k && k <= q)
        return v[k];       // k está en la zona de iguales
    else if (k < p)
        return seleccion(v, c, p-1, k);   // buscar en menores
    else
        return seleccion(v, q+1, f, k);   // buscar en mayores
}`,
          explicacion: 'Solo se hace UNA llamada recursiva (no combinación → simplemente se sigue por un lado). Caso peor O(n²) si el pivote siempre queda en un extremo.',
        },
        {
          tipo: 'alerta',
          nivel: 'info',
          titulo: 'Mediana de medianas: garantiza O(n)',
          contenido: 'Para garantizar O(n) en todos los casos: dividir en grupos de 5, calcular la mediana de cada grupo, y usar la mediana de esas medianas como pivote. Esto asegura que el pivote siempre divide al menos al 30% del vector.',
        },
      ],
    },
    {
      id: 'suma-vector',
      titulo: 'Suma de un vector con DyV',
      tipo: 'ejemplo',
      icono: '➕',
      bloques: [
        {
          tipo: 'texto',
          contenido: 'Calcular la suma de un vector con DyV es un ejemplo ilustrativo, aunque el algoritmo iterativo O(n) es igual de bueno.',
        },
        {
          tipo: 'codigo',
          titulo: 'Suma DyV — Θ(n)',
          lenguaje: 'cpp',
          contenido: `// Suma v[i..f) con DyV
int suma_dyv(const vector<int>& v, int i, int f) {
    if (f - i == 0) return 0;      // caso base: vacío
    if (f - i == 1) return v[i];   // caso base: un elemento
    int m = (i + f) / 2;
    return suma_dyv(v, i, m) + suma_dyv(v, m, f);
}`,
        },
        {
          tipo: 'formula',
          contenido: 'T(n) = 2T(n/2) + O(1)  →  a=2, b=2, k=0  →  a > b^k (2 > 1)  →  Θ(n^(log_2 2)) = Θ(n)',
          explicacion: 'El coste de dividir domina. Como combinar cuesta O(1) y se generan 2 subproblemas de la mitad, el coste es lineal.',
        },
        {
          tipo: 'alerta',
          nivel: 'warning',
          contenido: 'La suma iterativa también es O(n). DyV no mejora el coste aquí. Este ejemplo sirve para entender el esquema, no para ser más eficiente.',
        },
      ],
    },
    {
      id: 'subvector-maximo',
      titulo: 'Subvector de suma máxima',
      tipo: 'ejemplo',
      icono: '📈',
      bloques: [
        {
          tipo: 'texto',
          contenido: 'Dado un vector de enteros (con negativos), encontrar el subvector contiguo con mayor suma. Ejemplo: [-2, 1, -3, 4, -1, 2, 1, -5, 4] → el subvector [4,-1,2,1] tiene suma 6.',
        },
        {
          tipo: 'tabla',
          cabeceras: ['Algoritmo', 'Coste', 'Idea'],
          filas: [
            ['Fuerza bruta', 'Θ(n³)', 'Probar todos los pares (i,j)'],
            ['DyV', 'Θ(n log n)', 'Dividir en mitades; el máximo cruza el centro o no'],
            ['Kadane (iterativo)', 'Θ(n)', 'Acumulador que se resetea al hacerse negativo'],
          ],
        },
        {
          tipo: 'texto',
          contenido: 'La solución DyV tiene coste Θ(n log n): T(n) = 2T(n/2) + O(n) ya que encontrar el subvector que cruza el centro requiere O(n). No es la más eficiente pero ilustra el esquema.',
        },
        {
          tipo: 'alerta',
          nivel: 'tip',
          titulo: 'El truco del subvector cruzado',
          contenido: 'El subvector de suma máxima o está en la mitad izquierda, o en la derecha, o CRUZA el punto medio. Para el cruzado: se extiende desde m hacia la izquierda lo más posible y desde m+1 hacia la derecha lo más posible.',
        },
      ],
    },
    {
      id: 'cuando-usar',
      titulo: '¿Cuándo aplicar DyV?',
      tipo: 'concepto',
      icono: '🤔',
      bloques: [
        {
          tipo: 'lista',
          items: [
            '✅ Cuando el problema se puede dividir naturalmente en subproblemas del mismo tipo',
            '✅ Cuando combinar las soluciones es barato (O(n) o mejor)',
            '✅ Cuando el número de subproblemas y el factor de división dan un coste mejor que el algoritmo existente',
            '❌ NO si el coste DyV es igual o peor que el algoritmo existente',
            '❌ NO si la combinación es costosa (anula el beneficio de dividir)',
          ],
        },
        {
          tipo: 'alerta',
          nivel: 'warning',
          titulo: 'DyV vs. recursión simple',
          contenido: 'No toda recursión es DyV. Para ser DyV debe haber división por factor > 1. Búsqueda lineal recursiva con T(n) = T(n-1) + O(1) es recursión por SUSTRACCIÓN, no DyV, y tiene coste O(n) como el iterativo.',
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
          titulo: 'Aplicar el Teorema cuando f(n) no es polinómica',
          malo: 'T(n) = 2T(n/2) + O(n log n) → f(n) es n log n, ¿qué k uso?',
          bien: 'El Teorema de la División solo aplica directamente si f(n) ∈ Θ(n^k). Si f tiene logaritmos, hay que resolver la recurrencia de otra forma.',
          explicacion: 'En este curso, las recurrencias de examen siempre tienen f(n) ∈ Θ(n^k) para algún k entero.',
        },
        {
          tipo: 'error-frecuente',
          titulo: 'Confundir a y b',
          malo: 'T(n) = 4T(n/2) + n: a=2, b=4',
          bien: 'a es el número de llamadas recursivas (4), b es el factor de división (2)',
          explicacion: 'a = nº subproblemas generados. b = factor por el que se divide el tamaño.',
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
          contenido: '1) DyV = divide (factor>1) + resuelve subproblemas + combina. 2) Teorema: identificar a, b, k, comparar a con b^k. 3) No siempre mejora: compara con el coste existente. 4) Selección puede ser O(n) con buen pivote.',
        },
        {
          tipo: 'lista',
          items: [
            'Las preguntas de tests piden aplicar el Teorema a recurrencias concretas',
            'Recurrencia T(n)=2T(n/2)+c (c constante) → a=2,b=2,k=0 → a>b^k → Θ(n)',
            'Si f(n) no es polinómica, el Teorema estándar no aplica',
            'La suma de un vector con DyV tiene el mismo coste que iterativo → DyV no aporta aquí',
          ],
        },
      ],
    },
  ],
};
