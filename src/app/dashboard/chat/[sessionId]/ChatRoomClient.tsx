"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Send, Loader2, ArrowLeft, MoreVertical, ShieldCheck, CheckCircle, Check, Clock, CircleDot, LogOut, Play, Star, Timer } from "lucide-react";
import { io, Socket } from "socket.io-client";
import AC from "agora-chat";

interface ChatMessage {
    _id?: string;
    messageId?: string;
    senderId: string;
    text: string;
    timestamp: string;
    fingerprint?: string;
    status: 'sent' | 'delivered' | 'read';
}

export default function ChatRoomClient() {
    const params = useParams();
    const sessionId = params?.sessionId as string | undefined;
    const { data: session } = useSession();
    const router = useRouter();
    
    // Core States
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [userId, setUserId] = useState<string>("");
    const [isLoaded, setIsLoaded] = useState(false);
    
    // Advanced Presence & Feedback States
    const [isTyping, setIsTyping] = useState(false);
    const [peerOnline, setPeerOnline] = useState(false);
    const [agoraConnected, setAgoraConnected] = useState(false);

    // Session Timer States
    const [sessionStarted, setSessionStarted] = useState(false);
    const [sessionEnded, setSessionEnded] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(900); // 15 minutes default
    const [isMentor, setIsMentor] = useState(false);
    const [isMentee, setIsMentee] = useState(false);
    const [mentorType, setMentorType] = useState<string>(''); // 'promentor' or 'prementor'
    const [showFeedback, setShowFeedback] = useState(false);
    const [timerLoading, setTimerLoading] = useState(true);
    
    // Presence Tracking States
    const [mentorJoined, setMentorJoined] = useState(false);
    const [menteeJoined, setMenteeJoined] = useState(false);
    const [bothJoined, setBothJoined] = useState(false);
    const [waitingForOther, setWaitingForOther] = useState(false);

    // Feedback States
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedbackText, setFeedbackText] = useState("");
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

    // User Profile States
    const [mentorProfile, setMentorProfile] = useState<{name: string, profilePicture?: string} | null>(null);
    const [menteeProfile, setMenteeProfile] = useState<{name: string, profilePicture?: string} | null>(null);
    const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

    // Refs
    const socketRef = useRef<Socket | null>(null);
    const agoraRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const localFingerprint = useRef(`device_${Math.random().toString(36).substr(2, 9)}`);
    
    const channelName = typeof sessionId === 'string' ? sessionId : "default-chat";

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    useEffect(() => {
        // Evaluate Authentication
        let activeUid = "";
        if (session?.user) {
            activeUid = (session.user as any).id || (session.user as any)._id;
        } else {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                const user = JSON.parse(userStr);
                activeUid = user._id || user.id || localFingerprint.current;
            } else {
                activeUid = localFingerprint.current;
            }
        }
        setUserId(activeUid);

        // Core Database Hydration Route
        const fetchMessages = async () => {
             try {
                const res = await fetch(`/api/messages/${channelName}`);
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setMessages(data.map(m => ({ ...m, status: m.status || 'read' })));
                    }
                } else if (res.status === 403) {
                    router.push("/dashboard/mentee/bookings");
                }
             } catch(e) {
                 console.warn("Could not fetch old messages Natively", e);
             } finally {
                 setIsLoaded(true);
             }
        };

        // Fetch session details to determine role and verify payment
        const fetchSessionDetails = async () => {
            try {
                const res = await fetch(`/api/sessions/${sessionId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.data) {
                        const sessionData = data.data;
                        
                        const mentorId = sessionData.mentorId?._id || sessionData.mentorId;
                        const menteeId = sessionData.menteeId?._id || sessionData.menteeId;
                        
                        // Verify payment status - only allow if paid (completed or paid status)
                        const isPaid = sessionData.paymentStatus === 'completed' || sessionData.paymentStatus === 'paid';
                        if (!isPaid && sessionData.mentorType === 'promentor') {
                            // Redirect to payment if not paid (only for promentor sessions)
                            if (menteeId?.toString() === activeUid?.toString()) {
                                console.log('[Chat] Payment not complete, redirecting to payment:', sessionData.paymentStatus);
                                router.push(`/dashboard/mentee/payment/${sessionId}`);
                                return;
                            }
                        }
                        // For promentors, mentorId is MentorProfile._id, not User ID
                        // We need to check if the current user owns that MentorProfile
                        let isUserMentor = mentorId?.toString() === activeUid?.toString();
                        const isUserMentee = menteeId?.toString() === activeUid?.toString();
                        
                        // For promentors, mentorId is populated MentorProfile object with userId field
                        // Check if userId matches activeUid (handles both populated object and string)
                        const populatedMentorUserId = sessionData.mentorId?.userId?._id || sessionData.mentorId?.userId;
                        
                        // Debug logging
                        console.log('[Chat Role Detection]', {
                            activeUid,
                            mentorId: mentorId?.toString(),
                            menteeId: menteeId?.toString(),
                            mentorType: sessionData.mentorType,
                            populatedMentorUserId: populatedMentorUserId?.toString(),
                            isUserMentor,
                            isUserMentee
                        });
                        
                        // If not a direct match, check if user is promentor via populated mentorId.userId
                        if (!isUserMentor && sessionData.mentorType === 'promentor' && populatedMentorUserId?.toString() === activeUid) {
                            isUserMentor = true;
                            console.log('[Chat] Identified user as promentor via mentorId.userId match');
                        }
                        
                        setIsMentor(isUserMentor);
                        setIsMentee(isUserMentee);

                        // Set user profiles
                        if (sessionData.mentorId) {
                            setMentorProfile({
                                name: sessionData.mentorId.name || sessionData.mentorProfile?.name || 'Mentor',
                                profilePicture: sessionData.mentorId.profilePicture || sessionData.mentorProfile?.profilePicture
                            });
                        }
                        if (sessionData.menteeId) {
                            setMenteeProfile({
                                name: sessionData.menteeId.name || 'Mentee',
                                profilePicture: sessionData.menteeId.profilePicture
                            });
                        }

                        // Store mentor type for redirect logic
                        setMentorType(sessionData.mentorType || '');
                        
                        // Check session status
                        if (sessionData.status === 'chat_active' || sessionData.sessionStartedAt) {
                            setSessionStarted(true);
                            setSessionStartTime(new Date(sessionData.sessionStartedAt));
                        } else if (isUserMentee && sessionData.status === 'accepted') {
                            // Mentee is waiting for mentor to start
                            setSessionStarted(false);
                        }

                        // Check if session already ended (on page refresh/reload)
                        if (sessionData.status === 'completed' || sessionData.status === 'ended') {
                            setSessionEnded(true);
                            setSessionStarted(false);
                            if (isUserMentee) {
                                setShowFeedback(true);
                            }
                        }
                    }
                }
            } catch (e) {
                console.warn("Could not fetch session details", e);
            }
        };

        fetchMessages();
        fetchSessionDetails();

        // Track user joining the session
        const joinSession = async () => {
            try {
                const res = await fetch(`/api/sessions/${sessionId}/timer`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "join" }),
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setMentorJoined(data.data.mentorJoined);
                        setMenteeJoined(data.data.menteeJoined);
                        setBothJoined(data.data.bothJoined);
                        // Also update role from server to prevent swapping
                        if (data.data.isSessionMentor !== undefined) {
                            setIsMentor(data.data.isSessionMentor);
                            setIsMentee(data.data.isSessionMentee);
                        }
                    }
                }
            } catch (e) {
                console.warn("Could not join session", e);
            }
        };
        joinSession();

        // ------------------------------
        // ENGINE 1: SOCKET.IO HYBRID LAYER
        // ------------------------------
        const socket = io({ transports: ['websocket', 'polling'] });
        socketRef.current = socket;

        const handleJoin = () => {
            console.log("WebSocket engine securely connected!");
            socket.emit("join-session", channelName);
        };
        if (socket.connected) handleJoin();
        socket.on("connect", handleJoin);

        socket.on("receive-message", (data: any) => {
            if (data.fingerprint === localFingerprint.current) return;
            setMessages(prev => {
                if (prev.some(m => m.fingerprint === data.fingerprint)) return prev;
                return [...prev, {
                    senderId: data.senderId,
                    text: data.text,
                    timestamp: data.timestamp || new Date().toISOString(),
                    fingerprint: data.fingerprint,
                    status: 'delivered'
                }];
            });
            // Mark as read natively back down the pipe
            socket.emit("message-read", { messageId: data.messageId, channel: channelName });
        });

        socket.on("peer-typing", () => {
            setIsTyping(true);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2500);
        });

        socket.on("message-read-update", (data: any) => {
            setMessages(prev => prev.map(m => (!data.messageId || m.messageId === data.messageId) ? { ...m, status: 'read' } : m));
        });

        // Listen for session end event
        socket.on("session-ended", (data: any) => {
            console.log("[Socket] Session ended:", data);
            setSessionEnded(true);
            setSessionStarted(false);
            // Show feedback for mentee
            if (isMentee && data?.showFeedback !== false) {
                setShowFeedback(true);
            }
        });

        // ------------------------------
        // ENGINE 2: AGORA CHAT SDK LAYER
        // ------------------------------
        const initAgora = async () => {
             try {
                 const appKey = process.env.NEXT_PUBLIC_AGORA_APP_KEY || "dummy#key";
                 const conn = new AC.connection({ appKey });
                 agoraRef.current = conn;

                 conn.addEventHandler("connection", {
                     onConnected: () => {
                         console.log("Agora SDK Connected implicitly");
                         setAgoraConnected(true);
                     },
                     onDisconnected: () => setAgoraConnected(false),
                     onTextMessage: (msg: any) => {
                         // Double handling check, primary payload stream via Agora
                         if (msg.to === channelName) {
                             setMessages(prev => {
                                 if (prev.some(m => m.messageId === msg.id)) return prev;
                                 return [...prev, {
                                     messageId: msg.id,
                                     senderId: msg.from,
                                     text: msg.msg,
                                     timestamp: new Date().toISOString(),
                                     status: 'delivered'
                                 }];
                             });
                         }
                     },
                     onReadMessage: (msg: any) => {
                         // Receipts
                         setMessages(prev => prev.map(m => m.messageId === msg.mid ? { ...m, status: 'read' } : m));
                     }
                 });

                 // Attempt Open bypassing explicit token limits in Local env
                 await conn.open({ user: activeUid, pwd: "defaultPassword" }).catch(() => console.log("Agora auth bypassed for Demo/Socket Mode fallback"));
             } catch(err) {
                 console.log("Using primary Socket.io routing for offline Agora Env");
             }
        };
        initAgora();

        // ------------------------------
        // ENGINE 3: INTERVAL FETCH 
        // ------------------------------
        const pollInterval = setInterval(async () => {
            try {
                const res = await fetch(`/api/messages/${channelName}`);
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setMessages(prev => {
                            const merged = [...prev];
                            const prevFingerprints = new Set(prev.map(m => m.fingerprint).filter(Boolean));
                            const prevIds = new Set(prev.map(m => m._id).filter(Boolean));
                            let changed = false;

                            data.forEach((dbMsg: any) => {
                                const isDuplicate = prevIds.has(dbMsg._id) || 
                                    (dbMsg.fingerprint && prevFingerprints.has(dbMsg.fingerprint)) ||
                                    prev.some(m => !m._id && m.text === dbMsg.text && m.senderId === dbMsg.senderId);
                                
                                if (!isDuplicate) {
                                    merged.push({ ...dbMsg, status: dbMsg.status || 'read' });
                                    changed = true;
                                }
                            });
                            
                            // Map read statuses retroactively
                            merged.forEach((m, idx) => {
                                const dbEquiv = data.find((d: any) => d._id === m._id || (d.text === m.text && d.senderId === m.senderId));
                                if (dbEquiv && dbEquiv.status && dbEquiv.status !== m.status) {
                                    merged[idx].status = dbEquiv.status;
                                    changed = true;
                                }
                            });

                            if (changed) {
                                return merged.sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                            }
                            return prev;
                        });
                    }
                }
            } catch (e) {
               // Ignore
            }
        }, 5000);

        return () => {
             socket.disconnect();
             if (agoraRef.current) agoraRef.current.close();
             clearInterval(pollInterval);
        };
    }, [channelName, session, router]);

    // Session Timer Effect
    useEffect(() => {
        if (!sessionId || !userId) return;

        const fetchTimerStatus = async () => {
            try {
                const res = await fetch(`/api/sessions/${sessionId}/timer`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        const { timeRemainingSeconds, isRunning, isEnded, sessionStartedAt, canStart, userRole, mentorJoined: mJoined, menteeJoined: meJoined, bothJoined: bJoined, waitingForOther: waiting, isSessionMentor: apiIsMentor, isSessionMentee: apiIsMentee } = data.data;
                        
                        setSessionStarted(!!sessionStartedAt && !isEnded);
                        setSessionEnded(isEnded);
                        setTimeRemaining(timeRemainingSeconds);
                        setTimerLoading(false);
                        
                        // Update presence status
                        setMentorJoined(mJoined);
                        setMenteeJoined(meJoined);
                        setBothJoined(bJoined);
                        setWaitingForOther(waiting);

                        // Update role from API to prevent swapping - use isSessionMentor from API
                        if (apiIsMentor !== undefined) {
                            setIsMentor(apiIsMentor);
                            setIsMentee(apiIsMentee);
                        }

                        if (isEnded) {
                            // Session ended via polling
                            setSessionEnded(true);
                            setSessionStarted(false);
                            if (!showFeedback) {
                                // Show feedback for mentee only
                                if (apiIsMentee || (!apiIsMentor && !apiIsMentee && (userRole === 'mentee' || isMentee))) {
                                    setShowFeedback(true);
                                }
                            }
                        }
                    }
                }
            } catch (e) {
                console.warn("Could not fetch timer status", e);
            }
        };

        fetchTimerStatus();
        const timerInterval = setInterval(fetchTimerStatus, 2000); // Poll every 2 seconds for faster response

        return () => clearInterval(timerInterval);
    }, [sessionId, userId, isMentee, showFeedback]);

    // Countdown Timer Effect - only runs when both users are joined
    useEffect(() => {
        if (!sessionStarted || sessionEnded || timeRemaining <= 0 || !bothJoined) return;

        const countdown = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(countdown);
                    // Auto-end session
                    handleEndSession("Session time limit reached");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(countdown);
    }, [sessionStarted, sessionEnded, timeRemaining, bothJoined]);

    // Session Control Functions
    const handleStartSession = async () => {
        if (!isMentor) return;
        
        try {
            const res = await fetch(`/api/sessions/${sessionId}/timer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "start" }),
            });
            
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setSessionStarted(true);
                    setTimeRemaining(data.data.sessionDurationMinutes * 60);
                }
            }
        } catch (e) {
            console.error("Failed to start session", e);
        }
    };

    const handleEndSession = async (reason?: string) => {
        try {
            const res = await fetch(`/api/sessions/${sessionId}/timer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "end", reason: reason || "Session ended by user" }),
            });
            
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setSessionEnded(true);
                    setSessionStarted(false);
                    if (data.data.showFeedback) {
                        setShowFeedback(true);
                    }
                } else {
                    console.error("End session failed:", data.message);
                    alert("Failed to end session: " + data.message);
                }
            } else {
                const errorData = await res.json();
                console.error("End session error:", errorData);
                alert("Failed to end session: " + (errorData.message || "Unknown error"));
            }
        } catch (e) {
            console.error("Failed to end session", e);
            alert("Network error. Please try again.");
        }
    };

    const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
    const [feedbackError, setFeedbackError] = useState("");

    const submitFeedback = async () => {
        if (rating === 0) {
            setFeedbackError("Please select a rating");
            return;
        }
        
        setFeedbackSubmitting(true);
        setFeedbackError("");
        
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId,
                    overallRating: rating,
                    categories: {
                        communication: rating,
                        expertise: rating,
                        punctuality: rating,
                        helpfulness: rating,
                    },
                    writtenFeedback: feedbackText,
                    tags: [],
                }),
            });
            
            const data = await res.json();
            
            if (res.ok && data.success) {
                setFeedbackSubmitted(true);
            } else {
                setFeedbackError(data.message || "Failed to submit feedback");
            }
        } catch (e) {
            console.error("Failed to submit feedback", e);
            setFeedbackError("Network error. Please try again.");
        } finally {
            setFeedbackSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        if (socketRef.current) {
            socketRef.current.emit("typing", channelName);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !userId) return;

        const payloadText = input;
        setInput("");

        const tempMessageId = `msg_${Date.now()}_${localFingerprint.current}`;

        const newMsg: ChatMessage = {
            messageId: tempMessageId,
            senderId: userId,
            text: payloadText,
            timestamp: new Date().toISOString(),
            fingerprint: localFingerprint.current,
            status: 'sent'
        };

        setMessages(prev => [...prev, newMsg]);

        // Push natively across WebSockets
        if (socketRef.current) {
            socketRef.current.emit("send-message", {
                 sessionId: channelName,
                 senderId: userId,
                 text: payloadText,
                 messageId: tempMessageId,
                 fingerprint: localFingerprint.current
            });
        }

        // Push via API to MongoDB strictly bound to Session Schema
        try {
            const res = await fetch(`/api/messages/${channelName}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: payloadText, messageId: tempMessageId, status: 'sent', fallbackSenderId: userId }) 
            });
            if (res.ok) {
                setMessages(prev => prev.map(m => m.messageId === tempMessageId ? { ...m, status: 'delivered' } : m));
            }
        } catch(err) {
            console.error("Message backup failed.");
        }
    };

    if (!isLoaded) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-white">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                <p className="font-medium text-slate-500 animate-pulse">Establishing Secure Agora & Socket End-to-End Chat...</p>
            </div>
        );
    }

    // Waiting screen for mentee when mentor hasn't started the session
    if (isMentee && !sessionStarted && !sessionEnded) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-white px-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-slate-200">
                    <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Loader2 className="w-10 h-10 text-white animate-spin" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-3">Waiting for Mentor</h2>
                    <p className="text-slate-600 mb-6">
                        Your session with <span className="font-semibold text-indigo-600">{mentorProfile?.name || 'Mentor'}</span> is scheduled.
                        Please wait while the mentor starts the session.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500 bg-slate-50 rounded-lg py-3 px-4">
                        <Clock className="w-4 h-4" />
                        <span>Session will begin shortly...</span>
                    </div>
                    <button 
                        onClick={() => router.push('/dashboard/mentee')}
                        className="mt-6 w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[100dvh] bg-[#F8FAFC] font-sans overflow-hidden">
            {/* Chat UI - Hidden when session ended for mentee */}
            {!(sessionEnded && isMentee) && (
            <>
            <header className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center shadow-sm z-10 shrink-0 sticky top-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition border border-slate-200">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="relative">
                        {isMentor && menteeProfile?.profilePicture ? (
                            <img src={menteeProfile.profilePicture} alt="Mentee" className="w-11 h-11 rounded-full object-cover shadow-inner" />
                        ) : isMentee && mentorProfile?.profilePicture ? (
                            <img src={mentorProfile.profilePicture} alt="Mentor" className="w-11 h-11 rounded-full object-cover shadow-inner" />
                        ) : (
                            <div className="w-11 h-11 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-full flex items-center justify-center shadow-inner">
                                <span className="text-white font-black text-lg">
                                    {isMentor ? (menteeProfile?.name?.[0] || 'M') : (mentorProfile?.name?.[0] || 'M')}
                                </span>
                            </div>
                        )}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-[2.5px] border-white rounded-full"></div>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="font-bold text-slate-900 text-[16px] tracking-tight flex items-center gap-2">
                            {isMentor ? menteeProfile?.name || 'Mentee' : mentorProfile?.name || 'Mentor'}
                            {agoraConnected && <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-100 text-emerald-700">Agora</span>}
                        </h1>
                        <div className="flex items-center gap-2">
                            <p className="text-[12px] text-slate-500 font-medium flex items-center gap-1">
                                {peerOnline ? 'Online now' : 'Typically replies instantly'}
                            </p>
                            {sessionStartTime && (
                                <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">
                                    Started {sessionStartTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Waiting for other user indicator */}
                    {sessionStarted && !sessionEnded && waitingForOther && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-sm bg-amber-100 text-amber-600">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Waiting for {mentorJoined ? 'mentee' : 'mentor'}...</span>
                        </div>
                    )}
                    
                    {/* Session Timer Display - only when both joined */}
                    {sessionStarted && !sessionEnded && bothJoined && (
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-sm ${
                            timeRemaining < 300 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-indigo-100 text-indigo-600'
                        }`}>
                            <Timer className="w-4 h-4" />
                            <span>{formatTime(timeRemaining)}</span>
                        </div>
                    )}
                    
                    {/* Start Session Button (Mentor only) */}
                    {isMentor && !sessionStarted && !sessionEnded && (
                        <button 
                            onClick={handleStartSession}
                            disabled={timerLoading}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition shadow-md disabled:opacity-50"
                        >
                            <Play className="w-4 h-4" /> 
                            <span className="hidden sm:inline">Start Session</span>
                        </button>
                    )}
                    
                    {/* End/Exit Session Button */}
                    {sessionStarted && !sessionEnded && (
                        <button 
                            onClick={() => handleEndSession()}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition shadow-md"
                        >
                            <LogOut className="w-4 h-4" /> 
                            <span className="hidden sm:inline">{isMentor ? "End Session" : "Exit"}</span>
                        </button>
                    )}
                    
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 pb-12 relative w-full flex flex-col gap-6">
                <div className="text-center mb-4 p-4 shrink-0">
                    <div className="bg-slate-200/50 text-slate-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block">Secure Architecture</div>
                    <p className="text-sm text-slate-400 font-medium mt-3">Messages routed via MongoDB, Socket.io, and Agora Chat SDK.</p>
                </div>

                {messages.map((msg, i) => {
                    const isMe = msg.senderId === userId;
                    
                    return (
                        <div key={i} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group max-w-5xl mx-auto`}>
                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[70%]`}>
                                <div className={`relative px-5 py-3.5 shadow-sm leading-relaxed text-[15px] max-w-full break-words ${
                                    isMe 
                                    ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm' 
                                    : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm'
                                }`}>
                                    {msg.text}
                                </div>
                                <div className={`flex items-center gap-1.5 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'flex-row-reverse text-indigo-600' : 'text-slate-400'}`}>
                                    <span className="text-[10px] font-bold">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
                                    </span>
                                    {isMe && (
                                       <span className="flex items-center">
                                         {msg.status === 'sent' && <Check className="w-3.5 h-3.5 text-slate-400" />}
                                         {msg.status === 'delivered' && <CheckCircle className="w-3 h-3 text-indigo-400" />}
                                         {msg.status === 'read' && <CheckCircle className="w-3.5 h-3.5 text-indigo-600 fill-indigo-100" />}
                                       </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                
                {isTyping && (
                    <div className="flex w-full justify-start max-w-5xl mx-auto animate-in zoom-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1 items-center h-10">
                           <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                           <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                           <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} className="pb-4" />
            </main>

            <footer className="bg-white border-t border-slate-200 px-4 py-4 sm:p-5 shrink-0 w-full z-20">
                <form onSubmit={sendMessage} className="max-w-5xl mx-auto flex items-end gap-3 w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-[1.5rem] shadow-sm p-1.5 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-400 transition-all">
                    <div className="flex-1 overflow-hidden ml-3 -mb-1">
                        <textarea 
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage(e as any);
                                }
                            }}
                            placeholder="Type your message securely..."
                            className="w-full bg-transparent px-2 py-3.5 border-none focus:outline-none resize-none text-[15px] text-slate-800 max-h-32 leading-relaxed font-medium placeholder-slate-400"
                            rows={1}
                            style={{ minHeight: '44px' }}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={!input.trim()}
                        className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all self-end mb-0.5 ${
                            input.trim() 
                            ? 'bg-indigo-600 text-white shadow-md hover:bg-slate-900 active:scale-95' 
                            : 'bg-slate-200 text-slate-400'
                        }`}
                    >
                        <Send className="w-4 h-4 ml-0.5" strokeWidth={2.5} />
                    </button>
                </form>
            </footer>
            </>
            )}

            {/* Feedback Screen Overlay - For Mentee (includes mentees and prementors booking promentors) */}
            {showFeedback && !feedbackSubmitted && isMentee && (
                <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Star className="w-8 h-8 text-indigo-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">How was your session?</h2>
                            <p className="text-slate-500 mb-6">Your feedback helps us improve the mentorship experience.</p>
                        </div>

                        {/* Rating Stars */}
                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="p-1 transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-10 h-10 ${
                                            star <= (hoverRating || rating)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "fill-slate-100 text-slate-300"
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Error Message */}
                        {feedbackError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                {feedbackError}
                            </div>
                        )}

                        {/* Feedback Text */}
                        <textarea
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            placeholder="Share your experience (optional)..."
                            className="w-full h-24 p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none text-sm mb-4"
                        />

                        {/* Submit Button */}
                        <button
                            onClick={submitFeedback}
                            disabled={rating === 0 || feedbackSubmitting}
                            className={`w-full py-3 rounded-xl font-bold transition ${
                                rating > 0 && !feedbackSubmitting
                                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                            }`}
                        >
                            {feedbackSubmitting ? "Submitting..." : "Submit Feedback"}
                        </button>
                    </div>
                </div>
            )}

            {/* Feedback Submitted - Thank You Screen */}
            {feedbackSubmitted && isMentee && (
                <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 text-center">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h2>
                        <p className="text-slate-500 mb-6">Your feedback has been submitted successfully.</p>
                        <button
                            onClick={() => {
                                // Redirect based on user role - try multiple fallbacks
                                const userRole = localStorage.getItem('userRole') || (session?.user as any)?.role || '';
                                console.log('[Chat] Navigating to dashboard, role:', userRole);
                                
                                let destination = "/dashboard/mentee/bookings";
                                if (userRole === 'prementor') {
                                    destination = "/dashboard/prementor";
                                } else if (userRole === 'promentor') {
                                    destination = "/dashboard/promentor";
                                }
                                
                                // Try router first, fallback to window.location
                                try {
                                    router.push(destination);
                                } catch (e) {
                                    console.log('[Chat] Router push failed, using window.location');
                                    window.location.href = destination;
                                }
                            }}
                            className="w-full py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            )}

            {/* Session Ended Screen for Mentor */}
            {sessionEnded && isMentor && (
                <div className="fixed inset-0 z-40 bg-white/90 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-10 h-10 text-slate-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Session Ended</h2>
                        <p className="text-slate-500 mb-6">The session has been completed. Thank you for mentoring!</p>
                        <button
                            onClick={() => {
                                // Redirect based on session mentor type, not localStorage
                                if (mentorType === 'prementor') {
                                    router.push("/dashboard/prementor");
                                } else {
                                    router.push("/dashboard/promentor");
                                }
                            }}
                            className="w-full py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition"
                        >
                            Back to Sessions
                        </button>
                    </div>
                </div>
            )}

            {/* Session Ended Screen for Mentee - Prompt for Feedback (includes prementors as mentees) */}
            {sessionEnded && isMentee && !showFeedback && (
                <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 text-center">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Session Completed!</h2>
                        <p className="text-slate-500 mb-6">Your mentorship session has ended. How was your experience?</p>
                        <div className="space-y-3">
                            <button
                                onClick={() => setShowFeedback(true)}
                                className="w-full py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition"
                            >
                                Rate & Give Feedback
                            </button>
                            <button
                                onClick={() => {
                                    // Redirect based on user role - try multiple fallbacks
                                    const userRole = localStorage.getItem('userRole') || (session?.user as any)?.role || '';
                                    console.log('[Chat] Skip navigation, role:', userRole);
                                    
                                    let destination = "/dashboard/mentee/bookings";
                                    if (userRole === 'prementor') {
                                        destination = "/dashboard/prementor";
                                    } else if (userRole === 'promentor') {
                                        destination = "/dashboard/promentor";
                                    }
                                    
                                    // Try router first, fallback to window.location
                                    try {
                                        router.push(destination);
                                    } catch (e) {
                                        console.log('[Chat] Router push failed, using window.location');
                                        window.location.href = destination;
                                    }
                                }}
                                className="w-full py-3 rounded-xl font-bold bg-slate-200 text-slate-700 hover:bg-slate-300 transition"
                            >
                                Skip & Go to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
