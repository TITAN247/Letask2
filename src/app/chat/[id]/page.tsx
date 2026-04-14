"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Video, VideoOff, Mic, MicOff, MessageSquare, Phone, PhoneOff } from "lucide-react";
import { io, Socket } from "socket.io-client";

export default function ChatPage() {
    const params = useParams();
    const router = useRouter();
    const sessionId = params?.id as string | undefined;
    
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<Array<{sender: string, text: string, time: string, senderName?: string}>>([]);
    const [messageInput, setMessageInput] = useState("");
    const [socket, setSocket] = useState<Socket | null>(null);
    const [remoteUserId, setRemoteUserId] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'waiting'>('connecting');
    
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const roomId = `session_${sessionId}`;
    
    useEffect(() => {
        // Initialize Socket.io
        const newSocket = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000', {
            path: '/api/socket/io'
        });
        
        setSocket(newSocket);
        
        newSocket.on('connect', () => {
            console.log('Connected to signaling server');
            setIsConnected(true);
            newSocket.emit('join-room', roomId);
            setConnectionStatus('connected');
        });
        
        newSocket.on('user-joined', ({ userId }) => {
            console.log('Remote user joined:', userId);
            setRemoteUserId(userId);
            setConnectionStatus('connected');
            if (peerConnection.current) {
                createOffer();
            }
        });
        
        newSocket.on('user-left', ({ userId }) => {
            console.log('Remote user left:', userId);
            if (userId === remoteUserId) {
                setRemoteUserId(null);
                setConnectionStatus('waiting');
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = null;
                }
            }
        });
        
        newSocket.on('offer', async ({ offer, userId }) => {
            console.log('Received offer from:', userId);
            setRemoteUserId(userId);
            setConnectionStatus('connected');
            if (peerConnection.current) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await peerConnection.current.createAnswer();
                await peerConnection.current.setLocalDescription(answer);
                newSocket.emit('answer', { answer, roomId });
            }
        });
        
        newSocket.on('answer', async ({ answer }) => {
            console.log('Received answer');
            if (peerConnection.current) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
            }
        });
        
        newSocket.on('ice-candidate', async ({ candidate }) => {
            console.log('Received ICE candidate');
            if (peerConnection.current) {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });
        
        newSocket.on('chat-message', ({ message, senderName }) => {
            setMessages(prev => [...prev, {
                sender: 'Remote',
                text: message,
                time: new Date().toLocaleTimeString(),
                senderName
            }]);
        });
        
        // Initialize WebRTC after socket is connected
        if (newSocket.connected) {
            initializeChat();
        }
        
        return () => {
            newSocket.emit('leave-room', roomId);
            newSocket.disconnect();
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
            if (peerConnection.current) {
                peerConnection.current.close();
            }
        };
    }, [roomId]);
    
    const initializeChat = async () => {
        try {
            // Get user media with proper error handling
            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
            } catch (mediaError) {
                console.error("Media access error:", mediaError);
                alert("Please allow camera and microphone access for video chat");
                return;
            }
            
            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            
            // Create peer connection
            const pc = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            });
            
            // Add local stream to peer connection
            stream.getTracks().forEach((track: MediaStreamTrack) => {
                pc.addTrack(track, stream);
            });
            
            // Handle remote stream
            pc.ontrack = (event) => {
                console.log('Received remote stream');
                setRemoteStream(event.streams[0]);
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            };
            
            // Handle ICE candidates
            pc.onicecandidate = (event) => {
                if (event.candidate && socket) {
                    socket.emit('ice-candidate', {
                        candidate: event.candidate,
                        roomId
                    });
                }
            };
            
            peerConnection.current = pc;
            
        } catch (error) {
            console.error("Failed to initialize chat:", error);
            alert("Failed to initialize chat. Please check camera/microphone permissions.");
        }
    };
    
    const createOffer = async () => {
        if (!peerConnection.current || !socket) return;
        
        try {
            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);
            socket.emit('offer', { offer, roomId });
        } catch (error) {
            console.error("Error creating offer:", error);
        }
    };
    
    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoOn(videoTrack.enabled);
        }
    };
    
    const toggleMic = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
            setIsMicOn(audioTrack.enabled);
        }
    };
    
    const sendMessage = () => {
        if (messageInput.trim() && socket) {
            const newMessage = {
                sender: 'You',
                text: messageInput,
                time: new Date().toLocaleTimeString()
            };
            setMessages(prev => [...prev, newMessage]);
            
            socket.emit('chat-message', {
                message: messageInput,
                roomId,
                senderName: 'You'
            });
            
            setMessageInput("");
        }
    };
    
    const endCall = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        if (peerConnection.current) {
            peerConnection.current.close();
        }
        if (socket) {
            socket.emit('leave-room', roomId);
        }
        router.push("/dashboard/prementor");
    };
    
    return (
        <div className="min-h-screen bg-slate-900 flex">
            {/* Video Section */}
            <div className="flex-1 flex flex-col">
                <div className="flex-1 relative bg-black">
                    {/* Remote Video (Main) */}
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                    
                    {/* Local Video (Picture-in-Picture) */}
                    <div className="absolute bottom-4 right-4 w-48 h-36 bg-slate-800 rounded-lg overflow-hidden shadow-lg">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                    </div>
                    
                    {/* Connection Status */}
                    <div className="absolute top-4 left-4">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            isConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                            {connectionStatus === 'connecting' ? 'Connecting...' : 
                             connectionStatus === 'waiting' ? 'Waiting for remote user...' : 
                             'Connected'}
                        </div>
                        {remoteUserId && (
                            <div className="mt-2 px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium">
                                Remote User Connected
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Controls */}
                <div className="bg-slate-800 p-4 flex items-center justify-center gap-4">
                    <button
                        onClick={toggleVideo}
                        className={`p-3 rounded-full transition-colors ${
                            isVideoOn ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                    >
                        {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
                    </button>
                    
                    <button
                        onClick={toggleMic}
                        className={`p-3 rounded-full transition-colors ${
                            isMicOn ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                    >
                        {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                    </button>
                    
                    <button
                        onClick={endCall}
                        className="px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center gap-2"
                    >
                        <PhoneOff size={20} />
                        End Call
                    </button>
                </div>
            </div>
            
            {/* Chat Section */}
            <div className="w-80 bg-slate-800 flex flex-col">
                <div className="p-4 border-b border-slate-700">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                        <MessageSquare size={20} />
                        Chat
                    </h3>
                </div>
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] px-3 py-2 rounded-lg ${
                                msg.sender === 'You' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-white'
                            }`}>
                                <p className="text-sm">{msg.text}</p>
                                <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Message Input */}
                <div className="p-4 border-t border-slate-700">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Type a message..."
                            className="flex-1 px-3 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={sendMessage}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
