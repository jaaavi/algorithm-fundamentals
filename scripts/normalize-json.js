/**
 * normalize-json.js
 *
 * Renombra y agrupa los archivos de /json en archivos por tema con nombres limpios.
 * Los archivos originales se mantienen; los normalizados se generan en /json como archivos únicos por tema.
 *
 * Mapeo:
 *   "Tema 1: Costes"                         → tema1.json
 *   "Tema 3: Diseño de algoritmos iterativos" → tema3.json
 *   "Tema 4: Recursión"                       → tema4.json
 *   "Tema 5: Divide y vencerás"               → tema5.json
 *   "Tema 6: Vuelta atrás"                    → tema6.json
 *   "Repaso Temas 1 al 5"                     → repaso.json
 *   "Repaso del test de evaluación"           → repaso_eval.json
 */

const fs   = require('fs');
const path = require('path');

const jsonDir = path.join(__dirname, '../json');

// Map from topic key (prefix before _\d+) to clean filename
const TOPIC_MAP = {
  'Tema 1_ Costes':                          'tema1',
  'Tema 3_ Diseño de algoritmos iterativos': 'tema3',
  'Tema 4_ Recursión':                       'tema4',
  'Tema 5_ Divide y vencerás':               'tema5',
  'Tema 6_ Vuelta atrás':                    'tema6',
  'Repaso Temas 1 al 5':                     'repaso',
  'Repaso del test de evaluación':           'repaso_eval',
};

// Topic display names for the merged files
const TOPIC_DISPLAY = {
  'tema1':       'Tema 1: Costes',
  'tema3':       'Tema 3: Diseño de algoritmos iterativos',
  'tema4':       'Tema 4: Recursión',
  'tema5':       'Tema 5: Divide y vencerás',
  'tema6':       'Tema 6: Vuelta atrás',
  'repaso':      'Repaso Temas 1 al 5',
  'repaso_eval': 'Repaso del test de evaluación',
};

function getTopicKey(filename) {
  return filename.replace(/\.json$/, '').replace(/_\d+$/, '');
}

const files = fs.readdirSync(jsonDir)
  .filter(f => f.endsWith('.json') && !f.match(/^(tema|repaso)/))  // skip already normalized
  .sort();

// Group by topic
const grouped = {};

for (const file of files) {
  const topicKey  = getTopicKey(file);
  const cleanName = TOPIC_MAP[topicKey];

  if (!cleanName) {
    console.warn(`[SKIP] No mapping found for: "${topicKey}" (file: ${file})`);
    continue;
  }

  if (!grouped[cleanName]) grouped[cleanName] = [];

  try {
    const questions = JSON.parse(fs.readFileSync(path.join(jsonDir, file), 'utf-8'));
    grouped[cleanName].push(...questions);
    console.log(`[READ] ${file} → ${cleanName} (${questions.length} preguntas)`);
  } catch (e) {
    console.error(`[ERROR] ${file}: ${e.message}`);
  }
}

// Write merged files
let total = 0;
for (const [cleanName, questions] of Object.entries(grouped)) {
  const outFile = path.join(jsonDir, `${cleanName}.json`);
  fs.writeFileSync(outFile, JSON.stringify(questions, null, 2), 'utf-8');
  console.log(`[WRITE] ${cleanName}.json (${questions.length} preguntas)`);
  total += questions.length;
}

console.log(`\n✅ Normalización completa. ${total} preguntas en ${Object.keys(grouped).length} archivos.`);
console.log('   Los archivos originales (Tema X_...json) se mantienen intactos.');
console.log('   Los nuevos archivos (tema1.json, etc.) son los normalizados.');
