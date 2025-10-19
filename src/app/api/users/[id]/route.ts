import { NextRequest, NextResponse } from "next/server"
import { fetchAuthSession } from "aws-amplify/auth"
import { userService } from "@/app/services/userService"

// Get a specific user profile
export async function GET(
    req: NextRequest,
    { params }: {params: { userId: string }}
) {
    try {
        // Verify is user is logged in 
        const session = await fetchAuthSession();
        const tokenUserId = session.tokens?.idToken?.payload.sub as string;

        if (tokenUserId !== params.userId) {
            return NextResponse.json(
                { error: 'Forbidden - You can only acces your own profile'},
                { status: 403 }
            )
        }

        // Get user from dynamoDB
        const user = await userService.getUser(params.userId);

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ user }, { status: 200 })
    } catch (error: unknown) {
        console.error('Error with user fetching their own profile:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}


