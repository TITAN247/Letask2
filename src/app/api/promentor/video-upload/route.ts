import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/auth";

// POST - Save video URL after upload
export async function POST(req: Request) {
    try {
        const userSession = await getUserFromSession();
        if (!userSession) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { videoUrl, publicId, duration } = body;

        // Return the video details
        return NextResponse.json({
            message: "Video uploaded successfully",
            videoUrl,
            publicId,
            duration
        });

    } catch (error) {
        console.error("Video Upload Error:", error);
        return NextResponse.json(
            { message: "An error occurred processing video upload." },
            { status: 500 }
        );
    }
}

// DELETE - Delete video reference
export async function DELETE(req: Request) {
    try {
        const userSession = await getUserFromSession();
        if (!userSession) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const publicId = searchParams.get('publicId');

        if (!publicId) {
            return NextResponse.json(
                { message: "Public ID is required" },
                { status: 400 }
            );
        }

        // Note: Actual deletion from Cloudinary should be handled via frontend SDK
        return NextResponse.json({
            message: "Video reference removed successfully",
            publicId
        });

    } catch (error) {
        console.error("Video Delete Error:", error);
        return NextResponse.json(
            { message: "An error occurred deleting video." },
            { status: 500 }
        );
    }
}
