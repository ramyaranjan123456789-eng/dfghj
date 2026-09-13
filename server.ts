import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

interface ScannedImage {
  id: string;
  dataUrl: string;
  name: string;
  rotation: number;
  timestamp: number;
}

interface ScanSession {
  sessionId: string;
  createdAt: number;
  updatedAt: number;
  status: 'disconnected' | 'connecting' | 'connected' | 'uploading' | 'finished';
  desktopSockets: Set<WebSocket>;
  mobileSockets: Set<WebSocket>;
  images: ScannedImage[];
}

const app = express();
const server = http.createServer(app);
const PORT = 3000;

// Increase body limit for large scanned image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Active scan sessions map
const sessions = new Map<string, ScanSession>();

// Cleanup inactive sessions every 10 minutes
setInterval(() => {
  const now = Date.now();
  const maxAge = 30 * 60 * 1000; // 30 mins
  for (const [id, session] of sessions.entries()) {
    if (now - session.updatedAt > maxAge) {
      sessions.delete(id);
    }
  }
}, 10 * 60 * 1000);

function getOrCreateSession(sessionId: string): ScanSession {
  const cleanId = sessionId.trim().toUpperCase();
  let session = sessions.get(cleanId);
  if (!session) {
    session = {
      sessionId: cleanId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'disconnected',
      desktopSockets: new Set(),
      mobileSockets: new Set(),
      images: [],
    };
    sessions.set(cleanId, session);
  } else {
    session.updatedAt = Date.now();
  }
  return session;
}

function broadcastToSession(session: ScanSession, event: object) {
  const payload = JSON.stringify(event);
  const allSockets = new Set([...session.desktopSockets, ...session.mobileSockets]);
  for (const ws of allSockets) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}

// REST API Endpoints

// Create or verify session
app.post('/api/scan/session/create', (req, res) => {
  const newId = req.body?.sessionId || Math.random().toString(36).substring(2, 8).toUpperCase();
  const session = getOrCreateSession(newId);
  res.json({
    success: true,
    sessionId: session.sessionId,
    status: session.status,
    imageCount: session.images.length,
  });
});

// Get session status & images
app.get('/api/scan/session/:id', (req, res) => {
  const sessionId = req.params.id.toUpperCase();
  const session = sessions.get(sessionId);
  if (!session) {
    res.status(404).json({ success: false, error: 'Session not found or expired' });
    return;
  }
  res.json({
    success: true,
    sessionId: session.sessionId,
    status: session.status,
    images: session.images,
    desktopConnected: session.desktopSockets.size > 0,
    mobileConnected: session.mobileSockets.size > 0,
  });
});

// Upload scanned images endpoint
app.post('/api/scan/upload', (req, res) => {
  const { sessionId, images, isComplete } = req.body;
  if (!sessionId) {
    res.status(400).json({ success: false, error: 'Missing sessionId' });
    return;
  }

  const session = getOrCreateSession(sessionId);
  session.updatedAt = Date.now();

  if (Array.isArray(images) && images.length > 0) {
    const existingIds = new Set(session.images.map((img) => img.id));
    const newScans: ScannedImage[] = [];

    images.forEach((img: any, idx: number) => {
      let id = img.id;
      if (!id || existingIds.has(id)) {
        id = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${idx}`;
      }
      existingIds.add(id);

      newScans.push({
        id,
        dataUrl: typeof img === 'string' ? img : img.dataUrl,
        name: img.name || `Scanned Page ${session.images.length + newScans.length + 1}`,
        rotation: img.rotation || 0,
        timestamp: Date.now(),
      });
    });

    session.images.push(...newScans);
  }

  session.status = isComplete ? 'finished' : 'connected';

  // Broadcast real-time update to all connected sockets
  broadcastToSession(session, {
    type: 'SESSION_UPDATE',
    status: session.status,
    images: session.images,
    addedCount: Array.isArray(images) ? images.length : 0,
    message: 'New pages uploaded successfully',
  });

  res.json({
    success: true,
    sessionId: session.sessionId,
    status: session.status,
    totalImages: session.images.length,
  });
});

// Delete a single page from session
app.delete('/api/scan/session/:id/pages/:pageId', (req, res) => {
  const sessionId = req.params.id.toUpperCase();
  const { pageId } = req.params;
  const session = sessions.get(sessionId);

  if (!session) {
    res.status(404).json({ success: false, error: 'Session not found' });
    return;
  }

  session.images = session.images.filter((img) => img.id !== pageId);
  session.updatedAt = Date.now();

  broadcastToSession(session, {
    type: 'SESSION_UPDATE',
    status: session.status,
    images: session.images,
    message: 'Page removed',
  });

  res.json({ success: true, images: session.images });
});

// Reorder pages in session
app.post('/api/scan/session/:id/reorder', (req, res) => {
  const sessionId = req.params.id.toUpperCase();
  const { imageIds } = req.body;
  const session = sessions.get(sessionId);

  if (!session || !Array.isArray(imageIds)) {
    res.status(400).json({ success: false, error: 'Invalid request' });
    return;
  }

  const imageMap = new Map(session.images.map((img) => [img.id, img]));
  const reordered: ScannedImage[] = [];

  for (const id of imageIds) {
    const item = imageMap.get(id);
    if (item) reordered.push(item);
  }

  session.images = reordered;
  session.updatedAt = Date.now();

  broadcastToSession(session, {
    type: 'SESSION_UPDATE',
    status: session.status,
    images: session.images,
    message: 'Pages reordered',
  });

  res.json({ success: true, images: session.images });
});

// WebSocket Server Integration
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

wss.on('connection', (ws: WebSocket, req) => {
  let currentSessionId: string | null = null;
  let clientRole: 'desktop' | 'mobile' | null = null;

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === 'REGISTER') {
        const { sessionId, role } = data; // role: 'desktop' | 'mobile'
        if (!sessionId) return;

        currentSessionId = sessionId.trim().toUpperCase();
        clientRole = role || 'desktop';

        const session = getOrCreateSession(currentSessionId);

        if (clientRole === 'desktop') {
          session.desktopSockets.add(ws);
        } else {
          session.mobileSockets.add(ws);
          // If mobile joins, update status to connected if previously disconnected
          if (session.status === 'disconnected') {
            session.status = 'connected';
          }
        }

        // Notify caller of current session state
        ws.send(
          JSON.stringify({
            type: 'REGISTER_ACK',
            sessionId: session.sessionId,
            status: session.status,
            images: session.images,
            desktopConnected: session.desktopSockets.size > 0,
            mobileConnected: session.mobileSockets.size > 0,
          })
        );

        // Notify desktop if mobile connected
        broadcastToSession(session, {
          type: 'PEER_STATUS',
          status: session.status,
          desktopConnected: session.desktopSockets.size > 0,
          mobileConnected: session.mobileSockets.size > 0,
        });
      } else if (data.type === 'STATUS_CHANGE') {
        if (!currentSessionId) return;
        const session = sessions.get(currentSessionId);
        if (session) {
          session.status = data.status;
          session.updatedAt = Date.now();
          broadcastToSession(session, {
            type: 'STATUS_CHANGE',
            status: session.status,
            progress: data.progress || 0,
          });
        }
      } else if (data.type === 'ADD_IMAGES') {
        if (!currentSessionId) return;
        const session = sessions.get(currentSessionId);
        if (session && Array.isArray(data.images)) {
          const existingIds = new Set(session.images.map((img) => img.id));
          const newScans: ScannedImage[] = [];

          data.images.forEach((img: any, idx: number) => {
            let id = img.id;
            if (!id || existingIds.has(id)) {
              id = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${idx}`;
            }
            existingIds.add(id);

            newScans.push({
              id,
              dataUrl: typeof img === 'string' ? img : img.dataUrl,
              name: img.name || `Page ${session.images.length + newScans.length + 1}`,
              rotation: img.rotation || 0,
              timestamp: Date.now(),
            });
          });

          session.images.push(...newScans);
          session.status = data.isComplete ? 'finished' : 'connected';
          session.updatedAt = Date.now();

          broadcastToSession(session, {
            type: 'SESSION_UPDATE',
            status: session.status,
            images: session.images,
            addedCount: newScans.length,
          });
        }
      }
    } catch (err) {
      console.error('WebSocket message parsing error:', err);
    }
  });

  ws.on('close', () => {
    if (currentSessionId) {
      const session = sessions.get(currentSessionId);
      if (session) {
        if (clientRole === 'desktop') {
          session.desktopSockets.delete(ws);
        } else if (clientRole === 'mobile') {
          session.mobileSockets.delete(ws);
          if (session.mobileSockets.size === 0 && session.images.length === 0) {
            session.status = 'disconnected';
          }
        }

        broadcastToSession(session, {
          type: 'PEER_STATUS',
          status: session.status,
          desktopConnected: session.desktopSockets.size > 0,
          mobileConnected: session.mobileSockets.size > 0,
        });
      }
    }
  });
});

// Serve frontend apps
async function startApp() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Scan to PDF Server listening on http://0.0.0.0:${PORT}`);
  });
}

startApp().catch((err) => {
  console.error('Server startup error:', err);
});
