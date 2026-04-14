"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function VideoRoomClient() {
    const params = useParams();
    const sessionId = params?.sessionId as string | undefined;
    
    return (
        <div className="h-screen bg-slate-900 flex items-center justify-center flex-col">
            <div className="text-white text-center">
                <h1 className="text-2xl font-bold mb-4">Video Room Disabled for Testing</h1>
                <p className="text-gray-400 mb-6">Session ID: {sessionId}</p>
                <p className="text-sm text-gray-500">Use the chat interface instead: <a href={`/chat/${sessionId}`} className="text-blue-400 hover:underline">Go to Chat</a></p>
            </div>
        </div>
    );
}
