import { NextRequest, NextResponse } from "next/server"
import { fetchAuthSession } from "aws-amplify/auth"
import { userService } from "@/services/userService"

// Get a specific user profile
export async function GET(
    req: NextRequest,
    { params }: {params: { userId: string }}
) {
    try {
        // Verify is user is logged in 
        const session = await fetchAuthSession();

        if (!session.tokens?.idToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

export async function PUT(
    req: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const session = await fetchAuthSession();
        const tokenUserId = session.tokens?.idToken?.payload.sub as string;

        if (tokenUserId !== params.userId) {
            return NextResponse.json(
                { error: 'Forbidden - You can only update your own profile'},
                { status: 403 }
            );
        }

        const updates = await req.json();

        const existingUser = await userService.getUser(params.userId);
        if (!existingUser) {
            return NextResponse.json(
                {error: 'User not found' },
                {status: 404}
            );
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {userId, email, createdAt, ...allowedUpdates } = updates; // Prevents updates on certain fields

        const updatedUser = await userService.updateUser(params.userId, allowedUpdates);

        return NextResponse.json({user: updatedUser }, {status: 200});
    } catch (error: unknown) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Internal server error'},
            { status: 500 }
        );
    }
}

