import type { Lesson } from '@/types/lessons';

export const tema2: Lesson = {
  id: 2,
  titulo: 'Especificación de algoritmos',
  subtitulo: 'Cómo describir formalmente qué hace un algoritmo',
  descripcion: 'Aprende a escribir especificaciones pre/post correctas usando lógica de primer orden y cuantificadores.',
  color: 'from-violet-500 to-violet-700',
  icono: '📋',
  topicKey: 'Tema 3_ Diseño de algoritmos iterativos',
  duracion: '35 min',
  sections: [
    {
      id: 'que-es',
      titulo: '¿Qué es especificar?',
      tipo: 'intro',
      icono: '🎯',
      bloques: [
        {
          tipo: 'texto',
          contenido: 'Especificar es describir QUÉ hace un algoritmo, sin decir CÓMO lo hace. Es un contrato entre el usuario (quien llama a la función) y el implementador (quien la escribe). La especificación es independiente del lenguaje de programación.',
        },
        {
          tipo: 'comparacion',
          lado1: {
            titulo: '📝 Especificar (QUÉ)',
            items: [
              'Describe el problema a resolver',
              'Define qué datos acepta (precondición)',
              'Define qué garantiza producir (postcondición)',
              'No dice cómo implementarlo',
              'Lenguaje: lógica de predicados',
            ],
          },
          lado2: {
            titulo: '💻 Implementar (CÓMO)',
            items: [
              'Escribe el código que resuelve el problema',
              'Debe cumplir la especificación',
              'Puede haber múltiples implementaciones válidas',
              'Lenguaje: C++, Python, etc.',
              'Solo válida si cumple pre/post',
            ],
          },
        },
        {
          tipo: 'alerta',
          nivel: 'info',
          titulo: 'La especificación como contrato',
          contenido: 'Si el usuario llama a la función cumpliendo la precondición, el implementador garantiza que se cumple la postcondición. Si el usuario viola la precondición, no se puede garantizar nada sobre el resultado.',
        },
        {
          tipo: 'codigo',
          titulo: 'Ejemplo: sin especificación (ambiguo)',
          lenguaje: 'cpp',
          contenido: `bool essuma(const vector<int>& v, int n)`,
          explicacion: '¿Qué pasa si n=0? ¿Si n es negativo? ¿Si n > v.size()? ¿Qué significa "suma de los anteriores" para v[0]? La cabecera sola no responde nada.',
        },
        {
          tipo: 'codigo',
          titulo: 'Con especificación (preciso)',
          lenguaje: 'cpp',
          contenido: `// {0 ≤ n ≤ 1000}
bool essuma(const vector<int>& v, const int n)  /* dev b */
// {b = ∃i: 0 ≤ i < n : v[i] = Σj: 0 ≤ j < i : v[j]}`,
          explicacion: 'Ahora está claro: n debe ser [0, 1000]. Si n=0 devuelve false. Si v[0]=0 devuelve true (suma de ningún elemento anterior = 0).',
        },
      ],
    },
    {
      id: 'logica',
      titulo: 'Lógica de primer orden: lo que necesitas saber',
      tipo: 'concepto',
      icono: '🔣',
      bloques: [
        {
          tipo: 'texto',
          contenido: 'Para escribir especificaciones usamos lógica de primer orden. No necesitas saber todo — solo las construcciones que aparecen en este curso.',
        },
        {
          tipo: 'tabla',
          cabeceras: ['Símbolo', 'Nombre', 'Ejemplo', 'Significado'],
          filas: [
            ['∧', 'Y lógico (AND)', 'P ∧ Q', 'P y Q son verdad'],
            ['∨', 'O lógico (OR)', 'P ∨ Q', 'P o Q (o ambos)'],
            ['¬', 'Negación', '¬P', 'P es falso'],
            ['→', 'Implicación', 'P → Q', 'Si P entonces Q'],
            ['∀i: R: P', 'Para todo', '∀i: 0≤i<n: v[i]≥0', 'Para todo i en rango R, P es cierto'],
            ['∃i: R: P', 'Existe', '∃i: 0≤i<n: v[i]=x', 'Existe algún i en R donde P es cierto'],
            ['Σi: R: e', 'Suma', 'Σi: 0≤i<n: v[i]', 'Suma de e para todo i en R'],
            ['#i: R: P', 'Cuenta', '#i: 0≤i<n: v[i]>0', 'Número de i en R donde P es cierto'],
            ['Πi: R: e', 'Producto', 'Πi: 0≤i<n: a[i]', 'Producto de e para todo i en R'],
            ['↑i: R: e', 'Máximo', '↑i: 0≤i<n: v[i]', 'Máximo de e para todo i en R'],
          ],
        },
        {
          tipo: 'alerta',
          nivel: 'tip',
          titulo: 'Notación de la asignatura',
          contenido: 'La notación cuantificada usa la forma: OPERADOR variable: RANGO: EXPRESIÓN. El rango delimita los valores de la variable. Si el rango es vacío, la suma vale 0, el producto vale 1, el máximo no está definido.',
        },
        {
          tipo: 'subtitulo',
          contenido: 'Ejemplos de predicados',
          nivel: 3,
        },
        {
          tipo: 'codigo',
          titulo: 'Predicados típicos en especificaciones',
          lenguaje: 'cpp',
          contenido: `// ∀i: 0 ≤ i < n : v[i] ≥ 0
//   "todos los elementos de v[0..n) son no negativos"

// ∃j: 0 ≤ j < n : v[j] = x
//   "existe algún elemento en v[0..n) igual a x"

// Σi: 0 ≤ i < n : v[i]
//   "suma de todos los elementos de v[0..n)"

// #i: 0 ≤ i < n : v[i] % 2 = 0
//   "cantidad de elementos pares en v[0..n)"

// ∀i: 0 ≤ i < n-1 : v[i] ≤ v[i+1]
//   "v está ordenado de forma no decreciente"`,
        },
      ],
    },
    {
      id: 'especificacion-funciones',
      titulo: 'Cómo escribir una especificación completa',
      tipo: 'concepto',
      icono: '✍️',
      bloques: [
        {
          tipo: 'texto',
          contenido: 'Una especificación completa tiene tres partes: la precondición (entre llaves antes), la cabecera de la función, y la postcondición (entre llaves después).',
        },
        {
          tipo: 'codigo',
          titulo: 'Estructura general',
          lenguaje: 'cpp',
          contenido: `// {PRECONDICIÓN}
tipo_retorno nombreFuncion(tipo param)  /* dev nombre_retorno */
// {POSTCONDICIÓN}`,
          explicacion: 'La precondición describe qué debe cumplir la entrada. La postcondición relaciona la entrada con la salida.',
        },
        {
          tipo: 'ejemplo',
          titulo: 'Especificación: contar pares',
          bloques: [
            {
              tipo: 'codigo',
              lenguaje: 'cpp',
              contenido: `// {0 ≤ n ≤ longitud(a)}
int contarPares(const vector<int>& a, const int n)  /* dev c */
// {c = #i: 0 ≤ i < n : a[i] % 2 = 0}`,
            },
            {
              tipo: 'texto',
              contenido: 'La precondición dice que n es válido. La postcondición dice que c es exactamente el número de pares en a[0..n).',
            },
          ],
        },
        {
          tipo: 'ejemplo',
          titulo: 'Especificación: producto de array',
          bloques: [
            {
              tipo: 'codigo',
              lenguaje: 'cpp',
              contenido: `// {0 ≤ n ≤ longitud(a)}
int producto(const vector<int>& a, const int n)  /* dev p */
// {p = Πi: 0 ≤ i < n : a[i]}`,
            },
            {
              tipo: 'alerta',
              nivel: 'info',
              contenido: 'Si n=0, el rango 0 ≤ i < 0 está vacío. El producto vacío es 1 (el elemento neutro del producto), por convenio.',
            },
          ],
        },
        {
          tipo: 'ejemplo',
          titulo: 'Especificación: búsqueda binaria',
          bloques: [
            {
              tipo: 'codigo',
              lenguaje: 'cpp',
              contenido: `// {0 ≤ n ≤ longitud(v)  ∧  ∀i: 0 ≤ i < n-1 : v[i] ≤ v[i+1]}
pair<bool,int> busquedaBinaria(const vector<int>& v, const int n, const int x)  /* dev (b,p) */
// {(b ∧ v[p] = x ∧ 0 ≤ p < n)  ∨  (¬b ∧ ∀i: 0 ≤ i < n: v[i] ≠ x)}`,
            },
            {
              tipo: 'texto',
              contenido: 'La precondición exige que el vector esté ordenado. La postcondición dice: o bien encontramos x en la posición p, o bien x no está en v.',
            },
          ],
        },
      ],
    },
    {
      id: 'propiedades',
      titulo: 'Propiedades de especificaciones',
      tipo: 'concepto',
      icono: '⚡',
      bloques: [
        {
          tipo: 'texto',
          contenido: 'Una buena especificación debe ser precisa (sin ambigüedades), breve (más corta que el código) y clara (transmite la intuición). Tres propiedades que a veces están en tensión.',
        },
        {
          tipo: 'alerta',
          nivel: 'warning',
          titulo: 'Precondición más débil posible',
          contenido: 'Queremos que la función sea aplicable al mayor número de entradas posibles. Por eso buscamos la precondición más débil (menos restrictiva) que permita garantizar la postcondición.',
        },
        {
          tipo: 'lista',
          items: [
            'Fortalecimiento de precondición: si {P} A {Q}, entonces {P\' ⇒ P} A {Q}. Hacer la precondición más restrictiva sigue siendo válido.',
            'Debilitamiento de postcondición: si {P} A {Q} y Q ⇒ Q\', entonces {P} A {Q\'}. Una postcondición menos precisa también se cumple.',
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
          titulo: 'Olvidar que el rango vacío tiene valor definido',
          malo: 'Si n=0, la suma Σi: 0≤i<0: v[i] no está definida',
          bien: 'El rango vacío da el elemento neutro: suma=0, producto=1',
          explicacion: 'En lógica, ∀i en rango vacío es true. ∃i en rango vacío es false. La suma vacía es 0.',
        },
        {
          tipo: 'error-frecuente',
          titulo: 'Confundir precondición con la aserción del código',
          malo: 'La precondición es parte del código y se ejecuta',
          bien: 'La precondición es solo una anotación formal. No se compila.',
          explicacion: 'En C++ las precondiciones/postcondiciones van como comentarios // { ... }. No son código ejecutable.',
        },
        {
          tipo: 'error-frecuente',
          titulo: 'Postcondición que no diferencia bien',
          malo: 'Si el valor no está: {b = false}',
          bien: '{(b ∧ v[p]=x) ∨ (¬b ∧ ∀i: 0≤i<n: v[i]≠x)}',
          explicacion: 'La postcondición debe cubrir TODOS los casos posibles y relacionar la salida con la entrada de forma unívoca.',
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
          titulo: 'Lo más importante',
          contenido: '1) Especificar es definir QUÉ, no CÓMO. 2) Precondición = obligación del usuario. Postcondición = garantía del implementador. 3) Domina los cuantificadores ∀, ∃, Σ, #. 4) El rango vacío tiene valores definidos.',
        },
        {
          tipo: 'lista',
          items: [
            'En los tests te dan una especificación y preguntan qué hace la función o si un invariante es correcto',
            'Practica leer predicados con cuantificadores: identifica el rango y la propiedad',
            'Distingue bien entre ∀ (para todo, más fuerte) y ∃ (existe alguno, más débil)',
            'Los invariantes de bucle del Tema 3 se escriben igual que las especificaciones pre/post',
          ],
        },
      ],
    },
  ],
};
