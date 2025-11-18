import { ChimeSDKMeetings } from "@aws-sdk/client-chime-sdk-meetings";
import { callService } from "@/services/callService";
import type { CallType, Call } from "@/types/database";

// Initialize AWS Chime SDK Meetings client
const chime = new ChimeSDKMeetings({
  region: process.env.AWS_CHIME_REGION || process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Generate a unique client ID for tracking attendees
 */
function generateClientId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export const callManager = {
  /**
   * Initiate a new call (creates call record in RINGING state)
   * Called when caller initiates the call
   */
  async initiateCall(data: {
    callType: CallType;
    initiatedBy: string;
    participantIds: string[];
    conversationId?: string;
  }): Promise<Call> {
    // Validate input
    if (!data.callType || !data.initiatedBy || !data.participantIds?.length) {
      throw new Error(
        "Missing required fields: callType, initiatedBy, participantIds"
      );
    }

    // For DIRECT calls, should have exactly 1 recipient
    if (data.callType === "DIRECT" && data.participantIds.length !== 1) {
      throw new Error("Direct calls must have exactly one recipient");
    }

    // For GROUP calls, require conversationId
    if (data.callType === "GROUP" && !data.conversationId) {
      throw new Error("Group calls require a conversationId");
    }

    // Create call record in database
    const call = await callService.createCall({
      callType: data.callType,
      initiatedBy: data.initiatedBy,
      participantIds: data.participantIds,
      conversationId: data.conversationId,
    });

    return call;
  },

  /**
   * Accept call and create Chime meeting
   * Called when recipient accepts the call
   * Atomically: creates meeting, updates call record, creates attendees for both parties
   */
  async acceptAndConnectCall(data: {
    sessionId: string;
    recipientId: string;
    recipientName: string;
    callerId: string;
    callerName: string;
  }): Promise<{
    call: Call;
    meeting: any;
    attendees: Record<string, any>;
  }> {
    try {
      // 1. Get call record
      const call = await callService.getCall(data.sessionId);
      if (!call) {
        throw new Error("Call not found");
      }

      // Verify call is still in RINGING state
      if (call.status !== "RINGING") {
        throw new Error(`Call is not in ringing state. Current status: ${call.status}`);
      }

      // Verify recipient is actually a participant
      const isParticipant = call.participants.some(
        (p) => p.userId === data.recipientId
      );
      if (!isParticipant) {
        throw new Error("User is not a participant in this call");
      }

      // 2. Create Chime meeting
      const meeting = await chime.createMeeting({
        ClientRequestToken: data.sessionId, // Idempotency token
        MediaRegion: process.env.AWS_CHIME_REGION || "us-east-1",
        ExternalMeetingId: data.sessionId,
      });

      if (!meeting.Meeting?.MeetingId) {
        throw new Error("Failed to create Chime meeting");
      }

      // 3. Update call with Chime meeting ID
      await callService.updateChimeMeetingId(
        data.sessionId,
        meeting.Meeting.MeetingId
      );

      // 4. Create attendees for both caller and recipient
      const callerClientId = generateClientId();
      const recipientClientId = generateClientId();

      const callerAttendee = await chime.createAttendee({
        MeetingId: meeting.Meeting.MeetingId,
        ExternalUserId: `${data.callerName}#${callerClientId}`,
      });

      const recipientAttendee = await chime.createAttendee({
        MeetingId: meeting.Meeting.MeetingId,
        ExternalUserId: `${data.recipientName}#${recipientClientId}`,
      });

      // 5. Update participant statuses to JOINED
      await callService.updateParticipantStatus(
        data.sessionId,
        data.callerId,
        "JOINED",
        callerAttendee.Attendee?.AttendeeId
      );

      await callService.updateParticipantStatus(
        data.sessionId,
        data.recipientId,
        "JOINED",
        recipientAttendee.Attendee?.AttendeeId
      );

      // 6. Update call status to ACTIVE
      await callService.updateCallStatus(data.sessionId, "ACTIVE");

      // 7. Get updated call record
      const updatedCall = await callService.getCall(data.sessionId);

      return {
        call: updatedCall!,
        meeting: meeting.Meeting,
        attendees: {
          [data.callerId]: callerAttendee.Attendee,
          [data.recipientId]: recipientAttendee.Attendee,
        },
      };
    } catch (error) {
      console.error("Error in acceptAndConnectCall:", error);

      // Attempt cleanup if Chime meeting was created
      // (Call record will remain in RINGING state for retry or manual cleanup)
      throw error;
    }
  },

  /**
   * Reject a call
   */
  async rejectCall(sessionId: string, userId: string): Promise<void> {
    const call = await callService.getCall(sessionId);
    if (!call) {
      throw new Error("Call not found");
    }

    // Update participant status
    await callService.updateParticipantStatus(sessionId, userId, "REJECTED");

    // If all participants rejected, mark call as REJECTED
    const allRejected = call.participants.every(
      (p) => p.status === "REJECTED" || p.userId === call.initiatedBy
    );

    if (allRejected) {
      await callService.updateCallStatus(sessionId, "REJECTED");
    }
  },

  /**
   * End an active call
   */
  async endCall(sessionId: string): Promise<void> {
    const call = await callService.getCall(sessionId);
    if (!call) {
      throw new Error("Call not found");
    }

    // Delete Chime meeting if it exists
    if (call.chimeMeetingId) {
      try {
        await chime.deleteMeeting({
          MeetingId: call.chimeMeetingId,
        });
      } catch (error) {
        console.error("Error deleting Chime meeting:", error);
        // Continue with DB update even if Chime deletion fails
      }
    }

    // Update call status to ENDED
    await callService.endCall(sessionId);
  },
};
