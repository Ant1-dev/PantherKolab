import { NextResponse } from 'next/server'
import { messageService } from '@/services/messageService'
import { conversationService } from '@/services/conversationService'
import { getAuthenticatedUser, verifyUserMatch } from '@/lib/auth/api-auth'

export async function POST(request: Request) {
  try {
    // Authenticate the request
    const auth = await getAuthenticatedUser()
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Verify the senderId matches the authenticated user
    if (!verifyUserMatch(body.senderId, auth.userId)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Cannot send messages as another user' },
        { status: 403 }
      )
    }

    const message = await messageService.sendMessage({
      conversationId: body.conversationId,
      senderId: auth.userId, // Use authenticated userId, not body.senderId
      content: body.content,
      type: body.type || 'TEXT',
    })

    await conversationService.updateLastMessage(
      body.conversationId,
      message.timestamp
    )

    return NextResponse.json({
      success: true,
      message,
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}