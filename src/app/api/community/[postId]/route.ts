import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import CommunityPost from "@/models/CommunityPost";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { awardXP, XP_VALUES } from "@/lib/xpUtils";

// GET - Get single post
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    await dbConnect();

    const post = await CommunityPost.findById(params.postId)
      .populate("authorId", "name role level")
      .populate("comments.authorId", "name role level")
      .lean();

    if (!post) {
      return NextResponse.json(
        { success: false, message: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch (error: any) {
    console.error("Get post error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get post", error: error.message },
      { status: 500 }
    );
  }
}

// POST - Add comment
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { comment } = body;

    if (!comment) {
      return NextResponse.json(
        { success: false, message: "Comment is required" },
        { status: 400 }
      );
    }

    const post = await CommunityPost.findByIdAndUpdate(
      params.postId,
      {
        $push: {
          comments: {
            authorId: (session.user as any).id,
            body: comment,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!post) {
      return NextResponse.json(
        { success: false, message: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: post,
      message: "Comment added successfully",
    });
  } catch (error: any) {
    console.error("Add comment error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add comment", error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Upvote post
export async function PATCH(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    const post = await CommunityPost.findById(params.postId);
    if (!post) {
      return NextResponse.json(
        { success: false, message: "Post not found" },
        { status: 404 }
      );
    }

    // Check if already upvoted
    if (post.upvotedBy.includes(userId)) {
      // Remove upvote
      post.upvotes -= 1;
      post.upvotedBy = post.upvotedBy.filter((id: any) => id.toString() !== userId);
    } else {
      // Add upvote
      post.upvotes += 1;
      post.upvotedBy.push(userId);

      // Award XP to post author
      await awardXP(
        post.authorId.toString(),
        XP_VALUES.COMMUNITY_UPVOTE,
        "Received upvote on community post",
        "community_upvote"
      );
    }

    await post.save();

    return NextResponse.json({
      success: true,
      data: post,
      message: "Vote updated successfully",
    });
  } catch (error: any) {
    console.error("Upvote error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upvote", error: error.message },
      { status: 500 }
    );
  }
}
