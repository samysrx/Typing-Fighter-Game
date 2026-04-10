const easyPhrases = [
    "perro", "gato", "mesa", "silla", "agua", "fuego", "sol", "luna", "mar", "rio",
    "cielo", "tierra", "aire", "nube", "lluvia", "nieve", "hielo", "flor", "arbol",
    "roca", "piedra", "camino", "puerta", "ventana", "casa", "calle", "tiempo",
    "mano", "libro", "pluma", "reloj", "coche", "barco", "avion", "tren",
    "bosque", "campo", "playa", "isla", "monte", "valle", "lago", "rio",
    "musica", "arte", "danza", "juego", "luz", "sombra", "viento", "ola",
    "pajaro", "tigre", "lobo", "oso", "pez", "rana", "abeja", "leon",
    "fruta", "leche", "arroz", "queso", "carne", "pan", "sal", "miel",
    "rojo", "azul", "verde", "negro", "blanco", "gris", "rosa", "dorado",
    "norte", "sur", "este", "oeste", "centro", "alto", "bajo", "lejos",
    "rapido", "lento", "fuerte", "suave", "dulce", "amargo", "nuevo", "viejo",
    "grande", "chico", "largo", "corto", "ancho", "denso", "claro", "oscuro"
];

const normalPhrases = [
    // Cotidiano
    "El perro ladra fuerte", "La casa es muy grande", "Me gusta el cafe caliente",
    "Hace mucho frio hoy", "Voy al supermercado ahora", "Tengo que estudiar mas",
    "Quiero comer pizza hoy", "El cielo esta muy azul", "La musica me relaja mucho",
    "Mañana llovera bastante fuerte", "Necesito descansar un rato", "Vamos a dar un paseo",
    "Hoy es un buen dia", "El tren llega a las tres", "Compre flores para la mesa",
    "La ventana esta abierta", "Quiero aprender algo nuevo", "El reloj marca las cinco",
    "Prefiero el te con limon", "Hoy cocino yo la cena", "La tienda cierra a las nueve",
    "Necesito comprar pan fresco", "El parque esta muy bonito", "Vamos al cine esta noche",
    "Me desperte muy temprano hoy", "El autobus tarda demasiado", "Mañana tengo una reunion",
    "Hoy me siento con energia", "El gato duerme en la silla", "La sopa esta muy caliente",

    // Naturaleza
    "Las olas rompen en la playa", "El bosque huele a tierra mojada",
    "Las estrellas brillan en la noche", "El rio baja con mucha fuerza",
    "La primavera trae muchas flores", "El atardecer pinta el cielo de rojo",
    "Los arboles pierden sus hojas", "La nieve cubre toda la montaña",
    "El viento sopla con fuerza", "Las nubes cubren todo el cielo",
    "Un arcoiris aparecio tras la lluvia", "Los pajaros cantan al amanecer",
    "El volcán despide cenizas al aire", "Las mareas suben por la luna",
    "El desierto se extiende sin fin", "La cascada cae desde muy alto",

    // Tecnologia
    "La pantalla del movil se rompio", "Necesito cargar la bateria ahora",
    "El wifi no funciona bien hoy", "Actualice el sistema operativo ayer",
    "Mi ordenador va muy lento", "El disco duro esta casi lleno",
    "Descargue una aplicacion nueva", "La impresora se quedo sin tinta",
    "El cursor parpadea en la pantalla", "El codigo tiene un error grave",
    "La conexion a internet falla mucho", "El servidor esta en mantenimiento",
    "Necesito un teclado mecanico nuevo", "La webcam no graba con audio",
    "El programa se cierra solo", "Los datos se guardaron en la nube",

    // Ciencia
    "La gravedad atrae los cuerpos", "El agua hierve a cien grados",
    "La luz viaja muy rapido", "Los atomos forman moleculas",
    "El oxigeno es vital para vivir", "Marte es el planeta rojo",
    "Las celulas se dividen sin parar", "El ADN guarda nuestra informacion",
    "La energia no se crea ni destruye", "Los electrones giran sin descanso",
    "El sol es una estrella enorme", "La luna orbita alrededor de la tierra",
    "Los volcanes expulsan lava ardiente", "Los fosiles tienen millones de años",
    "El hielo flota sobre el agua", "El sonido viaja en ondas",

    // Comida
    "La paella lleva azafran y arroz", "El chocolate me alegra el dia",
    "Prepare una ensalada muy fresca", "El pan recien hecho huele genial",
    "Me encanta la pasta con tomate", "El helado se derrite con el calor",
    "El limon es muy acido y fresco", "Las fresas con nata son deliciosas",
    "Hoy desayune huevos con tostadas", "La sopa de cebolla esta buenisima",
    "El asado tarda horas en hacerse", "Me gusta el sushi de salmon",
    "La tortilla de patatas es clasica", "El gazpacho se sirve bien frio",
    "Las galletas estan recien horneadas", "Quiero probar ese restaurante nuevo",

    // Deportes
    "El equipo gano por tres goles", "Correr por la mañana es genial",
    "La final se juega el domingo", "El arbitro pito penalti claro",
    "Nado media hora cada mañana", "El ciclista subio la montaña rapido",
    "El partido fue muy emocionante", "Gano la medalla de oro olimpica",
    "El portero paro el disparo clave", "Hoy hay carrera de formula uno",
    "El tenista saco un ace brutal", "La seleccion juega esta noche",
    "El record mundial fue superado", "Entreno tres veces a la semana",
    "El boxeador gano por nocaut", "La liga empieza el mes que viene",

    // Cultura y arte
    "El museo abre los domingos gratis", "Me encanta leer novelas de misterio",
    "La pelicula dura dos horas y media", "El concierto fue absolutamente increible",
    "Picasso pinto el Guernica en Paris", "La obra de teatro fue muy emotiva",
    "El libro tiene trescientas paginas", "Me gusta la fotografia en blanco y negro",
    "La escultura mide mas de dos metros", "El festival de musica dura tres dias",
    "La biblioteca tiene miles de libros", "Me compre un disco de vinilo antiguo",
    "La galeria expone arte moderno", "El documental explica el cambio climatico",

    // Viajes
    "El vuelo sale a las siete y media", "Quiero visitar Japon algun dia",
    "El hotel tiene vista al mar", "Perdimos el equipaje en el aeropuerto",
    "La ruta cruza cinco paises distintos", "El tren bala va a trescientos por hora",
    "Alquilamos un coche para el viaje", "La excursion por la selva fue increible",
    "El crucero recorre el mediterraneo", "Necesito renovar mi pasaporte pronto",
    "La reserva del hotel esta confirmada", "El mapa dice que estamos cerca",
    "Tomamos fotos de cada monumento", "El ferry cruza el canal en una hora",

    // Espacio
    "La estacion espacial orbita la tierra", "Los astronautas flotan en gravedad cero",
    "Un cometa cruza el sistema solar", "La via lactea tiene millones de estrellas",
    "El telescopio capta galaxias lejanas", "Marte tiene agua congelada en sus polos",
    "La luna llena ilumina toda la noche", "Un agujero negro devora toda la luz",
    "Los satelites giran sin detenerse", "El cohete despego con exito total",
    "Pluton ya no es un planeta oficial", "Jupiter tiene mas de setenta lunas",
    "La nebulosa brilla con colores intensos", "Las sondas exploran el espacio profundo",

    // Frases celebres adaptadas
    "Solo se que no se nada todavia", "La imaginacion es mas fuerte que el saber",
    "El que no arriesga no gana nada", "Cada dia es una nueva oportunidad",
    "La practica hace al maestro siempre", "No dejes para mañana lo de hoy",
    "La paciencia es la madre de la ciencia", "Quien tiene un amigo tiene un tesoro",
    "El camino se hace al andar despacio", "Mas vale prevenir que tener que curar",
    "La union hace la fuerza del equipo", "El saber no ocupa lugar en la mente",

    // Historicas
    "Colon llego a America en mil cuatrocientos", "Los romanos construyeron grandes acueductos",
    "La revolucion cambio el curso de la historia", "El imperio inca domino los Andes por siglos",
    "Los vikingos navegaron hasta America del Norte", "La imprenta revoluciono la difusion del saber",
    "Los faraones gobernaron Egipto durante milenios", "La muralla china mide miles de kilometros",

    // Animales
    "El delfin salta sobre las olas del mar", "Las abejas producen miel y polinizan flores",
    "El aguila vuela a gran altitud sin esfuerzo", "Los pingüinos viven en climas muy frios",
    "El pulpo tiene ocho brazos y tres corazones", "Las ballenas migran miles de kilometros cada año",
    "El camaleon cambia de color para camuflarse", "Los lobos cazan siempre en manada organizada",
    "La tortuga marina vive mas de cien años", "El colibrí mueve las alas muy rapido",
    "Los elefantes tienen una memoria extraordinaria", "El guepardo es el animal terrestre mas rapido"
];

const hardPhrases = [
    "El veloz murcielago hindu comia feliz cardillo y kiwi en la jungla.",
    "La pequeña cigüeña tocaba el saxofon mientras la brisa del mar soplaba.",
    "Exige mucho esfuerzo comprender la complejidad inherente del universo infinito.",
    "Aquella majestuosa y gigantesca montaña se alzaba imponente sobre las nubes densas.",
    "Las constantes fluctuaciones del mercado global son completamente impredecibles e inevitables.",
    "El transbordador espacial orbita la Tierra a veintiocho mil kilometros por hora.",
    "La misteriosa criatura emergio de las profundidades del oceano en plena oscuridad.",
    "La fotosintesis convierte la energia solar en glucosa mediante reacciones quimicas complejas.",
    "Los manuscritos del mar muerto fueron descubiertos en cuevas de Qumran en Israel.",
    "La inteligencia artificial esta transformando cada aspecto de la sociedad contemporanea global.",
    "El principio de incertidumbre de Heisenberg revoluciono la fisica cuantica para siempre.",
    "La biodiversidad del Amazonas alberga mas de diez millones de especies diferentes.",
    "Shakespeare escribio treinta y siete obras que cambiaron la literatura universal para siempre.",
    "La teoria de la relatividad de Einstein redefinio nuestra comprension del espacio y tiempo.",
    "Los glaciares del artico se derriten a un ritmo alarmante e irreversible cada año.",
    "La arquitectura gotica se caracteriza por sus arcos ojivales y vitrales impresionantes de colores.",
    "El descubrimiento de la penicilina por Alexander Fleming salvo millones de vidas en el mundo.",
    "La criptografia cuantica promete comunicaciones completamente indescifrables en el futuro tecnologico cercano.",
    "Los agujeros negros supermasivos se encuentran en el centro de la mayoria de las galaxias.",
    "La revolucion industrial transformo radicalmente la economia y la estructura social del mundo entero.",
    "El cerebro humano contiene aproximadamente ochenta y seis mil millones de neuronas interconectadas.",
    "La obra maestra de Miguel Angel en la Capilla Sixtina fue pintada entre los años mil quinientos.",
    "Los ecosistemas de los arrecifes de coral sostienen mas del veinticinco por ciento de la vida marina.",
    "La conquista del espacio exterior representa uno de los mayores logros de la humanidad moderna.",
    "Las ondas gravitacionales fueron detectadas por primera vez en el año dos mil quince por LIGO.",
    "La filosofia griega antigua sento las bases del pensamiento occidental durante mas de dos milenios.",
    "Los dinosaurios dominaron la tierra durante mas de ciento sesenta millones de años antes de extinguirse.",
    "La musica clasica de Beethoven fue compuesta en gran parte cuando el compositor ya estaba sordo.",
    "El genoma humano fue completamente secuenciado despues de trece años de investigacion internacional.",
    "Las piramides de Giza fueron construidas hace mas de cuatro mil quinientos años con precision milimetrica.",
    "La energia renovable representara la mayor fuente de electricidad del planeta en las proximas decadas.",
    "El telescopio James Webb observa galaxias que se formaron poco despues del origen del universo.",
    "Los oceanos cubren mas del setenta por ciento de la superficie terrestre y regulan nuestro clima.",
    "La civilizacion maya desarrollo un calendario de extraordinaria precision astronomica sin usar telescopios.",
    "Los superconductores pueden transportar electricidad sin ninguna perdida de energia a temperaturas extremas.",
    "El sistema nervioso humano procesa señales electricas a velocidades de hasta ciento veinte metros por segundo.",
    "La torre Eiffel fue construida en apenas dos años como estructura temporal para una exposicion universal.",
    "Los quarks son particulas subatomicas fundamentales que componen protones y neutrones dentro del nucleo atomico."
];

let lastUsedIndex = { easy: -1, normal: -1, hard: -1 };
let shuffled = { easy: [], normal: [], hard: [] };

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function getRandomPhrase(difficulty = 'normal') {
    const lists = { easy: easyPhrases, normal: normalPhrases, hard: hardPhrases };
    const src = lists[difficulty] || lists.normal;

    if (!shuffled[difficulty] || shuffled[difficulty].length === 0 || lastUsedIndex[difficulty] >= shuffled[difficulty].length - 1) {
        shuffled[difficulty] = shuffle(src);
        lastUsedIndex[difficulty] = -1;
    }

    lastUsedIndex[difficulty]++;
    return shuffled[difficulty][lastUsedIndex[difficulty]];
}

module.exports = { getRandomPhrase };
