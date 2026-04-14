import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import CommunityPost from "@/models/CommunityPost";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { awardXP, XP_VALUES } from "@/lib/xpUtils";

// GET - Get all community posts
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const tag = searchParams.get("tag");

    let query: any = {};
    if (tag) query.tags = tag;

    const skip = (page - 1) * limit;

    const posts = await CommunityPost.find(query)
      .populate("authorId", "name role level")
      .populate("comments.authorId", "name role level")
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await CommunityPost.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Get community posts error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get posts", error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new post
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only pre-mentors and pro-mentors can post
    const userRole = (session.user as any).role;
    if (!["prementor", "promentor"].includes(userRole)) {
      return NextResponse.json(
        { success: false, message: "Only mentors can post in the community" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, body: postBody, tags } = body;

    if (!title || !postBody) {
      return NextResponse.json(
        { success: false, message: "Title and body are required" },
        { status: 400 }
      );
    }

    const post = await CommunityPost.create({
      authorId: (session.user as any).id,
      title,
      body: postBody,
      tags: tags || [],
      upvotes: 0,
      upvotedBy: [],
      comments: [],
      isPinned: false,
      isFeatured: false,
    });

    // Award XP for posting
    await awardXP(
      (session.user as any).id,
      XP_VALUES.COMMUNITY_POST,
      "Posted in community",
      "community_post"
    );

    return NextResponse.json({
      success: true,
      data: post,
      message: "Post created successfully",
    });
  } catch (error: any) {
    console.error("Create post error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create post", error: error.message },
      { status: 500 }
    );
  }
}
