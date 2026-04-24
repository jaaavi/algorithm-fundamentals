import type { Lesson } from '@/types/lessons';

export const tema3: Lesson = {
  id: 3,
  titulo: 'Algoritmos iterativos',
  subtitulo: 'Verificación y derivación de bucles correctos',
  descripcion: 'Aprende a demostrar que un bucle es correcto usando invariantes y semántica axiomática, y a derivar algoritmos desde su especificación.',
  color: 'from-emerald-500 to-emerald-700',
  icono: '🔄',
  topicKey: 'Tema 3_ Diseño de algoritmos iterativos',
  duracion: '55 min',
  sections: [
    {
      id: 'motivacion',
      titulo: '¿Por qué verificar?',
      tipo: 'intro',
      icono: '🤔',
      bloques: [
        {
          tipo: 'texto',
          contenido: 'Programar no es suficiente: necesitamos saber que lo que hemos programado ES CORRECTO. El testing solo muestra que no hay errores en los casos probados. La verificación formal demuestra que el programa es correcto para TODOS los casos posibles.',
        },
        {
          tipo: 'comparacion',
          lado1: {
            titulo: '🧪 Testing',
            items: [
              'Solo prueba casos concretos',
              '"No hay errores en estos 100 casos"',
              'No garantiza corrección total',
              'Útil en la práctica, pero no suficiente',
            ],
          },
          lado2: {
            titulo: '✅ Verificación formal',
            items: [
              'Razona sobre TODOS los casos',
              '"El programa es correcto para cualquier entrada válida"',
              'Garantiza corrección total',
              'Permite también DERIVAR algoritmos',
            ],
          },
        },
        {
          tipo: 'texto',
          contenido: 'En este tema usamos la semántica axiomática de Hoare: un sistema de reglas que nos permite razonar sobre instrucciones C++ sin ejecutarlas.',
        },
        {
          tipo: 'alerta',
          nivel: 'tip',
          titulo: 'Ejemplo: búsqueda lineal iterativa',
          contenido: 'El siguiente visualizador muestra cómo funciona un bucle de búsqueda paso a paso. Observa cómo el invariante "todos los elementos anteriores al índice i no son el buscado" se mantiene en cada iteración.',
        },
        {
          tipo: 'visualizacion',
          vizId: 'vs-basic',
        },
      ],
    },
    {
      id: 'reglas-basicas',
      titulo: 'Reglas básicas de verificación',
      tipo: 'concepto',
      icono: '📐',
      bloques: [
        {
          tipo: 'texto',
          contenido: 'Una tripleta de Hoare {P} A {Q} significa: "si se ejecuta A partiendo de un estado que satisface P, y A termina, entonces el estado final satisface Q".',
        },
        {
          tipo: 'tabla',
          cabeceras: ['Regla', 'Condición', 'Resultado'],
          filas: [
            ['Fortalecimiento precondición', 'P\' ⇒ P  y  {P} A {Q}', '{P\'} A {Q}'],
            ['Debilitamiento postcondición', '{P} A {Q}  y  Q ⇒ Q\'', '{P} A {Q\'}'],
            ['Instrucción vacía', '—', '{P} skip {P}'],
            ['Asignación', '—', '{Q[x←e]} x=e {Q}'],
            ['Secuencia', '{P}A{R}  y  {R}B{Q}', '{P} A;B {Q}'],
          ],
        },
        {
          tipo: 'alerta',
          nivel: 'warning',
          titulo: 'La asignación se verifica al revés',
          contenido: 'Para {P} x=e {Q}, calculamos P = Q[x←e]: sustituimos x por e en Q y ese es el P necesario. Ejemplo: {Q[x←e]} = {y=x+1}[x←3] = {y=4}.',
        },
        {
          tipo: 'codigo',
          titulo: 'Ejemplo: verificar una asignación',
          lenguaje: 'cpp',
          contenido: `// Queremos demostrar: {n ≥ 0} y = n + 1 {y > 0}
// Calculamos pmd(y = n+1, y > 0):
//   Sustituimos y por n+1 en (y > 0): (n+1 > 0) = (n > -1) = (n ≥ 0)
// Como la precondición dada (n ≥ 0) implica (n ≥ 0), la tripleta es correcta.`,
        },
      ],
    },
    {
      id: 'invariantes',
      titulo: 'Invariante de bucle: el corazón del tema',
      tipo: 'concepto',
      icono: '🔑',
      bloques: [
        {
          tipo: 'texto',
          contenido: 'El invariante de bucle I es un predicado que es verdadero al inicio del bucle, se mantiene verdadero después de cada iteración, y junto con la negación de la condición del bucle implica la postcondición.',
        },
        {
          tipo: 'formula',
          contenido: 'Regla del bucle while: {I ∧ B} cuerpo {I}    (I ∧ ¬B) ⇒ Q',
          explicacion: 'I = invariante. B = condición del bucle. Al salir: se cumple I (por ser invariante) y ¬B (porque salimos). De I ∧ ¬B debemos poder deducir Q (postcondición).',
        },
        {
          tipo: 'alerta',
          nivel: 'info',
          titulo: 'Las 4 condiciones que debe cumplir un invariante',
          contenido: '1) INICIO: la precondición implica el invariante al entrar. 2) MANTENIMIENTO: si I ∧ B antes del cuerpo, entonces I después. 3) FIN: I ∧ ¬B implica la postcondición. 4) TERMINACIÓN: el bucle siempre termina (función de cota decreciente).',
        },
        {
          tipo: 'ejemplo',
          titulo: 'Verificación completa: contar pares',
          bloques: [
            {
              tipo: 'codigo',
              lenguaje: 'cpp',
              contenido: `// Especificación:
// {0 ≤ n ≤ longitud(a)}
// int contarPares(const vector<int>& a, int n) /* dev c */
// {c = #i: 0 ≤ i < n : a[i] % 2 = 0}

int contarPares(const vector<int>& a, int n) {
    int c = 0, k = -1;
    // INVARIANTE: -1 ≤ k < n  ∧  c = #i: 0 ≤ i ≤ k : a[i]%2 = 0
    while (k < n-1) {
        k = k + 1;
        if (a[k] % 2 == 0) c = c + 1;
    }
    return c;
}`,
            },
            {
              tipo: 'lista-numerada',
              items: [
                'INICIO: k=-1, c=0. El rango 0≤i≤-1 está vacío → c=0=#i en rango vacío. ✓',
                'MANTENIMIENTO: Si k<n-1, hacemos k++ y actualizamos c. El invariante se mantiene. ✓',
                'FIN: Al salir, ¬(k<n-1) → k=n-1. Con el invariante: c=#i:0≤i<n:a[i]%2=0. ✓',
                'TERMINACIÓN: n-1-k decrece en 1 cada iteración hasta 0. ✓',
              ],
            },
          ],
        },
        {
          tipo: 'alerta',
          nivel: 'tip',
          titulo: 'Truco para encontrar el invariante',
          contenido: 'El invariante suele ser la postcondición "generalizada" reemplazando n por k (o f por f-k). Piensa: "¿qué propiedad parcial se cumple después de k iteraciones?"',
        },
      ],
    },
    {
      id: 'esquemas',
      titulo: 'Esquemas algorítmicos iterativos',
      tipo: 'concepto',
      icono: '🗂️',
      bloques: [
        {
          tipo: 'texto',
          contenido: 'La mayoría de algoritmos iterativos siguen uno de estos esquemas. Reconocerlos te permite diseñar y verificar algoritmos más fácilmente.',
        },
        {
          tipo: 'subtitulo',
          contenido: '1. Búsqueda lineal',
          nivel: 3,
        },
        {
          tipo: 'codigo',
          titulo: 'Patrón: buscar elemento que cumple propiedad P',
          lenguaje: 'cpp',
          contenido: `// {0 ≤ n ≤ longitud(v)}
// int busqueda(vector<int> v, int n, int x)  /* dev p */
// {(0 ≤ p < n ∧ v[p]=x ∧ ∀j: 0≤j<p: v[j]≠x) ∨ (p=n ∧ ∀j:0≤j<n:v[j]≠x)}

int busqueda(const vector<int>& v, int n, int x) {
    int i = 0;
    // INV: 0 ≤ i ≤ n  ∧  ∀j: 0 ≤ j < i : v[j] ≠ x
    while (i < n && v[i] != x) {
        i++;
    }
    return i;
}`,
          explicacion: 'Al salir: o bien v[i]=x (encontrado) o bien i=n (no encontrado). El invariante garantiza que antes de i no está x.',
        },
        {
          tipo: 'subtitulo',
          contenido: '2. Variables acumuladoras',
          nivel: 3,
        },
        {
          tipo: 'codigo',
          titulo: 'Patrón: calcular propiedad acumulativa',
          lenguaje: 'cpp',
          contenido: `// Suma de v[0..n)
// INV: 0 ≤ k ≤ n  ∧  s = Σi: 0 ≤ i < k : v[i]
int suma = 0, k = 0;
while (k < n) {
    suma += v[k];
    k++;
}`,
        },
        {
          tipo: 'subtitulo',
          contenido: '3. Búsqueda binaria',
          nivel: 3,
        },
        {
          tipo: 'codigo',
          titulo: 'Búsqueda binaria — O(log n)',
          lenguaje: 'cpp',
          contenido: `// {0 ≤ n = longitud(v)  ∧  ∀i: 0≤i<n-1: v[i]≤v[i+1]}
// INV: 0 ≤ i ≤ f ≤ n  ∧
//      ∀j: 0≤j<i: v[j]<x  ∧  ∀j: f≤j<n: v[j]≥x
pair<bool,int> busqueda_binaria(const vector<int>& v, int x) {
    int i = 0, f = v.size();
    while (i < f) {
        int m = (i + f) / 2;
        if (v[m] < x)
            i = m + 1;  // x está a la derecha
        else
            f = m;      // x está a la izquierda o es v[m]
    }
    return {i < v.size() && v[i] == x, i};
}`,
          explicacion: 'En cada iteración el intervalo [i,f) se reduce a la mitad. Al salir, i=f y v[i] es la primera posición ≥ x.',
        },
        {
          tipo: 'subtitulo',
          contenido: '4. Ventana deslizante',
          nivel: 3,
        },
        {
          tipo: 'codigo',
          titulo: 'Patrón: ventana de tamaño k sobre el vector',
          lenguaje: 'cpp',
          contenido: `// Busca subvector de longitud k con suma máxima
// INV: la ventana [i-k, i) está procesada
int i = 0, suma = 0, maxSuma = INT_MIN;
// Inicializar primera ventana
for (int j = 0; j < k; j++) suma += v[j];
maxSuma = suma;
// Desplazar ventana
while (i + k < n) {
    suma += v[i + k] - v[i];
    maxSuma = max(maxSuma, suma);
    i++;
}`,
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
          titulo: 'Invariante incorrecto: el rango es k < n en vez de k ≤ n',
          malo: 'INV: 0 ≤ k < n  ∧  c = #i: 0 ≤ i < k : ...',
          bien: 'INV: -1 ≤ k < n  ∧  c = #i: 0 ≤ i ≤ k : ...',
          explicacion: 'Depende de si k empieza en -1 (y el rango es 0≤i≤k) o en 0 (y el rango es 0≤i<k). Hay que ser coherente con la inicialización.',
        },
        {
          tipo: 'error-frecuente',
          titulo: 'La búsqueda binaria con intervalo abierto vs cerrado',
          malo: 'Mezclar [i, f] y [i, f) → condiciones de salida incorrectas',
          bien: 'Elegir un convenio y ser consistente: nosotros usamos [i, f) abierto por la derecha',
          explicacion: 'Con [i,f): el bucle es while(i<f), el punto medio es m=(i+f)/2, i=m+1 o f=m. Con [i,f]: el bucle es while(i≤f), i=m+1 o f=m-1.',
        },
        {
          tipo: 'error-frecuente',
          titulo: 'Invariante que no implica la postcondición',
          malo: 'INV: c = #i: 0≤i<k: a[i]%2=0  (sin la condición de rango de k)',
          bien: 'INV: -1 ≤ k < n  ∧  c = #i: 0≤i≤k: a[i]%2=0',
          explicacion: 'Al salir del bucle (k=n-1), necesitas la condición de rango para que I ∧ ¬B implique la postcondición.',
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
          contenido: '1) El invariante debe cumplir: inicio, mantenimiento, fin, terminación. 2) Al salir del bucle: I ∧ ¬B → postcondición. 3) Los invariantes son especificaciones pre/post del cuerpo del bucle.',
        },
        {
          tipo: 'lista',
          items: [
            'Los tests dan un bucle con invariante propuesto y preguntan si es correcto',
            'Verifica siempre las 4 condiciones, especialmente que I ∧ ¬B → Q',
            'El algoritmo contarPares con k inicializado a -1 es un ejemplo clásico',
            'Busqueda binaria: con [i,f) abierto, la invariante es "x estaría en [i,f) si existe"',
          ],
        },
      ],
    },
  ],
};
