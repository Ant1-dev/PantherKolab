/**
 * useMessages Hook
 * 
 * Custom hook for managing messages in a conversation with real-time updates.
 * Handles:
 * - Loading message history from API
 * - Subscribing to real-time messages via Socket.IO
 * - Sending messages with optimistic updates
 * - Error handling and cleanup
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "./useSocket";
import type { Message } from "@/types/database";

interface UseMessagesOptions {
    conversationId: string | null;
    currentUserId?: string;
}

interface UseMessagesReturn {
    messages: Message[];
    loading: boolean;
    error: Error | null;
    sendMessage: (content: string, type?: "TEXT" | "AUDIO" | "IMAGE" | "VIDEO" | "FILE") => Promise<void>;
    refreshMessages: () => Promise<void>;
}

/**
 * Hook to manage messages for a conversation
 * 
 * @param conversationId - The ID of the conversation (null if no conversation selected)
 * @param currentUserId - The current user's ID (optional, for optimistic updates)
 * @returns Messages, loading state, error, and send function
 * 
 * @example
 * ```tsx
 * const { messages, loading, sendMessage } = useMessages({
 *   conversationId: "conv-123",
 *   currentUserId: "user-1"
 * });
 * ```
 */
export function useMessages({
    conversationId,
    currentUserId,
}: UseMessagesOptions): UseMessagesReturn {
    const { socket, isConnected } = useSocket();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Track pending optimistic messages
    const optimisticMessageIds = useRef<Set<string>>(new Set());
    // Track message sent confirmations we're waiting for
    const pendingConfirmations = useRef<Map<string, Message>>(new Map());

    /**
     * Fetch message history from API
     */
    const fetchMessages = useCallback(async () => {
        if (!conversationId) {
            setMessages([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/messages/${conversationId}`, {
                method: "GET",
                credentials: "include", // Include cookies for auth
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch messages: ${response.statusText}`);
            }

            const data = await response.json();

            // Assume API returns messages in chronological order (oldest first)
            // Reverse to show newest at bottom
            const fetchedMessages = Array.isArray(data.messages)
                ? data.messages
                : Array.isArray(data)
                    ? data
                    : [];

            setMessages(fetchedMessages);
        } catch (err) {
            const error = err instanceof Error ? err : new Error("Failed to load messages");
            setError(error);
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    }, [conversationId]);

    /**
     * Join Socket.IO room for this conversation
     */
    const joinConversation = useCallback(() => {
        if (!conversationId || !isConnected) return;

        socket.emit("join-conversation", conversationId);
    }, [conversationId, isConnected, socket]);

    /**
     * Leave Socket.IO room for this conversation
     */
    const leaveConversation = useCallback(() => {
        if (!conversationId || !isConnected) return;

        socket.emit("leave-conversation", conversationId);
    }, [conversationId, isConnected, socket]);

    /**
     * Handle new message received via Socket.IO
     */
    const handleNewMessage = useCallback(
        (message: Message) => {
            // Only add if it's for this conversation
            if (message.conversationId !== conversationId) return;

            // Check if we already have this message (avoid duplicates)
            setMessages((prev) => {
                const exists = prev.some((m) => m.messageId === message.messageId);
                if (exists) return prev;
                return [...prev, message];
            });

            // If this was an optimistic message we sent, remove it from tracking
            if (optimisticMessageIds.current.has(message.messageId)) {
                optimisticMessageIds.current.delete(message.messageId);
            }
        },
        [conversationId]
    );

    /**
     * Handle message sent confirmation
     */
    const handleMessageSent = useCallback(
        (confirmation: { messageId: string; conversationId: string; timestamp: string | Date; status: "sent" | "delivered" }) => {
            // Find the optimistic message and update it
            const optimisticMsg = pendingConfirmations.current.get(confirmation.messageId);

            if (optimisticMsg) {
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.messageId === confirmation.messageId
                            ? {
                                ...msg,
                                timestamp: typeof confirmation.timestamp === "string"
                                    ? confirmation.timestamp
                                    : confirmation.timestamp.toISOString(),
                                status: confirmation.status,
                            }
                            : msg
                    )
                );
                pendingConfirmations.current.delete(confirmation.messageId);
            }
        },
        []
    );

    /**
     * Handle Socket.IO errors
     */
    const handleError = useCallback((err: Error) => {
        console.error("Socket.IO error in useMessages:", err);
        setError(err);
    }, []);

    /**
     * Send a message
     */
    const sendMessage = useCallback(
        async (content: string, type: "TEXT" | "AUDIO" | "IMAGE" | "VIDEO" | "FILE" = "TEXT") => {
            if (!conversationId) {
                throw new Error("No conversation selected");
            }

            if (!currentUserId) {
                throw new Error("Current user ID not provided");
            }

            if (!content.trim()) {
                return; // Don't send empty messages
            }

            if (!isConnected) {
                throw new Error("Socket not connected. Please check your connection.");
            }

            // Create optimistic message
            const optimisticId = `temp-${Date.now()}-${Math.random()}`;
            const optimisticMessage: Message = {
                conversationId,
                timestamp: new Date().toISOString(),
                messageId: optimisticId,
                senderId: currentUserId,
                type,
                content: content.trim(),
                mediaUrl: null,
                fileName: null,
                fileSize: null,
                duration: null,
                readBy: [],
                reactions: {},
                replyTo: null,
                deleted: false,
                createdAt: new Date().toISOString(),
            };

            // Add optimistic message immediately
            setMessages((prev) => [...prev, optimisticMessage]);
            optimisticMessageIds.current.add(optimisticId);
            pendingConfirmations.current.set(optimisticId, optimisticMessage);

            try {
                // Emit send-message event
                socket.emit("send-message", {
                    conversationId,
                    content: content.trim(),
                    senderId: currentUserId,
                    type,
                });

                // If confirmation doesn't come within 5 seconds, remove optimistic message
                setTimeout(() => {
                    if (pendingConfirmations.current.has(optimisticId)) {
                        // Message wasn't confirmed, remove optimistic version
                        setMessages((prev) => prev.filter((msg) => msg.messageId !== optimisticId));
                        optimisticMessageIds.current.delete(optimisticId);
                        pendingConfirmations.current.delete(optimisticId);
                        setError(new Error("Message failed to send. Please try again."));
                    }
                }, 5000);
            } catch (err) {
                // Remove optimistic message on error
                setMessages((prev) => prev.filter((msg) => msg.messageId !== optimisticId));
                optimisticMessageIds.current.delete(optimisticId);
                pendingConfirmations.current.delete(optimisticId);

                const error = err instanceof Error ? err : new Error("Failed to send message");
                setError(error);
                throw error;
            }
        },
        [conversationId, currentUserId, isConnected, socket]
    );

    /**
     * Refresh messages (reload from API)
     */
    const refreshMessages = useCallback(async () => {
        await fetchMessages();
    }, [fetchMessages]);

    // Load messages when conversation changes
    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    // Join/leave conversation room when conversation changes
    useEffect(() => {
        if (isConnected && conversationId) {
            joinConversation();
        }

        return () => {
            if (conversationId) {
                leaveConversation();
            }
        };
    }, [conversationId, isConnected, joinConversation, leaveConversation]);

    // Set up Socket.IO listeners
    useEffect(() => {
        if (!isConnected) return;

        socket.on("new-message", handleNewMessage);
        socket.on("message-sent", handleMessageSent);
        socket.on("error", handleError);

        return () => {
            socket.off("new-message", handleNewMessage);
            socket.off("message-sent", handleMessageSent);
            socket.off("error", handleError);
        };
    }, [isConnected, socket, handleNewMessage, handleMessageSent, handleError]);

    // Cleanup optimistic messages on unmount
    useEffect(() => {
        return () => {
            optimisticMessageIds.current.clear();
            pendingConfirmations.current.clear();
        };
    }, []);

    return {
        messages,
        loading,
        error,
        sendMessage,
        refreshMessages,
    };
}

export default useMessages;



