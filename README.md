# Typing Fighter 🚀

Un juego de mecanografía rápido y competitivo para dos jugadores con temática de batalla espacial, desarrollado con HTML, CSS (Vanilla), JavaScript, Node.js y Socket.IO.

## Características

- 🎮 **Multijugador en tiempo real:** Emparejamiento automático de dos jugadores usando Socket.IO.
- 🌌 **Temática Espacial:** Diseño inmersivo de un combate interestelar con constelaciones dinámicas de estrellas.
- 💥 **Combate Rápido:** Tipea frases completas para lanzar ataques láser a tu rival antes de que él lo haga.
- 🎨 **Renderizado Moderno:** Estilos glassmorphism y elementos SVG para que la interfaz se sienta de alta calidad y muy reactiva (efectos de daño, "glitches" y barras de vida interactivas).

## Instalación y Ejecución

Al ser un juego multijugador que depende de WebSockets, este proyecto tiene un servidor *backend* en Node.js, por lo tanto **no puede alojarse únicamente en plataformas de sitios estáticos como GitHub Pages**. Necesitas un servicio que ofrezca alojamiento y ejecución de Node.js (como Render, Heroku, Railway o un servidor VPS).

Para ejecutarlo localmente:

1. Clona el repositorio:
   ```bash
   git clone https://github.com/TU_USUARIO/typing-fighter.git
   cd typing-fighter
   ```

2. Instala las dependencias del servidor:
   ```bash
   cd server
   npm install
   ```

3. Inicia el servidor:
   ```bash
   node index.js
   ```

4. Abre tu navegador en `http://localhost:3000`. Abre una segunda ventana en la misma dirección para simular dos jugadores distintos y probar la mecánica de juego emparejando a ambos al presionar el botón de búsqueda.

## Estructura del Código

- `public/`: Contiene el cliente del juego (HTML, CSS y JS).
- `server/`: Contiene la lógica del servidor de Socket.IO, persistencia en memoria durante las salas y las listas de palabras.

¡Listos para tipear a la velocidad de la luz!
