import { NextRequest, NextResponse } from 'next/server'
import { callService } from '@/services/callService'
import { conversationService } from '@/services/conversationService'
import { getAuthenticatedUser, verifyUserMatch } from '@/lib/auth/api-auth'
import type { CallType } from '@/types/database'

/**
 * POST /api/calls/initiate
 * Create a call record and return call details
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate the request
    const auth = await getAuthenticatedUser()
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { callType, initiatedBy, participantIds, conversationId } = body as {
      callType: CallType
      initiatedBy: string
      participantIds: string[]
      conversationId?: string
    }

    // Verify the initiatedBy matches the authenticated user
    if (!verifyUserMatch(initiatedBy, auth.userId)) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot initiate calls as another user' },
        { status: 403 }
      )
    }

    // Validate input
    if (!callType || !Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: callType, participantIds' },
        { status: 400 }
      )
    }

    // Validate call type
    if (callType !== 'DIRECT' && callType !== 'GROUP') {
      return NextResponse.json({ error: 'Invalid call type' }, { status: 400 })
    }

    // For GROUP calls, validate conversationId and participants
    if (callType === 'GROUP') {
      if (!conversationId) {
        return NextResponse.json(
          { error: 'Group calls require a conversationId' },
          { status: 400 }
        )
      }

      // Get conversation to verify it exists and get participants
      const conversation = await conversationService.getConversation(conversationId)
      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }

      // Verify all participantIds are in the conversation
      const invalidParticipants = participantIds.filter(
        (id) => !conversation.participants.includes(id)
      )

      if (invalidParticipants.length > 0) {
        return NextResponse.json(
          {
            error: 'Cannot add users outside the group to a group call',
            invalidParticipants,
          },
          { status: 400 }
        )
      }
    }

    // For DIRECT calls, limit to 2 participants
    if (callType === 'DIRECT' && participantIds.length !== 1) {
      return NextResponse.json(
        { error: 'Direct calls must have exactly one recipient' },
        { status: 400 }
      )
    }

    // Create call record (use authenticated userId)
    const call = await callService.createCall({
      callType,
      initiatedBy: auth.userId,
      participantIds,
      conversationId,
    })

    return NextResponse.json({
      success: true,
      call,
    })
  } catch (error) {
    console.error('Call initiation error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
