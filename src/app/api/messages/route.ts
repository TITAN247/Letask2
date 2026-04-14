import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Message from "@/models/Message";
import { getUserFromSession } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const userSession = await getUserFromSession();
        if (!userSession) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { receiverId, text } = await req.json();
        if (!receiverId || !text) {
            return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
        }

        await dbConnect();

        const newMessage = await Message.create({
            senderId: (userSession as any).id,
            receiverId,
            messageText: text
        });

        return NextResponse.json({ message: "Message sent.", msg: newMessage }, { status: 201 });
    } catch (error) {
        console.error("Send Message Error:", error);
        return NextResponse.json({ message: "An error occurred sending message." }, { status: 500 });
    }
}
