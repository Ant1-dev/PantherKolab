import { NextResponse } from "next/server";
import { publishEvent } from "@/lib/appSync/appsync-server-client";
import { getAuthenticatedUser } from "@/lib/auth/api-auth";

export async function GET() {
  try {
    console.log("Testing AppSync connection...");

    // Authenticate the request
    const auth = await getAuthenticatedUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check environment variables
    const endpoint = process.env.NEXT_PUBLIC_APPSYNC_EVENT_HTTP_ENDPOINT;

    if (!endpoint) {
      return NextResponse.json(
        {
          success: false,
          error:
            "NEXT_PUBLIC_APPSYNC_EVENT_HTTP_ENDPOINT not found in environment",
        },
        { status: 500 }
      );
    }

    // Publish test event
    await publishEvent(
      "/test/api-route",
      {
        type: "MESSAGE_SENT",
        data: {
          message: "Test from Next.js API route",
        },
      },
      auth.accessToken
    );

    return NextResponse.json({
      success: true,
      message: "AppSync is working!",
      endpoint: endpoint,
    });
  } catch (error) {
    console.error("AppSync test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}