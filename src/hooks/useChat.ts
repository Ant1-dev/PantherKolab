import { useState, useEffect } from "react";
import { useMessages } from "@/hooks/useMessages";
import type { Conversation as DBConversation } from "@/types/database";
import {
  UIConversation,
  convertToUIConversation,
} from "@/components/chat/utils/conversationUtils";
import { type SearchableUser } from "@/components/chat/utils/userSearch";

export const useChat = (currentUserId: string) => {
  // State management
  const [conversations, setConversations] = useState<DBConversation[]>([]);
  const [uiConversations, setUiConversations] = useState<UIConversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<DBConversation | null>(null);
  const [selectedUIConversation, setSelectedUIConversation] =
    useState<UIConversation | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "groups" | "dms">("all");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [conversationsError, setConversationsError] = useState<string | null>(
    null
  );

  // Real-time messaging hook
  const {
    messages,
    loading: loadingMessages,
    error: messagesError,
    sendMessage,
  } = useMessages({
    conversationId: selectedConversation?.conversationId || null,
    currentUserId,
  });

  // Fetch user's conversations on mount
  useEffect(() => {
    const fetchConversations = async () => {
      if (!currentUserId) return;

      try {
        setLoadingConversations(true);
        const response = await fetch("/api/conversations", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch conversations");
        }

        const data = await response.json();
        const dbConvs: DBConversation[] = data.conversations || [];
        setConversations(dbConvs);

        // Convert to UI format
        const uiConvs = dbConvs.map(convertToUIConversation);
        setUiConversations(uiConvs);

        // Auto-select first conversation if available
        if (dbConvs.length > 0) {
          setSelectedConversation(dbConvs[0]);
          setSelectedUIConversation(uiConvs[0]);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
        setConversationsError(
          error instanceof Error ? error.message : "Unknown error"
        );
      } finally {
        setLoadingConversations(false);
      }
    };

    fetchConversations();
  }, [currentUserId]);

  // Handle conversation selection
  const handleSelectConversation = (uiConv: UIConversation) => {
    // Find corresponding DB conversation
    const dbConv = conversations.find((c) => c.conversationId === uiConv.id);
    if (dbConv) {
      setSelectedConversation(dbConv);
      setSelectedUIConversation(uiConv);
    }
    setShowProfile(false);
  };

  // Handle sending messages
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !selectedConversation) return;

    try {
      await sendMessage(content, "TEXT");
    } catch (error) {
      console.error("Failed to send message:", error);
      alert(
        "Failed to send message: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  // Handle new conversation user selection
  const handleSelectUser = async (userId: string) => {
    try {
      // Create optimistic conversation
      const tempConversationId = `temp-${Date.now()}`;
      const optimisticConversation: DBConversation = {
        conversationId: tempConversationId,
        type: "DM",
        name: "Loading...",
        description: null,
        participants: [currentUserId, userId],
        admins: [],
        createdBy: currentUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
        avatar: null,
      };

      const optimisticUIConversation = convertToUIConversation(
        optimisticConversation
      );

      // Optimistically update UI
      setConversations((prev) => [optimisticConversation, ...prev]);
      setUiConversations((prev) => [optimisticUIConversation, ...prev]);
      setSelectedConversation(optimisticConversation);
      setSelectedUIConversation(optimisticUIConversation);

      // Call API to create or find existing DM
      const response = await fetch("/api/conversations/dm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create DM");
      }

      const data = await response.json();
      const actualConversation: DBConversation = data.conversation;
      const otherUser = data.otherUser;

      // Update conversation with actual data
      const actualUIConversation: UIConversation = {
        id: actualConversation.conversationId,
        name:
          otherUser.fullName || `${otherUser.firstName} ${otherUser.lastName}`,
        type: "direct",
        avatar: otherUser.profilePicture || "",
        lastMessage: "No messages yet",
        lastMessageTime: new Date(
          actualConversation.createdAt
        ).toLocaleDateString(),
        unread: 0,
      };

      // Replace optimistic conversation with actual one
      setConversations((prev) =>
        prev.map((conv) =>
          conv.conversationId === tempConversationId ? actualConversation : conv
        )
      );
      setUiConversations((prev) =>
        prev.map((conv) =>
          conv.id === tempConversationId ? actualUIConversation : conv
        )
      );
      setSelectedConversation(actualConversation);
      setSelectedUIConversation(actualUIConversation);
    } catch (error) {
      console.error("Error creating DM:", error);
      // Remove optimistic conversation on error
      setConversations((prev) =>
        prev.filter((conv) => !conv.conversationId.startsWith("temp-"))
      );
      setUiConversations((prev) =>
        prev.filter((conv) => !conv.id.startsWith("temp-"))
      );
      alert("Failed to create conversation. Please try again.");
    }
  };

  // Handle new group creation
  const handleCreateGroup = async (name: string, members: SearchableUser[]) => {
    if (!name.trim() || members.length === 0) {
      alert("Group name and at least one member are required.");
      return;
    }

    const memberIds = members.map((m) => m.id);

    // Create optimistic conversation
    const tempConversationId = `temp-${Date.now()}`;
    const optimisticConversation: DBConversation = {
      conversationId: tempConversationId,
      type: "GROUP",
      name: name,
      description: null,
      participants: [...memberIds, currentUserId],
      admins: [currentUserId],
      createdBy: currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      avatar: null, // Placeholder for group avatar
    };

    const optimisticUIConversation =
      convertToUIConversation(optimisticConversation);

    // Optimistically update UI
    setConversations((prev) => [optimisticConversation, ...prev]);
    setUiConversations((prev) => [optimisticUIConversation, ...prev]);
    setSelectedConversation(optimisticConversation);
    setSelectedUIConversation(optimisticUIConversation);

    try {
      // Call API to create group
      const response = await fetch("/api/conversations/group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, memberIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to create group");
      }

      const data = await response.json();
      const actualConversation: DBConversation = data.conversation;

      // Replace optimistic conversation with actual one
      setConversations((prev) =>
        prev.map((conv) =>
          conv.conversationId === tempConversationId
            ? actualConversation
            : conv
        )
      );
      setUiConversations((prev) =>
        prev.map((conv) =>
          conv.id === tempConversationId
            ? convertToUIConversation(actualConversation)
            : conv
        )
      );
      setSelectedConversation(actualConversation);
      setSelectedUIConversation(convertToUIConversation(actualConversation));
    } catch (error) {
      console.error("Error creating group:", error);
      // Remove optimistic conversation on error
      setConversations((prev) =>
        prev.filter((conv) => conv.conversationId !== tempConversationId)
      );
      setUiConversations((prev) =>
        prev.filter((conv) => conv.id !== tempConversationId)
      );
      alert("Failed to create group. Please try again.");
    }
  };

  return {
    conversations,
    uiConversations,
    selectedConversation,
    selectedUIConversation,
    showProfile,
    searchQuery,
    activeTab,
    loadingConversations,
    conversationsError,
    messages,
    loadingMessages,
    messagesError,
    setSearchQuery,
    setActiveTab,
    setShowProfile,
    handleSelectConversation,
    handleSendMessage,
    handleSelectUser,
    handleCreateGroup,
  };
};