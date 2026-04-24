<div align="center">
  <h1>🧠 Fundamentos de los Algoritmos & Plataforma de Entrenamiento</h1>
  <p><i>Un ecosistema open-source completo para estudiar computación, complejidad algorítmica, y estructuras de datos con un entorno de entrenamiento interactivo.</i></p>

  <a href="https://algorithm-fundamentals.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/🚀_Acceso_a_la_Plataforma-algorithm--fundamentals.vercel.app-blue?style=for-the-badge&logo=vercel" alt="Probar la Aplicación Web en Vivo" />
  </a>
</div>

<br />

## 💡 Sobre el Proyecto

Este repositorio es una recopilación estructurada y abierta para aprender, probar y consolidar conceptos avanzados del diseño de algoritmos (Fundamentos de los Algoritmos / Algoritmia). Está enfocado al perfeccionamiento técnico e incluye un exhaustivo entorno de evaluación de conocimientos.

La plataforma destaca por combinar una **base teórica sólida en C++** con una **herramienta web interactiva en Next.js** para practicar problemas, realizar tests teóricos y visualizar tu progreso. Además, integra una potente herramienta de extracción automatizada OCR alimentada por Inteligencia Artificial para digitalizar exámenes y problemas físicos.

---

## 🚀 La Plataforma Interactiva (Next.js)

Para facilitar el estudio práctico, este repositorio incluye una **aplicación web moderna construida con Next.js y React** orientada al rendimiento y la experiencia de usuario (UI/UX). 

Puedes probar la versión en vivo alojada en Vercel aquí: **[🔗 algorithm-fundamentals.vercel.app](https://algorithm-fundamentals.vercel.app)**

### Características Principales:
- **Práctica de Tests y Problemas:** Motor de evaluación para preguntas tipo test y problemas de desarrollo.
- **Lecciones Teóricas:** Resúmenes y esquemas de los principales temas (Análisis de Costes, Diseño Iterativo, Recursión, Divide y Vencerás, Backtracking).
- **Repetición Espaciada y Estadísticas:** Un dashboard integrado (usando Zustand) para guardar tu progreso, fallos recurrentes y medir tu rendimiento de cara a exámenes.
- **Diseño Moderno y Responsivo:** Tailwind CSS, modo oscuro optimizado y diseño fluido para repasar en móvil o PC.

> **¿Quieres desplegar tu propia copia?**  
> Es 100% compatible con [Vercel](https://vercel.com). Solo necesitas conectar tu repositorio de GitHub a Vercel y se desplegará automáticamente (Zero-config).

---

## 🗂️ Estructura del Repositorio (Código y Datos)

El aprendizaje se divide en diferentes bloques lógicos, cubriendo desde la complejidad de los programas hasta las resoluciones más abstractas:

- **`app/` y `components/`** — Código fuente de la plataforma interactiva (Next.js, React, Tailwind).
- **`lessons/`** — Implementaciones en código nativo (C++) de algoritmos de búsqueda, ordenación, y esquemas de diseño algorítmico.
- **`/json` y `/problems-json`** — Repositorios estructurados de conocimiento. Preguntas teóricas y problemas digitalizados nativamente y almacenados en formato JSON.
- **`extract.js` / `extract-problems.js`** — Herramientas internas de OCR (Visión Computacional) que procesan tests o PDFs en imágenes y extraen información estructurada.

---

## 🤖 Sistema Híbrido de Extracción (OCR con IA)

Para convertir el material visual (PDFs y capturas de test) al esquema JSON, este repositorio integra scripts especializados en Node.js que emplean modelos fundacionales como **GPT-4o**.

El módulo segmenta digitalmente imágenes de gran formato (usando la librería `sharp` para retener la resolución HD) y emplea un prompt multimodal para asegurar transcripciones perfectas, evadiendo errores tradicionales de OCR.

### ▶️ Uso del módulo de extracción en local:

1. Añade tus imágenes a la carpeta `imgs/` o PDFs a `problems/`.
2. Configura tu API Key en un archivo `.env` en la raíz de la app (`OPENAI_API_KEY=tu-clave`).
3. Ejecuta los scripts:

```bash
# Instala dependencias necesarias
npm install

# Inicia la extracción de test teóricos (imágenes)
npm run extract

# Inicia la extracción y clasificación de problemas (PDFs)
npm run extract-problems
```

---

## 🛠 Entorno y Stack Tecnológico

- **Frontend & Web App:** Next.js 14, React 18, Tailwind CSS, Zustand, Recharts, Lucide Icons.
- **Procesamiento de Datos:** Node.js (LTS), Sharp (Manipulación gráfica), Poppler (PDFs a Imágenes), APIs de Visión-Lenguaje.
- **Algoritmia Pura:** C++11 / C++17.

---

> **Aviso SEO:** El material compilado aquí pretende potenciar la cultura general de estructuras de datos orientada a mejorar las habilidades lógicas, análisis asintótico y preparaciones avanzadas en programación o entrevistas técnicas. Está fuertemente ligado al currículo de *Fundamentos de los Algoritmos*.
