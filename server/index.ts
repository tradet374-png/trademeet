// server/index.ts
import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import { roomManager } from './rooms';
import { searchGifs } from './gifs';
import { generateLiveKitToken } from './livekit';
import { setupSocketServer } from './socket';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const PORT = Number(process.env.PORT) || 5000;

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

// Initialize Socket.io
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 30000,
  pingInterval: 10000,
});

setupSocketServer(io);

// ================= API ROUTES =================

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: Date.now(),
    service: 'TradeMeet Server Engine (Multi-Screen & Voice/Video/Chat)',
  });
});

// List all active rooms
app.get('/api/rooms', (req: Request, res: Response) => {
  const rooms = roomManager.getAllActiveRooms();
  res.json({
    success: true,
    rooms,
    totalActiveRooms: rooms.filter((r) => r.isActive).length,
  });
});

// Check status of a single server room
app.get('/api/rooms/:serverId', (req: Request, res: Response) => {
  const { serverId } = req.params;
  const room = roomManager.getRoom(serverId);

  if (!room) {
    res.json({
      success: true,
      exists: false,
      isActive: false,
      participantCount: 0,
      serverNumber: serverId,
      activeScreensCount: 0,
    });
    return;
  }

  const participants = roomManager.getParticipants(serverId);
  const activeScreens = roomManager.getActiveScreens(serverId);

  res.json({
    success: true,
    exists: true,
    isActive: participants.length > 0 || room.hostId === 'system',
    participantCount: participants.length,
    activeScreensCount: activeScreens.length,
    serverNumber: serverId,
    roomName: room.roomName,
    hasHost: Boolean(room.hostId && room.hostId !== 'system'),
  });
});

// Create or verify room
app.post('/api/rooms/create', (req: Request, res: Response) => {
  const { serverNumber, roomName } = req.body;
  if (!serverNumber) {
    res.status(400).json({ error: 'Server number is required.' });
    return;
  }
  const room = roomManager.createRoom(serverNumber, roomName);
  res.json({ success: true, room });
});

// GIF search
app.get('/api/gifs', async (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  const category = (req.query.category as string) || '';

  try {
    const gifs = await searchGifs(query, category);
    res.json({ success: true, gifs });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch GIFs', details: err.message });
  }
});

// LiveKit Access Token generator for SFU connection
app.post('/api/livekit/token', async (req: Request, res: Response) => {
  const { roomName, participantId, participantName } = req.body;
  if (!roomName || !participantId) {
    res.status(400).json({ error: 'roomName and participantId are required' });
    return;
  }

  const result = await generateLiveKitToken(
    roomName,
    participantId,
    participantName || `Trader-${participantId.slice(0, 4)}`
  );

  res.json(result);
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start HTTP & WebSocket server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 TradeMeet Backend Server listening on port ${PORT}`);
  console.log(`📡 WebSocket server running for multi-screen & voice/video/chat`);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    const fallbackPort = PORT + 1;
    console.warn(`⚠️ Port ${PORT} in use, automatically listening on fallback port ${fallbackPort}...`);
    server.listen(fallbackPort, '0.0.0.0');
  }
});
