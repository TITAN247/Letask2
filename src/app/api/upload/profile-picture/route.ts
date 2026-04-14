import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/auth";

// POST - Upload profile picture as base64
export async function POST(req: Request) {
    try {
        const userSession = await getUserFromSession();
        if (!userSession) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const image = formData.get('image') as File;

        if (!image) {
            return NextResponse.json(
                { message: "No image provided" },
                { status: 400 }
            );
        }

        // Validate file type
        if (!image.type.startsWith('image/')) {
            return NextResponse.json(
                { message: "File must be an image" },
                { status: 400 }
            );
        }

        // Validate file size (2MB max)
        if (image.size > 2 * 1024 * 1024) {
            return NextResponse.json(
                { message: "Image size must be less than 2MB" },
                { status: 400 }
            );
        }

        // Convert to base64
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${image.type};base64,${base64}`;

        return NextResponse.json({
            message: "Image uploaded successfully",
            url: dataUrl
        });

    } catch (error) {
        console.error("Profile Picture Upload Error:", error);
        return NextResponse.json(
            { message: "An error occurred uploading image." },
            { status: 500 }
        );
    }
}
