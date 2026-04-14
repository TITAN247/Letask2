import { NextResponse } from "next/server";
import { Server as NetServer } from "http";
import { Server as ServerIO } from "socket.io";

export const config = {
    api: {
        bodyParser: false,
    },
};

const SocketHandler = (req: any, res: any) => {
    if (res.socket.server.io) {
        console.log("Socket is already running");
    } else {
        console.log("Socket is initializing");
        const httpServer: NetServer = res.socket.server as any;
        const io = new ServerIO(httpServer, {
            path: "/api/socket/io",
            addTrailingSlash: false,
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        
        res.socket.server.io = io;

        io.on("connection", (socket) => {
            console.log("User connected:", socket.id);
            
            socket.on("join-room", (roomId: string) => {
                console.log(`User ${socket.id} joining room ${roomId}`);
                socket.join(roomId);
                
                // Notify others in the room
                socket.to(roomId).emit("user-joined", { userId: socket.id });
            });
            
            socket.on("leave-room", (roomId: string) => {
                console.log(`User ${socket.id} leaving room ${roomId}`);
                socket.leave(roomId);
                socket.to(roomId).emit("user-left", { userId: socket.id });
            });
            
            socket.on("offer", (data) => {
                console.log("Received offer");
                socket.to(data.roomId).emit("offer", {
                    offer: data.offer,
                    userId: socket.id
                });
            });
            
            socket.on("answer", (data) => {
                console.log("Received answer");
                socket.to(data.roomId).emit("answer", {
                    answer: data.answer,
                    userId: socket.id
                });
            });
            
            socket.on("ice-candidate", (data) => {
                console.log("Received ICE candidate");
                socket.to(data.roomId).emit("ice-candidate", {
                    candidate: data.candidate,
                    userId: socket.id
                });
            });
            
            socket.on("chat-message", (data) => {
                socket.to(data.roomId).emit("chat-message", {
                    message: data.message,
                    userId: socket.id,
                    senderName: data.senderName
                });
            });
            
            socket.on("disconnect", () => {
                console.log("User disconnected:", socket.id);
            });
        });
    }
    res.end();
};

export default SocketHandler;
