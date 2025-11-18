import { Socket, Server } from "socket.io";
import { sendToUser } from "@/lib/socket/socketUtils";
import { getAuthenticatedUserId } from "@/lib/socket/socketAuthMiddleware";

export function initializeCallSocket(socket: Socket, io: Server) {
  console.log("we ran the initialize socket function \n");

  // Initiate a new call
  socket.on(
    "new-call",
    async (data: { userId: string; callerName: string; callType: string }) => {
      const callerId = getAuthenticatedUserId(socket);
      console.log(`Call from ${callerId} to ${data.userId}\n`);

      // Send to the target user with caller info
      sendToUser(io, data.userId, "incoming-call", {
        callerId,
        callerName: data.callerName,
        callType: data.callType,
      });
    }
  );

  // Accept a call
  socket.on("accept-call", async (data: { callerId: string }) => {
    const recipientId = getAuthenticatedUserId(socket);
    if (!recipientId) return;

    console.log(`${recipientId} accepted call from ${data.callerId}\n`);

    // Notify both parties
    sendToUser(io, data.callerId, "call-accepted", { userId: recipientId });
    sendToUser(io, recipientId, "call-accepted", { userId: data.callerId });
  });

  // Reject a call
  socket.on("reject-call", async (data: { callerId: string }) => {
    const recipientId = getAuthenticatedUserId(socket);
    if (!recipientId) return;

    console.log(`${recipientId} rejected call from ${data.callerId}\n`);

    // Notify caller only
    sendToUser(io, data.callerId, "call-rejected", { userId: recipientId });
  });
}
