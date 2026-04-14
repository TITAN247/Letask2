import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Check database connection
    await dbConnect();

    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      services: {
        database: "connected",
        api: "running",
      },
      version: process.env.npm_package_version || "1.0.0",
    };

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (error: any) {
    console.error("Health check error:", error);
    
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error.message,
        services: {
          database: "disconnected",
          api: "running",
        },
      },
      { status: 503 }
    );
  }
}
