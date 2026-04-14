"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { io } from "socket.io-client";

export default function VideoRoomClient() {
    const params = useParams();
    const router = useRouter();
    const sessionId = params?.sessionId as string | undefined;
    
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState("");
    
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const socketRef = useRef<any>(null);

    useEffect(() => {
        if (!sessionId) return;

        const initVideo = async () => {
            try {
                // Check if mediaDevices is available (requires HTTPS on non-localhost)
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    throw new Error('Camera access requires HTTPS or localhost. For testing on network: use ngrok or enable chrome://flags/#unsafely-treat-insecure-origin-as-secure');
                }
                
                // Get user media
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: true, 
                    audio: true 
                });
                setLocalStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                // Initialize WebRTC peer connection
                const pc = new RTCPeerConnection({
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' }
                    ]
                });
                pcRef.current = pc;

                // Add local stream tracks to peer connection
                stream.getTracks().forEach(track => {
                    pc.addTrack(track, stream);
                });

                // Handle remote stream
                pc.ontrack = (event) => {
                    if (event.streams[0]) {
                        setRemoteStream(event.streams[0]);
                        if (remoteVideoRef.current) {
                            remoteVideoRef.current.srcObject = event.streams[0];
                        }
                    }
                };

                // Connect to signaling server
                const socket = io(window.location.origin);
                socketRef.current = socket;

                socket.emit('join-video-room', sessionId, () => {
                    console.log('Joined video room:', sessionId);
                });

                // Track if we've already sent an offer to prevent duplicate offers
                let hasSentOffer = false;
                
                socket.on('user-joined', async () => {
                    // Only create offer if we haven't already and connection is in valid state
                    if (hasSentOffer || pc.signalingState !== 'stable') {
                        console.log('Skipping offer creation - already sent or not in stable state');
                        return;
                    }
                    
                    try {
                        hasSentOffer = true;
                        const offer = await pc.createOffer();
                        await pc.setLocalDescription(offer);
                        socket.emit('video-offer', { sessionId, offer });
                    } catch (err) {
                        console.error('Error creating offer:', err);
                        hasSentOffer = false;
                    }
                });

                socket.on('video-offer', async (data: { offer: RTCSessionDescriptionInit }) => {
                    // Only process offer if we're in a valid state to receive it
                    if (pc.signalingState !== 'stable' && pc.signalingState !== 'have-local-offer') {
                        console.log('Ignoring offer - not in valid state:', pc.signalingState);
                        return;
                    }
                    
                    // If we already sent an offer (glare condition), use SDP rollback or ignore based on ID comparison
                    if (pc.signalingState === 'have-local-offer') {
                        // Both sent offers - use a tiebreaker (sessionId comparison) to decide who proceeds
                        const myId = socket.id;
                        const shouldProceed = myId && data.offer.sdp && socket.id < (data as any).fromSocketId;
                        if (!shouldProceed) {
                            console.log('Glare condition - keeping our offer');
                            return;
                        }
                        // Rollback our offer and accept theirs
                        try {
                            await pc.setLocalDescription({ type: 'rollback' });
                        } catch (e) {
                            console.log('Rollback not needed or failed:', e);
                        }
                    }
                    
                    try {
                        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                        const answer = await pc.createAnswer();
                        await pc.setLocalDescription(answer);
                        socket.emit('video-answer', { sessionId, answer });
                    } catch (err) {
                        console.error('Error handling offer:', err);
                    }
                });

                socket.on('video-answer', async (data: { answer: RTCSessionDescriptionInit }) => {
                    // Only set answer if we're expecting one
                    if (pc.signalingState !== 'have-local-offer') {
                        console.log('Ignoring answer - not expecting one. Current state:', pc.signalingState);
                        return;
                    }
                    
                    try {
                        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                    } catch (err) {
                        console.error('Error setting remote answer:', err);
                    }
                });

                socket.on('ice-candidate', async (data: { candidate: RTCIceCandidateInit }) => {
                    // Only add ICE candidates if the connection is in a valid state
                    if (pc.signalingState === 'closed') {
                        console.log('Ignoring ICE candidate - connection closed');
                        return;
                    }
                    
                    try {
                        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                    } catch (e) {
                        console.error('Error adding ice candidate:', e);
                    }
                });

                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.emit('ice-candidate', { sessionId, candidate: event.candidate });
                    }
                };

                pc.onconnectionstatechange = () => {
                    if (pc.connectionState === 'connected') {
                        setIsConnected(true);
                    }
                };

            } catch (err: any) {
                console.error('Error accessing media devices:', err);
                let errorMessage = 'Could not access camera/microphone.';
                
                if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                    errorMessage = 'No camera or microphone found. Please connect a camera and refresh, or join without video.';
                } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    errorMessage = 'Camera/microphone permission denied. Please allow access in browser settings and refresh.';
                } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                    errorMessage = 'Camera is already in use by another application (Zoom, Teams, etc.). Close other apps and refresh.';
                } else if (err.message?.includes('HTTPS')) {
                    errorMessage = err.message;
                }
                
                setError(errorMessage);
            }
        };

        initVideo();

        return () => {
            localStream?.getTracks().forEach(track => track.stop());
            pcRef.current?.close();
            socketRef.current?.disconnect();
        };
    }, [sessionId]);

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(!isVideoOff);
        }
    };

    const endCall = () => {
        localStream?.getTracks().forEach(track => track.stop());
        pcRef.current?.close();
        socketRef.current?.disconnect();
        router.push(`/chat/${sessionId}`);
    };

    if (error) {
        return (
            <div className="h-screen bg-slate-900 flex items-center justify-center flex-col">
                <div className="text-white text-center p-8">
                    <h1 className="text-2xl font-bold mb-4 text-red-400">Video Error</h1>
                    <p className="text-gray-300 mb-6">{error}</p>
                    <button 
                        onClick={() => router.push(`/chat/${sessionId}`)}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition"
                    >
                        Back to Chat
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-slate-900 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
                    <h1 className="text-white font-semibold">Video Call {isConnected ? '(Connected)' : '(Connecting...)'}</h1>
                </div>
                <button 
                    onClick={endCall}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-medium transition"
                >
                    End Call
                </button>
            </div>

            {/* Video Grid */}
            <div className="flex-1 flex items-center justify-center p-4 gap-4">
                {/* Remote Video (Other person) */}
                <div className="relative flex-1 max-w-2xl aspect-video bg-slate-800 rounded-xl overflow-hidden">
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                    {!remoteStream && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mb-3 mx-auto">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <p>Waiting for other person to join...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Local Video (Self) */}
                <div className="relative w-48 aspect-video bg-slate-800 rounded-xl overflow-hidden border-2 border-blue-500">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />
                    {isVideoOff && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="p-4 bg-slate-800 border-t border-slate-700">
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={toggleMute}
                        className={`p-4 rounded-full transition ${isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-700 hover:bg-slate-600'}`}
                    >
                        {isMuted ? (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                        )}
                    </button>

                    <button
                        onClick={toggleVideo}
                        className={`p-4 rounded-full transition ${isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-700 hover:bg-slate-600'}`}
                    >
                        {isVideoOff ? (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        )}
                    </button>

                    <button
                        onClick={endCall}
                        className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition"
                    >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
