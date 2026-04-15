require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');


// ================== MONGODB CONNECTION ==================
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("🔥 MongoDB connected"))
.catch(err => console.log("❌ MongoDB error:", err));


// ================== SERVER SETUP ==================
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, { cors: { origin: '*' } });

// attach io instance to app so controllers can emit events
app.set('io', io);


// ================== SOCKET AUTH ==================
io.use((socket, next) => {
  try {
    const jwt = require('jsonwebtoken');
    const token = socket.handshake.auth && socket.handshake.auth.token;

    if (!token) return next(new Error('Unauthorized'));

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    socket.data.userId = payload.id;
    return next();
  } catch (err) {
    return next(new Error('Unauthorized'));
  }
});


// ================== PRESENCE STORE ==================
const presence = new Map();

io.on('connection', (socket) => {

  // fetch display name
  (async () => {
    try {
      const User = require('./models/User');
      if (mongoose.connection.readyState === 1) {
        const u = await User.findById(socket.data.userId).select('displayName');
        if (u) socket.data.displayName = u.displayName || 'Anonymous';
      }
    } catch (e) {}
  })();


  // JOIN STORY ROOM
  socket.on('join:story', (storyId) => {
    if (!socket.data?.userId) return socket.emit('error', 'unauthorized');

    const room = `story_${storyId}`;
    socket.join(room);

    if (!presence.has(room)) presence.set(room, new Map());
    const roomMap = presence.get(room);

    const uid = String(socket.data.userId);
    const existing = roomMap.get(uid) || {
      displayName: socket.data.displayName || 'Anonymous',
      count: 0
    };

    existing.count += 1;
    roomMap.set(uid, existing);

    const list = Array.from(roomMap.entries()).map(([userId, info]) => ({
      userId,
      displayName: info.displayName,
      count: info.count
    }));

    io.to(room).emit('presence:update', list);
  });


  // LEAVE STORY
  socket.on('leave:story', (storyId) => {
    const room = `story_${storyId}`;
    socket.leave(room);

    const roomMap = presence.get(room);
    if (roomMap) {
      const uid = String(socket.data.userId);
      const existing = roomMap.get(uid);

      if (existing) {
        existing.count = Math.max(0, existing.count - 1);
        if (existing.count === 0) roomMap.delete(uid);
      }

      const list = Array.from(roomMap.entries()).map(([userId, info]) => ({
        userId,
        displayName: info.displayName,
        count: info.count
      }));

      io.to(room).emit('presence:update', list);
    }
  });


  // TYPING START
  socket.on('typing:start', (storyId) => {
    const room = `story_${storyId}`;
    const roomMap = presence.get(room);
    if (!roomMap) return;

    const uid = String(socket.data.userId);
    const info = roomMap.get(uid);
    if (info) info.typing = true;

    const list = Array.from(roomMap.entries()).map(([userId, info]) => ({
      userId,
      displayName: info.displayName,
      count: info.count,
      typing: !!info.typing
    }));

    io.to(room).emit('presence:update', list);
  });


  // TYPING STOP
  socket.on('typing:stop', (storyId) => {
    const room = `story_${storyId}`;
    const roomMap = presence.get(room);
    if (!roomMap) return;

    const uid = String(socket.data.userId);
    const info = roomMap.get(uid);
    if (info) info.typing = false;

    const list = Array.from(roomMap.entries()).map(([userId, info]) => ({
      userId,
      displayName: info.displayName,
      count: info.count,
      typing: !!info.typing
    }));

    io.to(room).emit('presence:update', list);
  });


  // DISCONNECT
  socket.on('disconnect', () => {
    for (const [room, roomMap] of presence.entries()) {
      const uid = String(socket.data.userId);
      const existing = roomMap.get(uid);

      if (existing) {
        existing.count = Math.max(0, existing.count - 1);
        if (existing.count === 0) roomMap.delete(uid);

        const list = Array.from(roomMap.entries()).map(([userId, info]) => ({
          userId,
          displayName: info.displayName,
          count: info.count
        }));

        io.to(room).emit('presence:update', list);
      }
    }
  });
});


// ================== START SERVER ==================
server.listen(PORT, () => {
  console.log('🚀 TaleVerse server running on port', PORT);
});