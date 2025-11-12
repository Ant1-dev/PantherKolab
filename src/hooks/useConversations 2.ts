/**
 * useConversations Hook
 * 
 * Hook for listing and managing conversations.
 * Handles:
 * - Loading user's conversations from API
 * - Real-time updates for conversation list
 * - Creating new conversations
 * - Managing active conversation selection
 */

import { useState, useEffect, useCallback } from "react";
import { useSocket } from "./useSocket";
import type { Conversation, CreateConversationInput } from "@/types/database";

interface UseConversationsReturn {
  conversations: Conversation[];
  loading: boolean;
  error: Error | null;
  activeConversationId: string | null;
  selectConversation: (conversationId: string | null) => void;
  createConversation: (input: CreateConversationInput) => Promise<Conversation>;
  refreshConversations: () => Promise<void>;
}

/**
 * Hook to manage conversations
 * 
 * @returns Conversations list, loading state, error, and management functions
 * 
 * @example
 * ```tsx
 * const {
 *   conversations,
 *   activeConversationId,
 *   selectConversation,
 *   createConversation,
 * } = useConversations();
 * ```
 */
export function useConversations(): UseConversationsReturn {
  const { socket, isConnected } = useSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  /**
   * Fetch conversations from API
   */
  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/conversations", {
        method: "GET",
        credentials: "include", // Include cookies for auth
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch conversations: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Assume API returns conversations array
      const fetchedConversations = Array.isArray(data.conversations)
        ? data.conversations
        : Array.isArray(data)
        ? data
        : [];

      // Sort by lastMessageAt (newest first)
      const sorted = [...fetchedConversations].sort((a, b) => {
        const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return timeB - timeA;
      });

      setConversations(sorted);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load conversations");
      setError(error);
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Handle conversation updated event (real-time update)
   */
  const handleConversationUpdated = useCallback(
    (updatedConversation: Conversation) => {
      setConversations((prev) => {
        const index = prev.findIndex(
          (conv) => conv.conversationId === updatedConversation.conversationId
        );

        if (index === -1) {
          // New conversation, add it
          return [updatedConversation, ...prev].sort((a, b) => {
            const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
            const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
            return timeB - timeA;
          });
        }

        // Update existing conversation
        const updated = [...prev];
        updated[index] = updatedConversation;
        
        // Re-sort by lastMessageAt
        return updated.sort((a, b) => {
          const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return timeB - timeA;
        });
      });
    },
    []
  );

  /**
   * Handle new conversation created (real-time)
   */
  const handleNewConversation = useCallback((newConversation: Conversation) => {
    setConversations((prev) => {
      // Check if conversation already exists
      const exists = prev.some(
        (conv) => conv.conversationId === newConversation.conversationId
      );
      
      if (exists) return prev;
      
      // Add new conversation at the top
      return [newConversation, ...prev];
    });
  }, []);

  /**
   * Handle Socket.IO errors
   */
  const handleError = useCallback((err: Error) => {
    console.error("Socket.IO error in useConversations:", err);
    setError(err);
  }, []);

  /**
   * Create a new conversation
   */
  const createConversation = useCallback(
    async (input: CreateConversationInput): Promise<Conversation> => {
      try {
        const response = await fetch("/api/conversations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          throw new Error(`Failed to create conversation: ${response.statusText}`);
        }

        const data = await response.json();
        const newConversation: Conversation = data.conversation || data;

        // Add to conversations list
        setConversations((prev) => [newConversation, ...prev]);

        // Automatically select the new conversation
        setActiveConversationId(newConversation.conversationId);

        return newConversation;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to create conversation");
        setError(error);
        throw error;
      }
    },
    []
  );

  /**
   * Select an active conversation
   */
  const selectConversation = useCallback((conversationId: string | null) => {
    setActiveConversationId(conversationId);
  }, []);

  /**
   * Refresh conversations (reload from API)
   */
  const refreshConversations = useCallback(async () => {
    await fetchConversations();
  }, [fetchConversations]);

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Set up Socket.IO listeners for real-time updates
  useEffect(() => {
    if (!isConnected) return;

    socket.on("conversation-updated", handleConversationUpdated);
    socket.on("new-conversation", handleNewConversation);
    socket.on("error", handleError);

    return () => {
      socket.off("conversation-updated", handleConversationUpdated);
      socket.off("new-conversation", handleNewConversation);
      socket.off("error", handleError);
    };
  }, [isConnected, socket, handleConversationUpdated, handleNewConversation, handleError]);

  return {
    conversations,
    loading,
    error,
    activeConversationId,
    selectConversation,
    createConversation,
    refreshConversations,
  };
}

export default useConversations;



