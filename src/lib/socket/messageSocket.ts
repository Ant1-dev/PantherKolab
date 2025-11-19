import { Socket, Server } from "socket.io";
import { messageService } from "@/services/messageService.js";
import { conversationService } from "@/services/conversationService.js";
import { getAuthenticatedUserId } from "@/lib/socket/socketAuthMiddleware.js";

export function initializeMessageSocket(socket: Socket, io: Server) {
  socket.on("send-message", async (data, callback) => {
    try {
      const { conversationId, content, type, tempId } = data;

      // Get authenticated userId from socket (don't trust client's senderId)
      const authenticatedUserId = getAuthenticatedUserId(socket);

      if (!authenticatedUserId) {
        callback?.({
          success: false,
          error: "Unauthorized: No authenticated user",
        });
        return;
      }

      // 1. Send message directly through backend logic (no fetch)
      const message = await messageService.sendMessage({
        conversationId,
        senderId: authenticatedUserId, // Use authenticated userId
        content,
        type: type || "TEXT",
      });

      // 2. Update last message timestamp
      await conversationService.updateLastMessage(
        conversationId,
        message.timestamp
      );

      // 3. Broadcast to all clients in the room
      io.to(conversationId).emit("new-message", message);

      // 4. Acknowledge to sender
      callback?.({ success: true, messageId: message.messageId, tempId });
    } catch (error) {
      console.error("Send message error:", error);
      if (error instanceof Error) {
        callback?.({ success: false, error: error.message });
      } else {
        callback?.({ success: false, error: String(error) });
      }
    }
  });

  socket.on("typing-start", (data) => {
    const authenticatedUserId = getAuthenticatedUserId(socket);
    if (!authenticatedUserId) return;

    // Broadcast with authenticated userId (don't trust client's userId)
    socket.to(data.conversationId).emit("user-typing", {
      userId: authenticatedUserId,
      conversationId: data.conversationId,
    });
  });

  socket.on("typing-stop", (data) => {
    const authenticatedUserId = getAuthenticatedUserId(socket);
    if (!authenticatedUserId) return;

    // Broadcast with authenticated userId (don't trust client's userId)
    socket.to(data.conversationId).emit("user-stopped-typing", {
      userId: authenticatedUserId,
      conversationId: data.conversationId,
    });
  });
}
