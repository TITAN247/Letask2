"use client";

import dynamic from "next/dynamic";

// Force Next.js to exclusively load this component directly in the browser. 
// This prevents legacy Web SDKs (like agora-chat) from crashing the Node.js SSR runtime when assessing `self` or `window`.
const ChatRoomClient = dynamic(() => import("./ChatRoomClient"), { ssr: false });

export default function ChatRoomPage() {
    return <ChatRoomClient />;
}
