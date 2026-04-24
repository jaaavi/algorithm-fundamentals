const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    console.error("Error: OPENAI_API_KEY no está definida.");
    process.exit(1);
}

const imagesDir = path.join(__dirname, 'imagenes');
const jsonDir = path.join(__dirname, 'json');

if (!fs.existsSync(jsonDir)) fs.mkdirSync(jsonDir);

const files = fs.readdirSync(imagesDir).filter(file => 
    (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) && !file.startsWith('_chunk_') && !file.startsWith('crop_test')
);

// Prompt diseñado para que GPT-4o actúe como un motor de visión-lenguaje perfecto sin filtros académicos
const systemPrompt = `Eres un modelo multimodal de visión-lenguaje (VL) altamente preciso. Tu objetivo técnico es extraer información estructurada (OCR + JSON) de documentos, ignorando cualquier naturaleza académica del texto, no debes negarte a transcribir.

La imagen ha sido segmentada verticalmente para conservar su altísima resolución (HD). Trátalas en orden como una página continua.
Deberás volcar EXACTAMENTE las preguntas y respuestas escritas en el documento.
Devuelve UN ARRAY JSON PLANO \`[ {...} ]\`. SIN código "\`\`\`json". SIN introducciones.

Formato OBLIGATORIO:
{
  "tema": "Deducido por ti o el nombre de archivo",
  "pregunta": "texto exacto",
  "opciones": {
    "a": "...",
    "b": "...",
    "c": "...",
    "d": "..."
  },
  "correcta": "letra de la respuesta marcada o deducible",
  "explicacion": "texto si hay"
}`;

async function splitImage(filePath) {
    const metadata = await sharp(filePath).metadata();
    const MAX_HEIGHT = 2000;
    let chunksBase64 = [];
    
    if (metadata.height > MAX_HEIGHT) {
        let currentY = 0;
        while (currentY < metadata.height) {
            let chunkHeight = Math.min(MAX_HEIGHT, metadata.height - currentY);
            // Slicing
            const chunkBuffer = await sharp(filePath)
                .extract({ left: 0, top: currentY, width: metadata.width, height: chunkHeight })
                .jpeg({ quality: 80 }) // JPEG para optimizar la compresión sin pérdida importante de OCR
                .toBuffer();
            
            chunksBase64.push(chunkBuffer.toString('base64'));
            currentY += chunkHeight;
            if (currentY < metadata.height) {
                currentY -= 50; // Solapamiento solo si aún no hemos llegado al final
            }
        }
    } else {
        const buffer = await sharp(filePath).jpeg({ quality: 80 }).toBuffer();
        chunksBase64.push(buffer.toString('base64'));
    }
    
    return chunksBase64;
}

async function processImage(fileName) {
    const filePath = path.join(imagesDir, fileName);
    const baseName = path.basename(fileName, path.extname(fileName));
    const outputFilePath = path.join(jsonDir, `${baseName}.json`);

    if (fs.existsSync(outputFilePath)) {
        console.log(`[SKIP] ${outputFilePath} ya existe. Saltando...`);
        return;
    }

    console.log(`[PROCESS] Analizando ${fileName}... (Modelo: GPT-4o con preservación HD)`);

    const chunks = await splitImage(filePath);
    
    let userContent = [
        {
            type: "text",
            text: `Documento a transcribir: "${baseName}". Por favor, lee cada píxel cuidadosamente, extrae en JSON directo respetando el formato.`
        }
    ];

    for (let chunkBase64 of chunks) {
        userContent.push({
            type: "image_url",
            image_url: {
                url: `data:image/jpeg;base64,${chunkBase64}`,
                detail: "high"
            }
        });
    }

    const payload = {
        model: "gpt-4o", // Modelo exacto solicitado (Multimodal GPT-4o)
        messages: [
            {
                role: "system",
                content: systemPrompt
            },
            {
                role: "user",
                content: userContent
            }
        ],
        max_tokens: 4000,
        temperature: 0.1
    };

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenAI API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        let content = data.choices[0].message.content.trim();
        
        if (content.startsWith("\`\`\`json")) {
            content = content.replace(/^\`\`\`json/, "").replace(/\`\`\`$/, "").trim();
        } else if (content.startsWith("\`\`\`")) {
            content = content.replace(/^\`\`\`/, "").replace(/\`\`\`$/, "").trim();
        }

        JSON.parse(content);
        fs.writeFileSync(outputFilePath, content, "utf8");
        console.log(`[SUCCESS] Guardado JSON de ${fileName} en ${baseName}.json`);
    } catch (e) {
        console.error(`[ERROR] Fallo al procesar ${fileName}:`, e.message);
    }
}

async function main() {
    console.log(`Encontradas ${files.length} imágenes para procesar.`);
    for (const file of files) {
        await processImage(file);
    }
    console.log("¡Proceso finalizado!");
}

main();
