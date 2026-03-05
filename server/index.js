const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { getRandomPhrase } = require('./words');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

// Serve frontend files
app.use(express.static(path.join(__dirname, '../public')));

const PORT = process.env.PORT || 3000;

// Game State
// rooms: { roomId: { players: { socketId: { id, health, points, ready } }, status: 'waiting' | 'playing', currentPhrase: '' } }
const rooms = {};

// Constants
const MAX_HEALTH = 100;
const DAMAGE_PER_PHRASE = 15;

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_match', (data) => {
    const username = data?.username || 'Piloto Espacial';
    const difficulty = data?.difficulty || 'normal';
    let roomId = null;

    // Find an available room with 1 player AND matching difficulty
    for (const [id, room] of Object.entries(rooms)) {
      if (room.status === 'waiting' && Object.keys(room.players).length === 1 && room.difficulty === difficulty) {
        roomId = id;
        break;
      }
    }

    // If no room found, create one
    if (!roomId) {
      roomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      rooms[roomId] = {
        players: {},
        status: 'waiting',
        currentPhrase: '',
        difficulty: difficulty
      };
    }

    // Add player to room
    socket.join(roomId);
    rooms[roomId].players[socket.id] = { id: socket.id, username: username, health: MAX_HEALTH, points: 0, ready: true };

    console.log(`User ${socket.id} joined room ${roomId}`);

    // Notify player they've joined
    socket.emit('match_joined', { roomId, players: Object.keys(rooms[roomId].players) });

    // Notify room of new player
    socket.to(roomId).emit('player_joined', { playerId: socket.id });

    // Check if room is full
    const playerIds = Object.keys(rooms[roomId].players);
    if (playerIds.length === 2 && rooms[roomId].status === 'waiting') {
      rooms[roomId].status = 'playing';

      // Start match
      io.to(roomId).emit('match_started', {
        players: rooms[roomId].players
      });

      // Send first phrase after 3 seconds
      io.to(roomId).emit('countdown', { seconds: 3 });

      setTimeout(() => {
        sendNewPhrase(roomId);
      }, 3000);
    }
  });

  socket.on('type_word', (data) => {
    const { roomId, input } = data;
    const room = rooms[roomId];

    if (!room || room.status !== 'playing') return;

    if (input === room.currentPhrase) {
      // Player typed phrase correctly!
      const playerIds = Object.keys(room.players);
      const opponentId = playerIds.find(id => id !== socket.id);

      if (opponentId && room.players[opponentId]) {
        // Deal damage
        room.players[opponentId].health -= DAMAGE_PER_PHRASE;
        room.players[socket.id].points += 1;

        io.to(roomId).emit('phrase_completed', {
          winnerId: socket.id,
          phrase: room.currentPhrase,
          players: room.players
        });

        // Check for Game Over
        if (room.players[opponentId].health <= 0) {
          room.status = 'finished';
          io.to(roomId).emit('game_over', {
            winnerId: socket.id,
            players: room.players
          });
        } else {
          // Send next phrase
          setTimeout(() => {
            if (room && room.status === 'playing') {
              sendNewPhrase(roomId);
            }
          }, 1500); // 1.5s delay before next phrase
        }
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    // Clean up rooms
    for (const [roomId, room] of Object.entries(rooms)) {
      if (room.players[socket.id]) {
        delete room.players[socket.id];
        socket.to(roomId).emit('opponent_disconnected');

        // If room is empty, delete it
        if (Object.keys(room.players).length === 0) {
          delete rooms[roomId];
        } else {
          // Reset game if someone left
          room.status = 'waiting';
        }
      }
    }
  });

  function sendNewPhrase(roomId) {
    if (rooms[roomId]) {
      const phrase = getRandomPhrase(rooms[roomId].difficulty);
      rooms[roomId].currentPhrase = phrase;
      io.to(roomId).emit('new_phrase', { phrase });
    }
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
