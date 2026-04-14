"use client";

import dynamic from "next/dynamic";

const VideoRoomClient = dynamic(() => import("./VideoRoomClient"), {
    ssr: false,
    loading: () => (
        <div className="h-screen bg-slate-900 flex items-center justify-center flex-col">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white mt-6 font-bold text-lg">Initializing Secure Connection...</p>
        </div>
    )
});

export default function VideoSessionPageWrapper() {
    return <VideoRoomClient />;
}
