const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

let genAI = null;
let model = null;

if (GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    console.log('[AI] Gemini conectado — frases generadas por IA');
} else {
    console.log('[AI] Sin GEMINI_API_KEY — usando frases de respaldo');
}

const phraseBuffer = { easy: [], normal: [], hard: [] };
const BUFFER_MIN = 5;
const BATCH_SIZE = 20;
let generating = { easy: false, normal: false, hard: false };

const prompts = {
    easy: `Genera ${BATCH_SIZE} palabras sueltas en español, variadas y comunes (sustantivos, adjetivos, verbos en infinitivo). 
Entre 3 y 8 letras cada una. Sin tildes ni caracteres especiales. Una por línea, solo la palabra, nada más.`,

    normal: `Genera ${BATCH_SIZE} frases cortas en español de entre 4 y 8 palabras. 
Temas variados: naturaleza, tecnología, comida, deportes, ciencia, vida cotidiana, animales, espacio, historia, cultura.
Cada frase debe ser diferente en tema y estructura. Sin tildes ni caracteres especiales.
Una frase por línea, solo la frase, sin numerar, sin puntuación final.`,

    hard: `Genera ${BATCH_SIZE} frases largas en español de entre 10 y 18 palabras.
Temas variados: ciencia, filosofía, historia, tecnología, arte, geografía, astronomía, biología.
Frases complejas con vocabulario rico. Sin tildes ni caracteres especiales.
Una frase por línea, solo la frase, sin numerar, sin puntuación final.`
};

const fallbackPhrases = {
    easy: [
        "perro", "gato", "mesa", "silla", "agua", "fuego", "sol", "luna", "mar", "rio",
        "cielo", "tierra", "aire", "nube", "lluvia", "nieve", "hielo", "flor", "arbol",
        "roca", "piedra", "camino", "puerta", "ventana", "casa", "calle", "tiempo",
        "mano", "libro", "pluma", "reloj", "coche", "barco", "avion", "tren",
        "bosque", "campo", "playa", "isla", "monte", "valle", "lago", "musica"
    ],
    normal: [
        "El perro ladra fuerte", "La casa es muy grande", "Me gusta el cafe caliente",
        "Hace mucho frio hoy", "Voy al supermercado ahora", "Tengo que estudiar mas",
        "Las olas rompen en la playa", "El bosque huele a tierra mojada",
        "La pantalla del movil se rompio", "La gravedad atrae los cuerpos",
        "El equipo gano por tres goles", "Los arboles pierden sus hojas",
        "El cielo esta muy azul", "La musica me relaja mucho",
        "El tren llega a las tres", "Quiero aprender algo nuevo",
        "Las estrellas brillan en la noche", "El rio baja con mucha fuerza",
        "Necesito cargar la bateria ahora", "El wifi no funciona bien hoy",
        "El chocolate me alegra el dia", "Correr por la manana es genial",
        "El museo abre los domingos gratis", "El vuelo sale a las siete",
        "Los astronautas flotan en gravedad cero", "Solo se que no se nada",
        "Las abejas producen miel y polinizan flores", "El delfin salta sobre las olas"
    ],
    hard: [
        "El veloz murcielago hindu comia feliz cardillo y kiwi en la jungla tropical",
        "La inteligencia artificial esta transformando cada aspecto de la sociedad contemporanea global",
        "Los glaciares del artico se derriten a un ritmo alarmante e irreversible cada anio",
        "El cerebro humano contiene aproximadamente ochenta y seis mil millones de neuronas interconectadas",
        "La biodiversidad del Amazonas alberga mas de diez millones de especies animales y vegetales",
        "Los oceanos cubren mas del setenta por ciento de la superficie terrestre y regulan el clima",
        "El telescopio James Webb observa galaxias que se formaron poco despues del origen del universo",
        "La filosofia griega antigua sento las bases del pensamiento occidental durante mas de dos milenios"
    ]
};

async function generateBatch(difficulty) {
    if (!model || generating[difficulty]) return;
    generating[difficulty] = true;

    try {
        const result = await model.generateContent(prompts[difficulty]);
        const text = result.response.text();
        const lines = text.split('\n')
            .map(l => l.replace(/^\d+[\.\)\-]\s*/, '').replace(/[\.!?]+$/, '').trim())
            .filter(l => l.length >= 2 && l.length < 120 && !l.startsWith('-'));

        if (lines.length > 0) {
            phraseBuffer[difficulty].push(...lines);
            console.log(`[AI] Generadas ${lines.length} frases (${difficulty}), buffer: ${phraseBuffer[difficulty].length}`);
        }
    } catch (err) {
        console.error(`[AI] Error generando frases (${difficulty}):`, err.message);
    } finally {
        generating[difficulty] = false;
    }
}

function refillIfNeeded(difficulty) {
    if (model && phraseBuffer[difficulty].length < BUFFER_MIN && !generating[difficulty]) {
        generateBatch(difficulty);
    }
}

function getRandomPhrase(difficulty = 'normal') {
    refillIfNeeded(difficulty);

    if (phraseBuffer[difficulty].length > 0) {
        const idx = Math.floor(Math.random() * phraseBuffer[difficulty].length);
        return phraseBuffer[difficulty].splice(idx, 1)[0];
    }

    const fb = fallbackPhrases[difficulty] || fallbackPhrases.normal;
    return fb[Math.floor(Math.random() * fb.length)];
}

if (model) {
    generateBatch('easy');
    generateBatch('normal');
    generateBatch('hard');
}

module.exports = { getRandomPhrase };
