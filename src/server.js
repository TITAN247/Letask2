const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

console.log(`[Server] Starting in ${process.env.NODE_ENV || 'development'} mode`);
console.log(`[Server] Port: ${port}, Hostname: ${hostname}`);

// Create HTTP server IMMEDIATELY - don't wait for Next.js
const httpServer = createServer();

// Basic request handler that will be replaced after Next.js is ready
let requestHandler = async (req, res) => {
    const parsedUrl = parse(req.url, true);
    
    // Health check must always work
    if (parsedUrl.pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'ok', 
            timestamp: new Date().toISOString(),
            mode: process.env.NODE_ENV || 'development'
        }));
        return;
    }
    
    // Service unavailable while starting
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'starting', message: 'Server is starting up...' }));
};

// Attach request handler to server
httpServer.on('request', (req, res) => {
    requestHandler(req, res).catch(err => {
        console.error('[Server] Request error:', err);
        res.statusCode = 500;
        res.end('Internal server error');
    });
});

// Start listening immediately
httpServer.listen(port, hostname, () => {
    console.log(`[Server] Listening on http://${hostname}:${port}`);
    console.log(`[Server] Health check: http://${hostname}:${port}/health`);
});

// Initialize Next.js asynchronously
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    console.log('[Next.js] App prepared successfully');
    
    // Replace request handler with Next.js handler
    requestHandler = async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            
            if (parsedUrl.pathname === '/health') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    status: 'ok', 
                    ready: true,
                    timestamp: new Date().toISOString()
                }));
                return;
            }
            
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('[Next.js] Error handling request:', req.url, err);
            res.statusCode = 500;
            res.end('Internal server error');
        }
    };
    
    console.log('[Server] Ready to handle requests');
}).catch(err => {
    console.error('[Next.js] Failed to prepare:', err);
    // Keep server running but requests will show 503
});

// Attach Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "*",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    socket.on("join-session", (sessionId) => {
        socket.join(sessionId);
        console.log(`[Socket.io] ${socket.id} joined session ${sessionId}`);
    });

    socket.on("send-message", (data) => {
        io.to(data.sessionId).emit("receive-message", data);
    });

    socket.on("typing", (channelName) => {
        socket.to(channelName).emit("peer-typing");
    });

    socket.on("message-read", (data) => {
        socket.to(data.channel).emit("message-read-update", data);
    });

    socket.on("join-video-room", (sessionId) => {
        socket.join(sessionId);
        socket.to(sessionId).emit("user-joined");
    });

    socket.on("video-offer", (data) => {
        socket.to(data.sessionId).emit("video-offer", { offer: data.offer, fromSocketId: socket.id });
    });

    socket.on("video-answer", (data) => {
        socket.to(data.sessionId).emit("video-answer", { answer: data.answer });
    });

    socket.on("ice-candidate", (data) => {
        socket.to(data.sessionId).emit("ice-candidate", { candidate: data.candidate });
    });

    socket.on("webrtc-offer", (data) => {
        socket.to(data.sessionId).emit("webrtc-offer", data);
    });
    
    socket.on("webrtc-answer", (data) => {
        socket.to(data.sessionId).emit("webrtc-answer", data);
    });
    
    socket.on("webrtc-ice-candidate", (data) => {
        socket.to(data.sessionId).emit("webrtc-ice-candidate", data);
    });

    socket.on("disconnect", () => {
        console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
});

httpServer.once("error", (err) => {
    console.error("[Server] Fatal error:", err);
    process.exit(1);
});
