import { NextResponse } from "next/server";
import { verifyToken, CustomJwtPayload } from "@/lib/auth";

export async function GET() {
    try {
        // Check auth token from cookies
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        
        console.log("Auth token from cookies:", token ? "exists" : "not found");
        
        if (token) {
            const userSession = verifyToken(token);
            console.log("Verified user session:", userSession);
            return NextResponse.json({ 
                hasToken: true,
                userSession,
                sessionId: userSession?.id
            });
        }

        // Fallback to NextAuth Google OAuth session
        const { getServerSession } = await import("next-auth");
        const { authOptions } = await import("@/lib/authOptions");
        const session = await getServerSession(authOptions);
        
        console.log("NextAuth session:", session);
        
        if (session?.user) {
            return NextResponse.json({ 
                hasToken: false,
                hasNextAuth: true,
                user: session.user,
                userId: (session.user as any).id
            });
        }

        return NextResponse.json({ 
            hasToken: false,
            hasNextAuth: false,
            message: "No active session found"
        });
        
    } catch (error) {
        console.error("Session check error:", error);
        return NextResponse.json({ error: error instanceof Error ? error instanceof Error ? error.message : 'Unknown error' : 'Unknown error' });
    }
}
