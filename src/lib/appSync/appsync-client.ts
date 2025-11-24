/**
 * AWS AppSync Events Client
 *
 * Uses AWS Amplify's events module for real-time subscriptions.
 * This file should only contain client-side subscription logic.
 * Event publishing should be handled by the server-side client.
 */

"use client";

import { events } from "aws-amplify/api";
import { AppSyncEvent } from "@/types/appsync-events";

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
// Export
// ============================================================================
const AppSyncClient = {
  // Core functions
  subscribeToChannel,
  subscribeToChannels,

  // User-centric subscriptions
  subscribeToUserMessages,
  subscribeToUserTyping,
  subscribeToUserNotifications,
  subscribeToCallSession,
};
export default AppSyncClient;
