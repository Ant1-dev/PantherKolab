import { NextRequest, NextResponse } from 'next/server'
import { callService } from '@/services/callService'
import { conversationService } from '@/services/conversationService'
import type { CallType } from '@/types/database'

/**
 * POST /api/calls/initiate
 * Create a call record and return call details
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { callType, initiatedBy, participantIds, conversationId } = body as {
      callType: CallType
      initiatedBy: string
      participantIds: string[]
      conversationId?: string
    }

    // Validate input
    if (!callType || !initiatedBy || !Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: callType, initiatedBy, participantIds' },
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

    // Create call record
    const call = await callService.createCall({
      callType,
      initiatedBy,
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
