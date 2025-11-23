/**
 * AWS AppSync Events Client
 *
 * Uses AWS Amplify's events module for real-time subscriptions
 * Replaces Socket.IO for real-time functionality
 */

"use client";

import { DocumentType } from "@aws-amplify/core/internals/utils";
import { events } from "aws-amplify/api";
//import { fetchAuthSession } from "aws-amplify/auth";

// HTTP endpoint for server-side publishing
const HTTP_ENDPOINT = process.env.NEXT_PUBLIC_APPSYNC_EVENT_HTTP_ENDPOINT!;

// ============================================================================
// Types
// ============================================================================

export type MessageEventType =
  | "MESSAGE_SENT"
  | "MESSAGE_DELETED"
  | "MESSAGE_UPDATED"
  | "MESSAGE_READ";

export type TypingEventType = "USER_TYPING" | "USER_STOPPED_TYPING";

export type CallEventType =
  | "INCOMING_CALL"
  | "CALL_RINGING"
  | "CALL_CONNECTED"
  | "CALL_REJECTED"
  | "CALL_ENDED"
  | "CALL_ERROR"
  | "PARTICIPANT_LEFT";

export type EventType = MessageEventType | TypingEventType | CallEventType;

export interface AppSyncEvent<T = DocumentType> {
  type: EventType;
  data: T;
  timestamp?: string;
  serverTimestamp?: string;
}

// ============================================================================
// Subscriptions (using Amplify events module)
// ============================================================================

/**
 * Subscribe to an AppSync Events channel using Amplify
 *
 * @example
 * const channel = await subscribeToChannel('/chats/conv-123', {
 *   onEvent: (event) => console.log('New message:', event),
 *   onError: (error) => console.error('Error:', error),
 * });
 *
 *  Later, to unsubscribe:
 * channel.close();
 */
export async function subscribeToChannel<T = unknown>(
  channelPath: string,
  callbacks: {
    onEvent: (event: AppSyncEvent<T>) => void;
    onError?: (error: Error) => void;
  }
): Promise<{ close: () => void }> {
  try {
    const channel = await events.connect(channelPath);

    // Subscribe to events on this channel
    channel.subscribe({
      next: (data) => {
        try {
          // Parse the event data
          const event =
            typeof data.event === "string"
              ? JSON.parse(data.event)
              : data.event;
          callbacks.onEvent(event as AppSyncEvent<T>);
        } catch (e) {
          console.error("[AppSync] Failed to parse event:", e);
          callbacks.onError?.(
            e instanceof Error ? e : new Error("Failed to parse event")
          );
        }
      },
      error: (error) => {
        console.error("[AppSync] Subscription error:", error);
        callbacks.onError?.(
          error instanceof Error ? error : new Error(String(error))
        );
      },
    });

    console.log(`[AppSync] Subscribed to ${channelPath}`);

    return {
      close: () => {
        channel.close();
        console.log(`[AppSync] Unsubscribed from ${channelPath}`);
      },
    };
  } catch (error) {
    console.error("[AppSync] Failed to subscribe:", error);
    throw error;
  }
}

/**
 * Subscribe to multiple channels at once
 */
export async function subscribeToChannels<T = unknown>(
  channelPaths: string[],
  callbacks: {
    onEvent: (event: AppSyncEvent<T>, channel: string) => void;
    onError?: (error: Error) => void;
  }
): Promise<{ close: () => void }> {
  const subscriptions = await Promise.all(
    channelPaths.map(async (path) => {
      return subscribeToChannel<T>(path, {
        onEvent: (event) => callbacks.onEvent(event, path),
        onError: callbacks.onError,
      });
    })
  );

  return {
    close: () => {
      subscriptions.forEach((sub) => sub.close());
    },
  };
}

// ============================================================================
// Publishing (using Amplify events.post)
// ============================================================================

/**
 * Publish an event to an AppSync Events channel
 *
 * @example
 * await publishEvent('/chats/conv-123', {
 *   type: 'MESSAGE_SENT',
 *   data: { messageId: 'msg-456', content: 'Hello' }
 * });
 */
export async function publishEvent(
  channel: string,
  event: AppSyncEvent
): Promise<void> {
  // Add client timestamp
  const eventWithTimestamp = {
    ...event,
    // timestamp: event.timestamp || new Date().toISOString(),
  };

  try {
    await events.post(channel, eventWithTimestamp);
    console.log(`[AppSync] Published ${event.type} to ${channel}`);
  } catch (error) {
    console.error(`[AppSync] Failed to publish to ${channel}:`, error);
    throw error;
  }
}

/**
 * Publish multiple events to a channel
 */
export async function batchPublish(
  channel: string,
  eventList: AppSyncEvent[]
): Promise<void> {
  const eventsWithTimestamp = eventList.map((event) => ({
    ...event,
    timestamp: event.timestamp || new Date().toISOString(),
  }));

  // Amplify events.post can accept an array
  await events.post(channel, eventsWithTimestamp);
  console.log(`[AppSync] Published ${eventList.length} events to ${channel}`);
}

// ============================================================================
// Server-side Publishing (for API routes)
// ============================================================================

/**
 * Publish from server-side (API routes) using HTTP
 * Use this in Next.js API routes where Amplify client isn't available
 */
export async function publishEventFromServer(
  channel: string,
  event: AppSyncEvent,
  authToken: string
): Promise<void> {
  const eventWithTimestamp = {
    ...event,
    timestamp: event.timestamp || new Date().toISOString(),
  };

  const response = await fetch(HTTP_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authToken,
    },
    body: JSON.stringify({
      channel,
      events: [JSON.stringify(eventWithTimestamp)],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AppSync publish failed: ${response.status} - ${error}`);
  }

  console.log(`[AppSync] Server published ${event.type} to ${channel}`);
}

// ============================================================================
// User-Centric Subscription Functions
// ============================================================================
// With user-centric channels, each user subscribes to their own channel
// instead of subscribing to each conversation. This reduces subscription
// management from 20-40+ channels to just 3-4 fixed channels.

/**
 * Subscribe to ALL messages for the current user (user-centric model)
 *
 * Messages from all conversations arrive on this single channel.
 * Filter by conversationId in the event data if needed.
 */
export async function subscribeToUserMessages(
  userId: string,
  onMessage: (event: AppSyncEvent) => void,
  onError?: (error: Error) => void
): Promise<{ close: () => void }> {
  return subscribeToChannel(`/chats/${userId}`, {
    onEvent: onMessage,
    onError,
  });
}

/**
 * Subscribe to ALL typing indicators for the current user
 *
 * Typing events from all conversations arrive on this single channel.
 * Filter by conversationId in the event data if needed.
 */
export async function subscribeToUserTyping(
  userId: string,
  onTyping: (
    event: AppSyncEvent<{ userId: string; conversationId: string }>
  ) => void,
  onError?: (error: Error) => void
): Promise<{ close: () => void }> {
  return subscribeToChannel(`/typing/${userId}`, {
    onEvent: onTyping,
    onError,
  });
}

/**
 * Subscribe to direct notifications (incoming calls, call status)
 */
export async function subscribeToUserNotifications(
  userId: string,
  onNotification: (event: AppSyncEvent<unknown>) => void,
  onError?: (error: Error) => void
): Promise<{ close: () => void }> {
  return subscribeToChannel(`/users/${userId}`, {
    onEvent: onNotification,
    onError,
  });
}

/**
 * Subscribe to call session events (during active call)
 */
export async function subscribeToCallSession(
  sessionId: string,
  onEvent: (event: AppSyncEvent<unknown>) => void,
  onError?: (error: Error) => void
): Promise<{ close: () => void }> {
  return subscribeToChannel(`/calls/${sessionId}`, {
    onEvent: onEvent,
    onError,
  });
}

// ============================================================================
// Multi-Publish Helper (for API routes)
// ============================================================================

/**
 * Publish an event to multiple user channels
 *
 * Used by API routes to broadcast to all conversation participants.
 * For a 10-person group chat, this publishes to 10 channels.
 */
export async function publishToUsers(
  userIds: string[],
  channelPrefix: string,
  event: AppSyncEvent
): Promise<void> {
  const eventWithTimestamp = {
    ...event,
    timestamp: event.timestamp || new Date().toISOString(),
  };

  await Promise.all(
    userIds.map((userId) =>
      events.post(`${channelPrefix}/${userId}`, eventWithTimestamp)
    )
  );

  console.log(
    `[AppSync] Published ${event.type} to ${userIds.length} user channels`
  );
}

// ============================================================================
// Export
// ============================================================================
const AppSyncClient = {
  // Core functions
  publishEvent,
  batchPublish,
  publishEventFromServer,
  subscribeToChannel,
  subscribeToChannels,

  // User-centric subscriptions
  subscribeToUserMessages,
  subscribeToUserTyping,
  subscribeToUserNotifications,
  subscribeToCallSession,

  // Multi-publish helper
  publishToUsers,
};
export default AppSyncClient;
