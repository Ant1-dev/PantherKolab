import { NextRequest, NextResponse } from "next/server";
import { fetchAuthSession } from "aws-amplify/auth";
import { userService } from "@/services/userService";
import { CognitoJwtVerifier } from "aws-jwt-verify"

// Get a specific user profile
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
  tokenUse: "id",
  clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
});

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Unauthorized - No token" }, { status: 401 });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify the JWT token
    const payload = await verifier.verify(token);
    const loggedInUserId = payload.sub;

    // Check if user is viewing their own profile
    const isOwnProfile = loggedInUserId === params.userId;

    // Get user from DynamoDB
    const user = await userService.getUser(params.userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user, isOwnProfile }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Unauthorized - Invalid token" },
      { status: 401 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await fetchAuthSession();
    const tokenUserId = session.tokens?.idToken?.payload.sub as string;

    if (tokenUserId !== params.userId) {
      return NextResponse.json(
        { error: "Forbidden - You can only update your own profile" },
        { status: 403 }
      );
    }

    const updates = await req.json();

    const existingUser = await userService.getUser(params.userId);
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userId, email, createdAt, ...allowedUpdates } = updates; // Prevents updates on certain fields

    const updatedUser = await userService.updateUser(
      params.userId,
      allowedUpdates
    );

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
