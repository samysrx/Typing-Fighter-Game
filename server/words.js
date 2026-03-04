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
    "teclado en llamas",
    "reflejos felinos",
    "maestro del combate",
    "puño de dragon",
    "patada giratoria",
    "impacto sonico",
    "romper la guardia",
    "resistencia extrema",
    "fuego cruzado",
    "ninja silencioso",
    "guerrero legendario",
    "tormenta de golpes",
    "movimiento evasivo",
    "precision milimetrica"
];

function getRandomPhrase() {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    return phrases[randomIndex];
}

module.exports = { getRandomPhrase };
