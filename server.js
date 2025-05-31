const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Serve React static files from /client/build
const buildPath = path.join(__dirname, 'client', 'build');
app.use(express.static(buildPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// --- ROOM LOGIC ---
const rooms = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('createRoom', ({ username }) => {
    console.log('Received createRoom from', username);
    const roomId = Math.random().toString(36).substring(2, 7).toUpperCase();
    rooms[roomId] = {
      players: [{ id: socket.id, symbol: 'X', username }],
      board: Array(9).fill(null),
      turn: 'X',
      winner: null,
    };
    socket.join(roomId);
    socket.emit('roomCreated', { roomId, symbol: 'X' });
    console.log(`${username} created room: ${roomId}`);
  });

  socket.on('joinRoom', ({ roomId, username }) => {
    const room = rooms[roomId];
    if (room && room.players.length < 2) {
      room.players.push({ id: socket.id, symbol: 'O', username });
      socket.join(roomId);
      socket.emit('roomJoined', { roomId, symbol: 'O' });
      io.to(roomId).emit('gameUpdate', {
        board: room.board,
        turn: room.turn,
        winner: room.winner,
      });
    } else {
      socket.emit('error', 'Room full or not found');
    }
  });

  socket.on('makeMove', ({ roomId, index, symbol }) => {
    const room = rooms[roomId];
    if (room && room.turn === symbol && !room.board[index]) {
      room.board[index] = symbol;
      room.turn = symbol === 'X' ? 'O' : 'X';
      room.winner = checkWinner(room.board);
      io.to(roomId).emit('gameUpdate', {
        board: room.board,
        turn: room.turn,
        winner: room.winner,
      });
    }
  });

  socket.on('sendMessage', ({ roomId, message, symbol, username }) => {
    io.to(roomId).emit('receiveMessage', {
      message,
      symbol,
      username,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('restartGame', ({ roomId }) => {
    const room = rooms[roomId];
    if (room) {
      room.board = Array(9).fill(null);
      room.turn = 'X';
      room.winner = null;
      io.to(roomId).emit('gameUpdate', {
        board: room.board,
        turn: room.turn,
        winner: null,
      });
    }
  });

  socket.on('disconnect', () => {
    for (const roomId in rooms) {
      const room = rooms[roomId];
      room.players = room.players.filter(p => p.id !== socket.id);
      if (room.players.length === 0) delete rooms[roomId];
    }
  });
});

function checkWinner(board) {
  const lines = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return board[a];
    }
  }
  if (board.every(cell => cell !== null)) return 'draw';
  return null;
}

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
