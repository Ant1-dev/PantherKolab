import { Socket, Server } from "socket.io";
import { sendToUser } from "@/lib/socket/socketUtils";
import { getAuthenticatedUserId } from "@/lib/socket/socketAuthMiddleware";
import { callManager } from "@/lib/socket/callManager";
import type { CallType } from "@/types/database";

export function initializeCallSocket(socket: Socket, io: Server) {
  console.log("Call socket initialized");

  // Initiate a new call
  socket.on(
    "new-call",
    async (data: { userId: string; callerName: string; callType: string }) => {
      const callerId = getAuthenticatedUserId(socket);
      if (!callerId) {
        socket.emit("call-error", { error: "Unauthorized" });
        return;
      }

      try {
        console.log(`📞 Call from ${callerId} to ${data.userId}`);

        // Create call record immediately (status: RINGING)
        const call = await callManager.initiateCall({
          callType: data.callType as CallType,
          initiatedBy: callerId,
          participantIds: [data.userId],
        });

        // Notify caller that call is ringing
        sendToUser(io, callerId, "call-ringing", {
          sessionId: call.sessionId,
          recipientId: data.userId,
        });

        // Send to the recipient with sessionId and caller info
        sendToUser(io, data.userId, "incoming-call", {
          sessionId: call.sessionId,
          callerId,
          callerName: data.callerName,
          callType: data.callType,
        });

        console.log(`✅ Call initiated. SessionId: ${call.sessionId}`);
      } catch (error) {
        console.error("Error initiating call:", error);
        sendToUser(io, callerId, "call-error", {
          error:
            error instanceof Error ? error.message : "Failed to initiate call",
        });
      }
    }
  );

  // Accept a call
  socket.on(
    "accept-call",
    async (data: { sessionId: string; callerId: string; callerName: string }) => {
      const recipientId = getAuthenticatedUserId(socket);
      if (!recipientId) {
        socket.emit("call-error", { error: "Unauthorized" });
        return;
      }

      try {
        console.log(
          `✅ ${recipientId} accepting call ${data.sessionId} from ${data.callerId}`
        );

        // TODO: Get recipient name from user service/database
        const recipientName = recipientId; // Placeholder

        // Create Chime meeting and join both parties
        const result = await callManager.acceptAndConnectCall({
          sessionId: data.sessionId,
          recipientId,
          recipientName,
          callerId: data.callerId,
          callerName: data.callerName,
        });

        // Notify both parties that call is connected with meeting credentials
        const connectionData = {
          sessionId: data.sessionId,
          meeting: result.meeting,
          attendees: result.attendees,
        };

        sendToUser(io, data.callerId, "call-connected", connectionData);
        sendToUser(io, recipientId, "call-connected", connectionData);

        console.log(
          `🎉 Call connected. SessionId: ${data.sessionId}, MeetingId: ${result.meeting.MeetingId}`
        );
      } catch (error) {
        console.error("Error accepting call:", error);

        const errorMessage =
          error instanceof Error ? error.message : "Failed to connect call";

        // Notify both parties of failure
        sendToUser(io, recipientId, "call-connection-failed", {
          error: errorMessage,
          sessionId: data.sessionId,
        });
        sendToUser(io, data.callerId, "call-connection-failed", {
          error: errorMessage,
          sessionId: data.sessionId,
        });
      }
    }
  );

  // Reject a call
  socket.on(
    "reject-call",
    async (data: { sessionId: string; callerId: string }) => {
      const recipientId = getAuthenticatedUserId(socket);
      if (!recipientId) return;

      try {
        console.log(
          `❌ ${recipientId} rejected call ${data.sessionId} from ${data.callerId}`
        );

        // Update call record
        await callManager.rejectCall(data.sessionId, recipientId);

        // Notify caller only
        sendToUser(io, data.callerId, "call-rejected", {
          userId: recipientId,
          sessionId: data.sessionId,
        });
      } catch (error) {
        console.error("Error rejecting call:", error);
      }
    }
  );

  // End an active call
  socket.on("end-call", async (data: { sessionId: string }) => {
    const userId = getAuthenticatedUserId(socket);
    if (!userId) return;

    try {
      console.log(`🔚 ${userId} ending call ${data.sessionId}`);

      // End the call
      await callManager.endCall(data.sessionId);

      // Notify all participants
      // TODO: Get all participant IDs from call record
      socket.broadcast.emit("call-ended", {
        sessionId: data.sessionId,
        endedBy: userId,
      });
    } catch (error) {
      console.error("Error ending call:", error);
      socket.emit("call-error", {
        error:
          error instanceof Error ? error.message : "Failed to end call",
      });
    }
  });
}
