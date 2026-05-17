// backend/server.js
// =============================================
//  VIBELY — Main Server Entry Point
// =============================================
require('dotenv').config();
const express   = require('express');
const http      = require('http');
const { Server } = require('socket.io');
const cors      = require('cors');
const path      = require('path');

// Route imports
const authRoutes    = require('./routes/auth');
const userRoutes    = require('./routes/users');
const postRoutes    = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const likeRoutes    = require('./routes/likes');

// Middleware imports
const { errorHandler, notFound } = require('./middleware/error');

// ─── App setup ───────────────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);

// ─── Socket.io (real-time notifications) ─────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin:  '*',
    methods: ['GET', 'POST'],
  },
});

// Store online users: userId → socketId
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌  Socket connected:', socket.id);

  // Client sends their userId after connecting
  socket.on('user:online', (userId) => {
    onlineUsers.set(String(userId), socket.id);
    io.emit('online:users', Array.from(onlineUsers.keys()));
  });

  socket.on('disconnect', () => {
    for (const [uid, sid] of onlineUsers.entries()) {
      if (sid === socket.id) { onlineUsers.delete(uid); break; }
    }
    io.emit('online:users', Array.from(onlineUsers.keys()));
    console.log('🔌  Socket disconnected:', socket.id);
  });
});

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);
app.set('onlineUsers', onlineUsers);

// ─── Core middleware ──────────────────────────────────────────────────────────
app.use(cors({
  origin:  '*',          // tighten this in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Static files — serve uploaded images ────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/posts',    postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes',    likeRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '🟢 Vibely API is running', timestamp: new Date() });
});

// ─── Serve frontend static files (production) ────────────────────────────────
// In development you open frontend/pages/index.html directly in the browser.
// In production you could serve it from Express:
// app.use(express.static(path.join(__dirname, '../frontend')));
// app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/pages/index.html')));

// ─── Error handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀  Vibely server running on http://localhost:${PORT}`);
  console.log(`📡  Socket.io ready`);
  console.log(`🗄️   API base: http://localhost:${PORT}/api\n`);
});
