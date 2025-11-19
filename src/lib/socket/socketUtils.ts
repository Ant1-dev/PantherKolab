/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server } from "socket.io";

/**
 * Send an event to a specific user across all their connected devices
 * @param io - Socket.IO server instance
 * @param userId - Target user's ID
 * @param event - Event name
 * @param data - Event payload
 */
export function sendToUser(
  io: Server,
  userId: string,
  event: string,
  data: any
): void {
  io.to(`user:${userId}`).emit(event, data);
}

/**
 * Send an event to multiple users across all their connected devices
 * @param io - Socket.IO server instance
 * @param userIds - Array of target user IDs
 * @param event - Event name
 * @param data - Event payload
 */
export function sendToUsers(
  io: Server,
  userIds: string[],
  event: string,
  data: any
): void {
  userIds.forEach((userId) => {
    io.to(`user:${userId}`).emit(event, data);
  });
}
