<div align="center">
  <h1>🧠 Algorithms Mastery & Training Workbench</h1>
  <p><i>Un repositorio open-source completo para estudiar computación, complejidad algorítmica y estructuras de datos de forma progresiva.</i></p>
</div>

---

## 💡 Sobre el Proyecto

Este repositorio es una recopilación estructurada y abierta para aprender, probar y consolidar conceptos avanzados del diseño de algoritmos. Está enfocado al perfeccionamiento técnico e incluye un exhaustivo entorno de evaluación de conocimientos. 

El proyecto se divide en diferentes **módulos prácticos** implementados con C++, así como una poderosa herramienta de extracción automatizada de tests alimentada por Inteligencia Artificial para medir el desempeño de forma dinámica.

---

## 🗂️ Estructura del Repositorio

El aprendizaje se divide en diferentes lecciones lógicas que acompañan al estudiante desde el entendimiento de la complejidad de los programas, hasta las resoluciones más abstractas como la recursividad o el *backtracking*:

- **`lessons/`** — Implementaciones en C++:
  - **`1 /`** Análisis de Costes y Búsquedas (`busquedas.cpp`).
  - **`2 /`** Especificación Algorítmica y Abstracción.
  - **`3 /`** Diseño robusto de algoritmos iterativos.
  - **`4 /`** Recursión y saltos generativos.
  - **`5 /`** Divide y Vencerás (*Divide & Conquer*), algoritmos de ordenación (`ordenaciones.cpp`).
  - **`6 /`** Vuelta Atrás (*Backtracking*) para optimización de caminos (`papanoel_draft.cpp`, `matricula.cpp`).

- **`/imagenes`** — Colección de capturas correspondientes a cuestionarios y evaluaciones teóricas de todos los módulos.
- **`/json`** — Repositorio procesado de los test. Preguntas de evaluación teórica digitalizadas nativamente y almacenadas como *arrays* de datos estructurados para su fácil consulta.
- **`extract.js`** — Herramienta interna de OCR que procesa los tests y los integra al repositorio automáticamente usando visión computacional.

---

## 🤖 Sistema Híbrido de Extracción (OCR Automático)

Para convertir el material visual de evaluación teórica al esquema estructurado de `/json`, este repositorio integra el script especializado de Node.js: `extract.js`. 

Este módulo nativo **corta y adapta digitalmente** cualquier imagen enorme gracias a la librearía `sharp` y emplea **Visión-Lenguaje Multimodal avanzada (GPT-4o)** para asegurar extracciones estructurales perfectas y evitar la degradación de texto. 

### ▶️ Uso del módulo de extracción:

Añade los archivos en la carpeta `/imagenes`. Puedes correr la canalización así para exportar automáticamente al repositorio de los JSON limpios sin duplicados:

```bash
# Configura tu API key
export OPENAI_API_KEY="sk-tu-api-key"

# Instala dependencias necesarias
npm install sharp

# Inicia la extracción
node extract.js
```

---

## 🌐 Aplicación Web Interactiva & GitHub Pages

Para facilitar el estudio, el repositorio incluye nativamente una **Web App Single-Page** diseñada con técnicas "Glassmorphism" y modo oscuro optimizado. Esta interfaz consume la base de datos `db.json` compilada por el extractor y permite a los alumnos realizar test interactivos sin bajarse los archivos ni leer código.

### ¿Cómo alojarla en GitHub Pages (Gratis)?
El repositorio está configurado estructuralmente para funcionar out-of-the-box (de fábrica) en la Web.
1. Sube tu repositorio a GitHub.
2. Ve a los ajustes de tu repositorio > **Pages**.
3. En la sección "Build and Deployment", bajo *Source*, selecciona "Deploy from a branch" y elige la rama `main`, carpeta de raíz (`/root`).
4. Haz clic en "Save". ¡En menos de 1 minuto tendrás un enlace público a tu propia aplicación de simulación interactiva!

---

## 🚀 Cómo Empezar a Entrenar

1. Clona este repositorio localmente.
2. Navega al directorio `/lessons` correspondientemente según el contenido que te interese consolidar (p.ej.: `cd lessons/5/`).
3. Compila el algoritmo C++ de pruebas en tu máquina o sistema usando GCC (o tu compilador C++ favorito):
   \`g++ -o app ordenaciones.cpp\` y ejecútalo con \`./app\`.
4. Complementa el aprendizaje con las evaluaciones teóricas mapeando las preguntas guardadas en `/json/Tema X.json`.

---

## 🛠 Entorno y Tecnología recomendada

* **C++11/C++17** para las lógicas de algoritmos.
* **Node.js (LTS)** entorno de OCR y parseo.
* **Sharp** manipulación gráfica desatendida.

---

> **Aviso:** El material compilado aquí pretende potenciar la cultura general de estructuras de datos orientada a mejorar las habilidades lógicas y preparaciones avanzadas en programación o entrevistas técnicas.
