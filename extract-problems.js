const fs   = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const os   = require('os');

// ─── Cargar .env ──────────────────────────────────────────────────────────────
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
        const t = line.trim();
        if (t && !t.startsWith('#')) {
            const eq = t.indexOf('=');
            if (eq > 0) {
                const k = t.slice(0, eq).trim();
                const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
                if (!process.env[k]) process.env[k] = v;
            }
        }
    }
}

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
    console.error('❌  OPENAI_API_KEY no está definida.');
    console.error('    Crea un archivo .env con: OPENAI_API_KEY=sk-...');
    process.exit(1);
}

// ─── Configuración ────────────────────────────────────────────────────────────
const problemsDir = path.join(__dirname, 'problems');
const outputDir   = path.join(__dirname, 'problems-json');
const CONCURRENCY = 1;   // 1 para respetar el límite de tokens de OpenAI
const MODEL       = 'gpt-4o';
const MAX_RETRIES = 6;   // reintentos para errores 429 (rate limit)

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// Script Python temporal para extraer texto con PyMuPDF
const PY_SCRIPT = path.join(os.tmpdir(), 'fal_extract_text.py');
fs.writeFileSync(PY_SCRIPT, `
import fitz, sys, json
doc = fitz.open(sys.argv[1])
pages = []
for i, page in enumerate(doc):
    text = page.get_text().strip()
    if text:
        pages.append({'page': i + 1, 'text': text})
print(json.dumps(pages, ensure_ascii=False))
`);

// ─── Inferencia de tema y subtipo ─────────────────────────────────────────────
function inferTema(relPath, fileName) {
    const p = relPath.toLowerCase();
    const f = fileName.toLowerCase();
    if (p.includes('iterativos') || f.includes('-it-'))                         return 'Iterativos';
    if (p.includes('backtracking') || f.includes('-va-'))                       return 'Backtracking';
    if (p.includes('dyv') || f.includes('-dyv-'))                               return 'Recursión';
    if (p.includes('finalnofinal') || f.includes('-num-') || f.includes('-rec-')) return 'Recursión';
    if (p.includes('recursivos'))                                               return 'Recursión';
    if (p.includes('preexam') || p.includes('examene2026')) {
        if (f.includes('-it-'))  return 'Iterativos';
        if (f.includes('-dyv-')) return 'Recursión';
        if (f.includes('-va-'))  return 'Backtracking';
        return 'Iterativos';
    }
    return 'Iterativos';
}

function inferSubtipo(tema, fileName) {
    const f = fileName.toLowerCase();
    if (tema === 'Iterativos') {
        if (f.includes('maximo') || f.includes('minimo') || f.includes('mejor'))          return 'máximo/mínimo';
        if (f.includes('busca') || f.includes('primera') || f.includes('encontrar'))      return 'búsqueda';
        if (f.includes('contar') || f.includes('contador'))                                return 'conteo';
        if (f.includes('segmento') || f.includes('intervalo') || f.includes('mezcla'))    return 'ventana';
        if (f.includes('doble') || f.includes('pareja'))                                   return 'doble bucle';
        return 'acumulador';
    }
    if (tema === 'Recursión') {
        if (f.includes('dyv') || f.includes('divide') || f.includes('mezcla'))   return 'divide y vencerás';
        if (f.includes('final') || f.includes('tail'))                            return 'recursión final';
        return 'recursión simple';
    }
    if (tema === 'Backtracking') {
        if (f.includes('poda') || f.includes('estimacion') || f.includes('optim')) return 'con poda';
        if (f.includes('permut'))                                                   return 'permutaciones';
        if (f.includes('combina'))                                                  return 'combinaciones';
        if (f.includes('variacion'))                                                return 'generación';
        return 'con restricciones';
    }
    return 'acumulador';
}

function buildId(tema, fileName) {
    const base  = path.basename(fileName, path.extname(fileName));
    const match = base.match(/prob-FAL-(?:[A-Z]+-)?(.+)/i);
    const slug  = match
        ? match[1].toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+$/, '')
        : base.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const prefix = { 'Iterativos': 'it', 'Backtracking': 'va', 'Recursión': 'rec' }[tema] ?? 'prob';
    return `${prefix}_${slug}`;
}

// ─── Extracción de texto con PyMuPDF ─────────────────────────────────────────
function pdfToText(pdfPath) {
    const raw = execFileSync('python3', [PY_SCRIPT, pdfPath], {
        encoding: 'utf8',
        maxBuffer: 20 * 1024 * 1024,
    });
    const pages = JSON.parse(raw);
    if (!pages.length) throw new Error('El PDF no contiene texto extraíble.');
    return pages.map(p => `=== Página ${p.page} ===\n${p.text}`).join('\n\n');
}

// ─── System prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Eres un analizador pedagógico de problemas de algoritmia. Tu tarea es leer el texto extraído de un enunciado universitario (estilo FAL, Universidad Politécnica de Madrid) y devolver UN ÚNICO objeto JSON con la estructura que se indica. SIN bloques markdown, SIN explicaciones, SIN texto fuera del JSON.

{
  "id": "<cópialo exactamente del parámetro id>",
  "tema": "<cópialo exactamente del parámetro tema>",
  "subtipo": "<elige el más adecuado según el tema:
    ITERATIVOS: acumulador | máximo/mínimo | búsqueda | conteo | doble bucle | ventana
    RECURSIÓN: recursión simple | recursión final | divide y vencerás
    BACKTRACKING: generación | combinaciones | permutaciones | con restricciones | con poda>",
  "dificultad": <1-5: 1=trivial, 2=fácil, 3=medio, 4=difícil, 5=muy difícil>,

  "enunciado": "<texto completo del enunciado, fiel al original, en castellano>",
  "entrada": "<descripción exacta de los parámetros de entrada de la función/algoritmo>",
  "salida": "<qué debe devolver o modificar la función>",
  "restricciones": "<restricciones numéricas explícitas, o 'No especificadas'>",

  "ejemplo": {
    "input": "<ejemplo de entrada si aparece en el enunciado, si no: null>",
    "output": "<ejemplo de salida si aparece en el enunciado, si no: null>"
  },

  "tags": ["<4-6 etiquetas: vector, poda, árbol, índices, acumulador, recursión, etc.>"],

  "como_reconocerlo": "<una frase: el patrón concreto que identifica este tipo de problema>",
  "idea_clave": "<el insight o decisión algorítmica central para resolverlo>",

  "estrategia": ["<paso 1>", "<paso 2>", "<...>"],

  "plantilla_codigo": "<esqueleto C++ que muestra la estructura sin revelar la solución: firma de función, bucle/recursión vacíos, comentarios de qué hacer en cada parte>",

  "pistas": ["<pista 1: orienta sin desvelar>", "<pista 2: más específica>"],

  "solucion_codigo": "<solución C++ completa y correcta si puedes deducirla del enunciado; si no, cadena vacía>",
  "explicacion": "<3-5 frases: qué hace el algoritmo, por qué funciona, complejidad temporal>",

  "errores_comunes": ["<error 1 con explicación breve>", "<error 2>"]
}

REGLAS:
- Transcribe el enunciado con total fidelidad. No omitas restricciones ni ejemplos.
- El contenido pedagógico debe ser concreto y útil, no genérico.
- id y tema vienen dados: cópialos exactamente.
- Devuelve SOLO el JSON. Nada más.`;

// ─── Llamada a GPT-4o con retry para rate-limit ───────────────────────────────
async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function extractProblem(pdfPath, id, tema, subtipo) {
    const text = pdfToText(pdfPath);

    const userMessage = `Problema a estructurar:
id: "${id}"
tema: "${tema}"
subtipo_sugerido: "${subtipo}" (valídalo y corrígelo si no encaja con el enunciado)

TEXTO DEL PDF:
${text}`;

    const body = JSON.stringify({
        model: MODEL,
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user',   content: userMessage },
        ],
        max_tokens: 4096,
        temperature: 0.1,
    });

    let lastError;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body,
        });

        if (response.status === 429) {
            // Rate limit — leer el tiempo sugerido de espera si viene en la respuesta
            const errText = await response.text();
            const match   = errText.match(/try again in ([\d.]+)s/i);
            const wait    = match ? Math.ceil(parseFloat(match[1]) * 1000) + 500 : attempt * 8000;
            console.log(`    [rate-limit] esperando ${Math.round(wait/1000)}s antes del intento ${attempt+1}/${MAX_RETRIES}...`);
            await sleep(wait);
            lastError = new Error(`Rate limit (429)`);
            continue;
        }

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`OpenAI ${response.status}: ${err.slice(0, 300)}`);
        }

        const data = await response.json();
        let content = data.choices[0].message.content.trim();

        // Limpiar si GPT envuelve en markdown
        content = content
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/```\s*$/i, '')
            .trim();

        JSON.parse(content); // valida — lanza si no es JSON
        return content;
    }

    throw lastError ?? new Error('Máximo de reintentos alcanzado');
}

// ─── Recolectar PDFs ──────────────────────────────────────────────────────────
function collectPdfs(dir, results = []) {
    for (const entry of fs.readdirSync(dir).sort()) {
        const full = path.join(dir, entry);
        if (fs.statSync(full).isDirectory()) collectPdfs(full, results);
        else if (entry.toLowerCase().endsWith('.pdf')) results.push(full);
    }
    return results;
}

// ─── Procesamiento en paralelo limitado ──────────────────────────────────────
async function processWithConcurrency(tasks, concurrency) {
    const results = [];
    const queue = [...tasks];
    const active = new Set();

    async function runNext() {
        if (!queue.length) return;
        const task = queue.shift();
        const p = task().then(r => { active.delete(p); results.push(r); return runNext(); });
        active.add(p);
        return p;
    }

    const initial = Array.from({ length: Math.min(concurrency, tasks.length) }, runNext);
    await Promise.all(initial);
    while (active.size > 0) await Promise.race(active);
    return results;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
    const pdfs = collectPdfs(problemsDir);
    console.log(`\n📚  Encontrados ${pdfs.length} PDFs en /problems`);
    console.log(`⚙️   Concurrencia: ${CONCURRENCY} en paralelo\n`);

    const counters = { ok: 0, skip: 0, fail: 0 };
    const failed = [];

    const tasks = pdfs.map(pdfPath => async () => {
        const relPath  = path.relative(problemsDir, pdfPath);
        const fileName = path.basename(pdfPath);
        const tema     = inferTema(relPath, fileName);
        const subtipo  = inferSubtipo(tema, fileName);
        const id       = buildId(tema, fileName);
        const outFile  = path.join(outputDir, `${id}.json`);

        if (fs.existsSync(outFile)) {
            console.log(`[SKIP]  ${relPath}`);
            counters.skip++;
            return;
        }

        console.log(`[→]     ${relPath}  (tema=${tema}, subtipo=${subtipo})`);

        try {
            const json = await extractProblem(pdfPath, id, tema, subtipo);
            fs.writeFileSync(outFile, json, 'utf8');
            console.log(`[✓]     → problems-json/${id}.json`);
            counters.ok++;
        } catch (e) {
            console.error(`[✗]     ${relPath}: ${e.message}`);
            failed.push({ relPath, error: e.message });
            counters.fail++;
        }
    });

    await processWithConcurrency(tasks, CONCURRENCY);

    console.log(`\n${'─'.repeat(60)}`);
    console.log(`✅  Procesados: ${counters.ok}  |  ⏭  Saltados: ${counters.skip}  |  ❌  Errores: ${counters.fail}`);
    console.log(`📁  JSONs guardados en: ${outputDir}`);

    if (failed.length) {
        console.log('\nProblemas con error:');
        failed.forEach(f => console.log(`  - ${f.relPath}: ${f.error}`));
    }
}

main().catch(e => { console.error(e); process.exit(1); });
