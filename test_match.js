const io = require("socket.io-client");

const socket1 = io("http://localhost:3000", { transports: ['websocket'] });
const socket2 = io("http://localhost:3000", { transports: ['websocket'] });

socket1.on('connect', () => {
    console.log('S1 Connected');
    socket1.emit('join_match', { username: 'Player1', difficulty: 'normal' });
});

socket2.on('connect', () => {
    console.log('S2 Connected');
    setTimeout(() => {
        socket2.emit('join_match', { username: 'Player2', difficulty: 'normal' });
    }, 1000);
});

socket1.on('match_started', (data) => console.log('S1: Match Started!', Object.keys(data.players)));
socket2.on('match_started', (data) => console.log('S2: Match Started!', Object.keys(data.players)));

setTimeout(() => {
    console.log('Test finished');
    process.exit(0);
}, 3000);
