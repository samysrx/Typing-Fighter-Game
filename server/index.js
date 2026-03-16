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
    methods: ["GET", "POST"]
  }
});

app.use(express.static(path.join(__dirname, '../docs')));

const PORT = process.env.PORT || 3000;

// Game State
// rooms: { roomId: { players: { socketId: { id, health, points, ready } }, status: 'waiting' | 'playing', currentPhrase: '' } }
const rooms = {};
let globalLeaderboard = {}; // In-Memory Leaderboard: key -> lowercase username, value -> { username, wins }

// Constants
const MAX_HEALTH = 100;
const DAMAGE_PER_WORD = 20;
const PHRASE_TIME_LIMIT = 15; // seconds per phrase
const PHRASE_TIMEOUT_DAMAGE = 10; // damage to BOTH players if no one completes the phrase

function recordWin(username) {
  if (!username) return;
  const winnerKey = username.toLowerCase();
  if (!globalLeaderboard[winnerKey]) {
    globalLeaderboard[winnerKey] = { username: username, wins: 0 };
  }
  globalLeaderboard[winnerKey].wins += 1;
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_match', (data) => {
    const username = data?.username || 'Piloto Espacial';
    let roomId = null;

    // Find an available room with 1 player (ANY difficulty constraint removed)
    for (const [id, room] of Object.entries(rooms)) {
      if (room.status === 'waiting' && Object.keys(room.players).length === 1) {
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
        difficulty: 'normal',
        timeLeft: 180,
        timerInterval: null,
        phraseTimer: null,
        phraseTimeLeft: 0
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

        // Start Timer
        rooms[roomId].timerInterval = setInterval(() => {
          rooms[roomId].timeLeft -= 1;
          io.to(roomId).emit('timer_tick', { timeLeft: rooms[roomId].timeLeft });

          if (rooms[roomId].timeLeft <= 0) {
            clearInterval(rooms[roomId].timerInterval);
            rooms[roomId].status = 'finished';

            // Determine winner by health on timeout
            const pIds = Object.keys(rooms[roomId].players);
            if (pIds.length === 2) {
              const p1 = rooms[roomId].players[pIds[0]];
              const p2 = rooms[roomId].players[pIds[1]];
              let winner = null, loser = null;
              if (p1.health > p2.health) { winner = p1; loser = p2; }
              else if (p2.health > p1.health) { winner = p2; loser = p1; }

              if (winner) {
                recordWin(winner.username);
                io.to(roomId).emit('game_over', { winnerId: winner.id, loserId: loser.id, reason: 'timeout' });
                return;
              }
            }
            io.to(roomId).emit('game_over', { reason: 'timeout_tie' });
          }
        }, 1000);

      }, 3000);
    }
  });

  socket.on('type_word', (data) => {
    const { roomId, input } = data;
    const room = rooms[roomId];

    if (!room || room.status !== 'playing') return;

    if (input === room.currentPhrase) {
      clearPhraseTimer(roomId);

      const playerIds = Object.keys(room.players);
      const opponentId = playerIds.find(id => id !== socket.id);
      const player = room.players[socket.id];
      const opponent = room.players[opponentId];

      if (opponentId && opponent) {
        opponent.health -= DAMAGE_PER_WORD;
        player.points += 1;

        io.to(roomId).emit('phrase_completed', {
          winnerId: socket.id,
          phrase: room.currentPhrase,
          players: room.players
        });

        if (opponent.health <= 0) {
          clearInterval(room.timerInterval);
          room.status = 'finished';
          recordWin(player.username);
          io.to(roomId).emit('game_over', {
            winnerId: socket.id,
            loserId: opponent.id,
            reason: 'health_depleted'
          });
          return;
        }

        setTimeout(() => {
          if (room && room.status === 'playing') {
            sendNewPhrase(roomId);
          }
        }, 1500);
      }
    }
  });

  // Chat
  socket.on('send_chat_msg', (data) => {
    const { roomId, text, sender } = data;
    if (rooms[roomId]) {
      io.to(roomId).emit('chat_msg_received', { sender, text, senderId: socket.id });
    }
  });

  // Cancel Matchmaking
  socket.on('cancel_match', () => {
    for (const [roomId, room] of Object.entries(rooms)) {
      if (room.players[socket.id] && room.status === 'waiting') {
        delete room.players[socket.id];
        socket.leave(roomId);

        if (Object.keys(room.players).length === 0) {
          delete rooms[roomId];
        }
        break;
      }
    }
  });

  // Surrender
  socket.on('surrender_match', (data) => {
    const { roomId } = data;
    const room = rooms[roomId];
    if (room && room.status === 'playing') {
      clearInterval(room.timerInterval);
      clearPhraseTimer(roomId);
      room.status = 'finished';

      const playerIds = Object.keys(room.players);
      const opponentId = playerIds.find(id => id !== socket.id);
      const opponent = room.players[opponentId];

      if (opponent) {
        recordWin(opponent.username);
      }

      io.to(roomId).emit('game_over', {
        winnerId: opponentId,
        loserId: socket.id,
        reason: 'surrender'
      });
    }
  });

  // Fetch Leaderboard
  socket.on('get_leaderboard', () => {
    // Convert object to array, sort by wins descending, and get Top 10
    const topPlayers = Object.values(globalLeaderboard)
      .sort((a, b) => b.wins - a.wins)
      .slice(0, 10);

    socket.emit('leaderboard_data', topPlayers);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    // Clean up rooms
    for (const [roomId, room] of Object.entries(rooms)) {
      if (room.players[socket.id]) {
        clearInterval(room.timerInterval);
        clearPhraseTimer(roomId);
        delete room.players[socket.id];

        if (room.status === 'playing') {
          room.status = 'finished';

          const stayerId = Object.keys(room.players).find(id => id !== socket.id);
          if (stayerId) {
            recordWin(room.players[stayerId].username);
          }

          socket.to(roomId).emit('opponent_disconnected');
        }

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

  socket.on('request_ai_phrase', (difficulty) => {
    const phrase = getRandomPhrase(difficulty);
    socket.emit('ai_phrase_received', { phrase });
  });

  function clearPhraseTimer(roomId) {
    if (rooms[roomId] && rooms[roomId].phraseTimer) {
      clearInterval(rooms[roomId].phraseTimer);
      rooms[roomId].phraseTimer = null;
    }
  }

  function startPhraseTimer(roomId) {
    const room = rooms[roomId];
    if (!room) return;

    clearPhraseTimer(roomId);
    room.phraseTimeLeft = PHRASE_TIME_LIMIT;

    room.phraseTimer = setInterval(() => {
      room.phraseTimeLeft -= 1;
      io.to(roomId).emit('phrase_timer_tick', { timeLeft: room.phraseTimeLeft });

      if (room.phraseTimeLeft <= 0) {
        clearPhraseTimer(roomId);

        const playerIds = Object.keys(room.players);
        playerIds.forEach(pid => {
          room.players[pid].health -= PHRASE_TIMEOUT_DAMAGE;
        });

        io.to(roomId).emit('phrase_expired', {
          players: room.players
        });

        const deadPlayers = playerIds.filter(pid => room.players[pid].health <= 0);

        if (deadPlayers.length === 2 || deadPlayers.length === playerIds.length) {
          clearInterval(room.timerInterval);
          room.status = 'finished';
          io.to(roomId).emit('game_over', { reason: 'timeout_tie' });
          return;
        }

        if (deadPlayers.length === 1) {
          clearInterval(room.timerInterval);
          room.status = 'finished';
          const loserId = deadPlayers[0];
          const winnerId = playerIds.find(id => id !== loserId);
          recordWin(room.players[winnerId].username);
          io.to(roomId).emit('game_over', {
            winnerId,
            loserId,
            reason: 'health_depleted'
          });
          return;
        }

        if (room.status === 'playing') {
          setTimeout(() => {
            if (rooms[roomId] && rooms[roomId].status === 'playing') {
              sendNewPhrase(roomId);
            }
          }, 1500);
        }
      }
    }, 1000);
  }

  function sendNewPhrase(roomId) {
    if (rooms[roomId]) {
      const phrase = getRandomPhrase(rooms[roomId].difficulty);
      rooms[roomId].currentPhrase = phrase;
      io.to(roomId).emit('new_phrase', { phrase, timeLimit: PHRASE_TIME_LIMIT });
      startPhraseTimer(roomId);
    }
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
