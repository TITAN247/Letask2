const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0"; // Always bind to all interfaces
const port = parseInt(process.env.PORT || "3000", 10);

console.log(`Starting server in ${process.env.NODE_ENV || 'development'} mode`);
console.log(`Port: ${port}, Hostname: ${hostname}`);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer((req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            
            // Health check endpoint for Render
            if (parsedUrl.pathname === '/health') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
                return;
            }
            
            handle(req, res, parsedUrl);
        } catch (err) {
            console.error("Error occurred handling", req.url, err);
            res.statusCode = 500;
            res.end("internal server error");
        }
    });

    // Attach Socket.io to the Node Http Server
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.NEXT_PUBLIC_APP_URL || "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log(`[Socket.io] New client connected: ${socket.id}`);

        socket.on("join-session", (sessionId) => {
            socket.join(sessionId);
            console.log(`[Socket.io] Client ${socket.id} joined session ${sessionId}`);
        });

        socket.on("send-message", (data) => {
            console.log(`[Socket.io] Message sent in ${data.sessionId}: ${data.text}`);
            io.to(data.sessionId).emit("receive-message", data);
        });

        socket.on("typing", (channelName) => {
            socket.to(channelName).emit("peer-typing");
        });

        socket.on("message-read", (data) => {
            socket.to(data.channel).emit("message-read-update", data);
        });

        // Video Room WebRTC Signaling
        socket.on("join-video-room", (sessionId) => {
            socket.join(sessionId);
            socket.to(sessionId).emit("user-joined");
            console.log(`[Socket.io] Client ${socket.id} joined video room ${sessionId}`);
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

        // Legacy WebRTC Signaling (for chat)
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
        console.error(err);
        process.exit(1);
    });

    const PORT = process.env.PORT || 3000;
    const HOST = process.env.HOST || '0.0.0.0';

    httpServer.listen(PORT, HOST, () => {
        console.log(`> Ready on http://${HOST}:${PORT} (Custom Server + Socket.io)`);
        console.log(`> Local: http://localhost:${PORT}`);
        console.log(`> Network: http://${HOST}:${PORT}`);
    });
});
