import type { Lesson } from '@/types/lessons';

export const tema6: Lesson = {
  id: 6,
  titulo: 'Vuelta atrás',
  subtitulo: 'Exploración sistemática del espacio de soluciones',
  descripcion: 'Aprende el esquema backtracking: cómo construir soluciones progresivamente, podar el espacio de búsqueda y resolver problemas de optimización.',
  color: 'from-slate-600 to-slate-800',
  icono: '🔙',
  topicKey: 'Tema 6_ Vuelta atrás',
  duracion: '50 min',
  sections: [
    {
      id: 'cuando-usar',
      titulo: '¿Cuándo usar Vuelta Atrás?',
      tipo: 'intro',
      icono: '🤔',
      bloques: [
        {
          tipo: 'texto',
          contenido: 'Vuelta Atrás (Backtracking) es la técnica de último recurso: se usa cuando no existe ningún algoritmo eficiente para resolver el problema y la única opción es explorar todas las soluciones posibles de forma estructurada.',
        },
        {
          tipo: 'alerta',
          nivel: 'warning',
          titulo: '¿Cuándo NO usar Backtracking?',
          contenido: 'Si existe un algoritmo greedy (voraz), dinámico, DyV u otro que resuelve el problema con menor coste, úsalo. Backtracking es fuerza bruta estructurada — su coste es exponencial o factorial en el peor caso.',
        },
        {
          tipo: 'lista',
          items: [
            '✅ Problemas de satisfactibilidad: ¿existe alguna solución que cumpla las restricciones?',
            '✅ Encontrar TODAS las soluciones válidas',
            '✅ Optimización combinatoria: encontrar la mejor solución de entre todas',
            '❌ Si existe algoritmo polinómico: Backtracking es innecesario',
          ],
        },
        {
          tipo: 'texto',
          contenido: 'La mochila 0-1 (versión entera) no se puede resolver con greedy, por eso necesita Backtracking. En cambio la mochila fraccionaria SÍ tiene solución greedy óptima.',
        },
      ],
    },
    {
      id: 'esquema',
      titulo: 'El esquema general',
      tipo: 'concepto',
      icono: '🗂️',
      bloques: [
        {
          tipo: 'texto',
          contenido: 'En Backtracking, la solución es una tupla ⟨x₀, x₁, ..., xₙ⟩ donde cada xᵢ ∈ Sᵢ. Se construye progresivamente: en cada nivel k elegimos un valor para xₖ y comprobamos si podemos continuar.',
        },
        {
          tipo: 'codigo',
          titulo: 'Esquema básico — encontrar todas las soluciones',
          lenguaje: 'cpp',
          contenido: `// k es el nivel actual (posición en la solución parcial)
void vuelta_atras(tuple& sol, int k) {
    for (c : candidatos(k)) {        // para cada posible valor en nivel k
        sol[k] = c;
        if (es_solucion(sol, k))
            procesar_solucion(sol);  // guardar, mostrar, contar...
        else if (es_completable(sol, k))
            vuelta_atras(sol, k+1); // continuar al siguiente nivel
    }
}`,
          explicacion: 'sol contiene la solución parcial hasta el nivel k-1. Para cada candidato en el nivel k, comprueba si ya es solución completa o si puede extenderse.',
        },
        {
          tipo: 'tabla',
          cabeceras: ['Función', 'Cuándo devuelve true', 'Cuándo se llama'],
          filas: [
            ['es_solucion(sol, k)', 'k es el último nivel Y las restricciones se cumplen', 'Antes de llamar recursivamente'],
            ['es_completable(sol, k)', 'k NO es el último nivel Y podría haber solución', 'Para decidir si merece la pena continuar'],
            ['candidatos(k)', 'Valores válidos para sol[k] (restricciones explícitas)', 'Al inicio del bucle de cada nivel'],
          ],
        },
        {
          tipo: 'alerta',
          nivel: 'info',
          titulo: 'Restricciones explícitas vs. implícitas',
          contenido: 'Explícitas: los conjuntos Sᵢ de donde viene cada componente (ej: xi ∈ {0,1,2,3}). Implícitas: relaciones que deben cumplir las componentes entre sí (ej: no se ataquen en el tablero de ajedrez).',
        },
      ],
    },
    {
      id: 'cuatro-reinas',
      titulo: 'Ejemplo: 4 Reinas',
      tipo: 'ejemplo',
      icono: '♛',
      bloques: [
        {
          tipo: 'texto',
          contenido: 'Colocar 4 reinas en un tablero 4×4 de forma que ninguna se ataque. La solución es una tupla ⟨x₀, x₁, x₂, x₃⟩ donde xᵢ ∈ {0,1,2,3} es la fila de la reina de la columna i.',
        },
        {
          tipo: 'codigo',
          titulo: 'Verificar si dos reinas se atacan',
          lenguaje: 'cpp',
          contenido: `bool no_ataca(const tuple& sol, int k) {
    // Comprueba que la reina en columna k no ataca a las anteriores
    bool b = true;
    int i = 0;
    while (b && i < k) {
        b = (sol[i] != sol[k])  // misma fila
         && (sol[i] - sol[k] != i - k)   // diagonal descendente
         && (sol[i] - sol[k] != k - i);  // diagonal ascendente
        ++i;
    }
    return b;
}

bool es_solucion(const tuple& sol, int k) {
    return (k == 3) && no_ataca(sol, k);
}

bool es_completable(const tuple& sol, int k) {
    return (k < 3) && no_ataca(sol, k);
}`,
        },
        {
          tipo: 'alerta',
          nivel: 'tip',
          titulo: 'Condición de diagonal',
          contenido: 'Dos reinas en (col1, fila1) y (col2, fila2) están en la misma diagonal si |col1-col2| = |fila1-fila2|. Equivalentemente: fila1-fila2 = ±(col1-col2).',
        },
      ],
    },
    {
      id: 'marcaje',
      titulo: 'Vuelta atrás con marcaje',
      tipo: 'concepto',
      icono: '🏷️',
      bloques: [
        {
          tipo: 'texto',
          contenido: 'El marcaje es una optimización que usa arrays auxiliares para evitar recalcular la función es_completable desde cero en cada llamada. En vez de comprobar si hay conflictos revisando toda la solución parcial, se mantiene un registro de qué posiciones están "bloqueadas".',
        },
        {
          tipo: 'codigo',
          titulo: '4 Reinas con marcaje — O(1) en es_completable',
          lenguaje: 'cpp',
          contenido: `bool filas[4] = {false};          // filas ocupadas
bool diag_asc[7] = {false};       // diagonales ascendentes (x+y)
bool diag_desc[7] = {false};      // diagonales descendentes (x-y+3)

void cuatro_reinas_marcaje(tuple& sol, int k) {
    for (int c = 0; c < 4; c++) {
        if (!filas[c] && !diag_asc[k+c] && !diag_desc[k-c+3]) {
            // Marcar
            sol[k] = c;
            filas[c] = diag_asc[k+c] = diag_desc[k-c+3] = true;

            if (k == 3)
                mostrar(sol);
            else
                cuatro_reinas_marcaje(sol, k+1);

            // Desmarcar (CRUCIAL: deshacer al volver)
            filas[c] = diag_asc[k+c] = diag_desc[k-c+3] = false;
        }
    }
}`,
          explicacion: 'La comprobación pasa de O(k) a O(1). El truco: al hacer backtrack, se DESMARCA lo que se marcó.',
        },
        {
          tipo: 'alerta',
          nivel: 'danger',
          titulo: 'El desmarcar es OBLIGATORIO',
          contenido: 'Si no desmarcas al hacer backtrack, los niveles superiores seguirán viendo las posiciones como bloqueadas aunque ya no estemos en esa rama. Es el error más común en backtracking con marcaje.',
        },
      ],
    },
    {
      id: 'optimizacion',
      titulo: 'Backtracking con optimización',
      tipo: 'concepto',
      icono: '🏆',
      bloques: [
        {
          tipo: 'texto',
          contenido: 'Cuando queremos MINIMIZAR o MAXIMIZAR, el esquema cambia: llevamos registro de la mejor solución encontrada hasta ahora (coste_min o coste_max) y usamos podas para evitar explorar ramas que no pueden mejorarla.',
        },
        {
          tipo: 'codigo',
          titulo: 'Esquema de optimización',
          lenguaje: 'cpp',
          contenido: `void vuelta_atras_opt(tuple& sol, int k, int& mejor_coste) {
    for (c : candidatos(k)) {
        sol[k] = c;
        if (es_solucion(sol, k)) {
            int coste_actual = calcular_coste(sol);
            if (coste_actual < mejor_coste) {
                mejor_coste = coste_actual;
                guardar_mejor_sol(sol);
            }
        } else if (es_completable(sol, k)
                && poda_optimalidad(sol, k, mejor_coste)) {
            vuelta_atras_opt(sol, k+1, mejor_coste);
        }
    }
}`,
        },
        {
          tipo: 'tabla',
          cabeceras: ['Tipo de poda', 'Cuándo se usa', 'Efectividad'],
          filas: [
            ['Satisfactibilidad', 'Cuando la solución parcial viola restricciones (imposible extender)', 'Siempre: evita ramas sin solución'],
            ['Optimalidad', 'Cuando la solución parcial ya es peor que la mejor encontrada', 'Cuando el coste solo puede crecer'],
          ],
        },
        {
          tipo: 'alerta',
          nivel: 'warning',
          titulo: 'Coste de la poda',
          contenido: 'La poda de optimalidad puede ser tan costosa que no compense: si calcular la poda es más caro que el ahorro que produce, el algoritmo total puede ser más lento. Es una decisión de diseño que depende del problema.',
        },
      ],
    },
    {
      id: 'mochila',
      titulo: 'Mochila 0-1: ejemplo de optimización',
      tipo: 'ejemplo',
      icono: '🎒',
      bloques: [
        {
          tipo: 'texto',
          contenido: 'Dado un conjunto de objetos con pesos y valores, y una mochila con capacidad máxima, ¿qué objetos meter para maximizar el valor sin superar la capacidad?',
        },
        {
          tipo: 'alerta',
          nivel: 'info',
          titulo: '¿Por qué no sirve greedy?',
          contenido: 'Ninguna estrategia greedy funciona: ni mayor valor, ni menor peso, ni mayor valor/peso. Contraejemplo: mochila peso 6, objetos {peso:5,valor:10} y {peso:2,valor:6} y {peso:3,valor:5}. El greedy por valor da 10, pero {6,5}={11} es mejor.',
        },
        {
          tipo: 'codigo',
          titulo: 'Esquema de solución con backtracking',
          lenguaje: 'cpp',
          contenido: `// sol[k] = true si metemos el objeto k, false si no
// pago = coste acumulado, max_val = mejor valor encontrado
void mochila(int k, int peso_actual, int val_actual,
             int& max_val, tuple& mejor_sol) {
    if (k == N) {  // hemos decidido sobre todos los objetos
        if (val_actual > max_val) {
            max_val = val_actual;
            guardar(mejor_sol);
        }
        return;
    }

    // PODA satisfactibilidad: si me excedo de peso, no continúo
    // PODA optimalidad: si aunque meta todo lo que queda no mejoro
    if (poda_satisfactibilidad(k, peso_actual)
     && poda_optimalidad(k, val_actual, max_val)) {

        // Opción 1: meter el objeto k
        if (peso_actual + peso[k] <= capacidad) {
            sol[k] = true;
            mochila(k+1, peso_actual + peso[k], val_actual + valor[k],
                    max_val, mejor_sol);
        }

        // Opción 2: no meter el objeto k
        sol[k] = false;
        mochila(k+1, peso_actual, val_actual, max_val, mejor_sol);
    }
}`,
        },
      ],
    },
    {
      id: 'complejidad',
      titulo: 'Complejidad y limitaciones',
      tipo: 'concepto',
      icono: '📊',
      bloques: [
        {
          tipo: 'texto',
          contenido: 'Sin podas, el árbol de exploración tiene tamaño proporcional a a^h (a opciones por nivel, h niveles). Con podas eficientes puede reducirse enormemente, pero el peor caso sigue siendo exponencial.',
        },
        {
          tipo: 'alerta',
          nivel: 'info',
          titulo: 'No todos los backtrackings son exponenciales',
          contenido: 'Si el espacio de soluciones es polinómico, el backtracking también puede serlo. En la práctica, con buenas podas los algoritmos backtracking son aplicables a instancias medianas de muchos problemas reales.',
        },
        {
          tipo: 'lista',
          items: [
            'Árbol de exploración: altura h = longitud de la solución, anchura a = nº candidatos por nivel',
            'Sin podas: coste = a^h (exponencial o factorial)',
            'Con podas: se eliminan ramas enteras; en la práctica puede ser mucho mejor',
            'Solo aplicable a instancias pequeñas o medianas',
          ],
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
          titulo: 'No desmarcar al hacer backtrack',
          malo: 'filas[c] = true; vuelta_atras(sol, k+1); // sin desmarcar',
          bien: 'filas[c] = true; vuelta_atras(sol, k+1); filas[c] = false;',
          explicacion: 'El desmarque es el "volver atrás". Sin él, las restricciones quedan activas para otras ramas y se pierden soluciones válidas.',
        },
        {
          tipo: 'error-frecuente',
          titulo: 'Confundir es_solucion con es_completable',
          malo: 'es_solucion retorna true cuando k < N (no es completa todavía)',
          bien: 'es_solucion retorna true solo cuando k = N-1 (último nivel) y se cumplen todas las restricciones',
          explicacion: 'es_solucion verifica que la tupla está completa y es válida. es_completable verifica que la tupla parcial puede extenderse a una solución.',
        },
        {
          tipo: 'error-frecuente',
          titulo: 'La poda de optimalidad no siempre compensa',
          malo: '"Siempre es mejor añadir poda de optimalidad"',
          bien: 'Si la poda es costosa de calcular, puede no valer la pena',
          explicacion: 'La poda reduce nodos explorados, pero si el cálculo de la poda consume más tiempo del que ahorra, el algoritmo es más lento con ella.',
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
          contenido: '1) Backtracking = construir soluciones progresivamente, deshacer si no funciona. 2) Siempre DESMARCAR al retroceder. 3) Dos tipos de poda: satisfactibilidad (viola restricciones) y optimalidad (no puede mejorar). 4) La poda puede no compensar si es costosa.',
        },
        {
          tipo: 'lista',
          items: [
            'La mochila entera NO se puede resolver con greedy → necesita backtracking',
            'Todos los algoritmos backtracking son exponenciales en el PEOR caso',
            'Con marcaje, la verificación de restricciones pasa de O(k) a O(1)',
            'Función de factibilidad = es_completable (¿puede esta solución parcial extenderse?)',
          ],
        },
      ],
    },
  ],
};
