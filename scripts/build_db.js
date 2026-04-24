const fs = require('fs');
const path = require('path');

const jsonDir = path.join(__dirname, '../json');
const outputFile = path.join(__dirname, '../db.json');

if (!fs.existsSync(jsonDir)) {
    console.error("No existe el directorio /json.");
    process.exit(1);
}

const files = fs.readdirSync(jsonDir).filter(f => f.endsWith('.json'));
let database = {};

files.forEach(file => {
    try {
        const filePath = path.join(jsonDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Asignaremos el nombre base sin índices ni repeticiones al tema para agruparlo.
        // Ej: "Tema 3_ Diseño de algoritmos iterativos_0.json" -> "Tema 3: Diseño de algoritmos iterativos"
        data.forEach(pregunta => {
            let temaKey = pregunta.tema || "Tema Desconocido";
            // Limpiar "Tema 3_ blabla_0"
            temaKey = temaKey.replace(/_\d+$/, '').replace(/_/, ': ');
            
            if (!database[temaKey]) {
                database[temaKey] = [];
            }
            database[temaKey].push(pregunta);
        });
    } catch (e) {
        console.error(`Error procesando ${file}: ${e.message}`);
    }
});

fs.writeFileSync(outputFile, JSON.stringify(database, null, 2), 'utf8');
console.log(`[SUCCESS] Base de datos construida con éxito en ${outputFile}. Seleccionadas ${Object.keys(database).length} áreas temáticas.`);
