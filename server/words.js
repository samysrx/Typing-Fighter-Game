const phrases = [
    "ataque rapido",
    "defensa ferrea",
    "golpe critico",
    "combo imparable",
    "esquivar ataque",
    "energia maxima",
    "furia desatada",
    "velocidad de luz",
    "contraataque letal",
    "bloqueo perfecto",
    "victoria inminente",
    "teclado en llamas"
];

const easyPhrases = [
    "perro", "gato", "mesa", "silla", "agua", "fuego", "sol", "luna", "mar", "rio",
    "cielo", "tierra", "aire", "nube", "lluvia", "nieve", "hielo", "flor", "arbol",
    "roca", "piedra", "camino", "puerta", "ventana", "casa", "calle"
];

const normalPhrases = [
    "El perro ladra",
    "La casa es grande",
    "Me gusta el cafe",
    "Hace mucho frio hoy",
    "Voy al supermercado",
    "Tengo que estudiar",
    "Quiero comer pizza",
    "El cielo es azul",
    "La musica es relajante",
    "Mañana llovera fuerte"
];

const hardPhrases = [
    "El veloz murcielago hindu comia feliz cardillo y kiwi.",
    "La pequeña cigüeña tocaba el saxofon con mucha alegria.",
    "Exige mucho esfuerzo comprender la complejidad del universo.",
    "Aquella majestuosa y gigantesca montaña se alzaba imponente.",
    "Las constantes fluctuaciones del mercado global son impredecibles.",
    "El transbordador espacial orbita la Tierra a gran velocidad.",
    "La misteriosa criatura emergio de las profundidades del oceano."
];

function getRandomPhrase(difficulty = 'normal') {
    let list = normalPhrases;
    if (difficulty === 'easy') list = easyPhrases;
    if (difficulty === 'hard') list = hardPhrases;

    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
}

module.exports = {
    getRandomPhrase
};
