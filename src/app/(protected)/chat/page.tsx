"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Phone, Settings, User, Menu } from "lucide-react";
import { useAuth } from "@/components/contexts/AuthContext";
import { useMessages } from "@/hooks/useMessages";
import ConversationList from "@/components/chat/conversationList";
import MainChatArea from "@/components/chat/mainChatArea";
import ProfileSidebar from "@/components/chat/profilesidebar";
import type { Conversation as DBConversation } from "@/types/database";

// Adapter type for ConversationList component
interface UIConversation {
  id: string;
  name: string;
  type: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageSender?: string;
  members?: number;
  profileKey?: string;
  unread?: number;
}

/**
 * Production Chat Page
 * Integrates real-time messaging with AppSync Events and DynamoDB
 */
export default function ChatPage() {
  const auth = useAuth();
  const currentUserId = auth.user?.userId || "";

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
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

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

  // Convert DB conversation to UI conversation format
  const convertToUIConversation = (conv: DBConversation): UIConversation => {
    return {
      id: conv.conversationId,
      name: conv.name || "Unnamed Conversation",
      type: conv.type === "GROUP" ? "group" : "direct",
      avatar: conv.avatar || "",
      lastMessage: "No messages yet",
      lastMessageTime: new Date(conv.createdAt).toLocaleDateString(),
      members: conv.participants?.length,
      unread: 0,
    };
  };

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

  // Get profile data for the current conversation
  const getProfileData = () => {
    if (!selectedConversation || selectedConversation.type === "GROUP") {
      return null;
    }

    // For DM conversations, find the other participant
    const otherUserId = selectedConversation.participants.find(
      (id) => id !== currentUserId
    );

    if (!otherUserId) return null;

    // TODO: Fetch user profile from API
    // For now, return placeholder data matching ProfileData interface
    return {
      id: otherUserId,
      name: selectedConversation.name || "Unknown User",
      email: `${otherUserId}@fiu.edu`,
      phone: "+1 (555) 000-0000",
      status: "Available",
      location: "Miami, FL",
      about: "FIU Student",
      groupsInCommon: [],
    };
  };

  const profileData = getProfileData();

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
    // TODO: Implement DM conversation creation
    console.log("Creating DM with user:", userId);
  };

  // Handle new group creation
  const handleCreateGroup = () => {
    // TODO: Navigate to group creation flow
    console.log("Creating new group");
  };

  // Get recent users from conversations for the dropdown
  const getRecentUsers = () => {
    return conversations
      .filter((conv) => conv.type === "DM")
      .map((conv) => {
        const otherUserId = conv.participants.find((id) => id !== currentUserId);
        return {
          id: otherUserId || "",
          name: conv.name || "Unknown User",
          avatar: conv.avatar || undefined,
        };
      })
      .filter((user) => user.id); // Remove any without valid IDs
  };

  // Filter UI conversations based on active tab
  const filteredConversations = uiConversations.filter((conv) => {
    if (activeTab === "groups") return conv.type === "group";
    if (activeTab === "dms") return conv.type === "direct";
    return true; // "all"
  });

  // Apply search filter
  const searchedConversations = searchQuery
    ? filteredConversations.filter((conv) =>
        conv.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredConversations;

  return (
    <div className="h-screen flex bg-white font-sans">
      {/* Left Sidebar - Navigation */}
      <div
        className={`bg-[#0066CC] flex flex-col py-6 transition-all duration-300 ${
          sidebarExpanded ? "w-40" : "w-20"
        }`}
      >
        <button
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className="ml-4 mb-8 p-2 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer self-start"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>

        <div className="flex-1 flex flex-col items-center justify-center space-y-8">
          <button
            className={`flex items-center gap-3 p-2 text-white bg-blue-700 rounded-lg transition-colors cursor-pointer ${
              sidebarExpanded ? "w-40 px-4" : ""
            }`}
          >
            <MessageSquare className="w-6 h-6 flex-shrink-0" />
            {sidebarExpanded && (
              <span className="text-sm font-medium">Chats</span>
            )}
          </button>
          <button
            onClick={() => (window.location.href = "/call")}
            className={`flex items-center gap-3 p-2 text-white hover:bg-blue-700 rounded-lg transition-colors cursor-pointer ${
              sidebarExpanded ? "w-40 px-4" : ""
            }`}
          >
            <Phone className="w-6 h-6 flex-shrink-0" />
            {sidebarExpanded && (
              <span className="text-sm font-medium">Calls</span>
            )}
          </button>
          <button
            className={`flex items-center gap-3 p-2 text-white hover:bg-blue-700 rounded-lg transition-colors cursor-pointer ${
              sidebarExpanded ? "w-40 px-4" : ""
            }`}
          >
            <Settings className="w-6 h-6 flex-shrink-0" />
            {sidebarExpanded && (
              <span className="text-sm font-medium">Settings</span>
            )}
          </button>
        </div>

        <button
          className={`flex items-center gap-3 p-2 text-white hover:bg-blue-700 rounded-lg transition-colors cursor-pointer ${
            sidebarExpanded ? "w-40 mx-auto px-4" : "mx-auto"
          }`}
        >
          <User className="w-6 h-6 flex-shrink-0" />
          {sidebarExpanded && (
            <span className="text-sm font-medium">Profile</span>
          )}
        </button>
      </div>

      {/* Conversation List Component */}
      {loadingConversations ? (
        <div className="w-96 flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">Loading conversations...</p>
        </div>
      ) : conversationsError ? (
        <div className="w-96 flex items-center justify-center bg-gray-50">
          <p className="text-red-500">Error: {conversationsError}</p>
        </div>
      ) : (
        <ConversationList
          conversations={searchedConversations}
          selectedConversation={selectedUIConversation!}
          onSelectConversation={handleSelectConversation}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          recentUsers={getRecentUsers()}
          onSelectUser={handleSelectUser}
          onCreateGroup={handleCreateGroup}
        />
      )}

      {/* Main Chat Area Component */}
      <MainChatArea
        selectedConversation={selectedConversation}
        messages={messages}
        messageInput=""
        onMessageInputChange={() => {}}
        onSendMessage={handleSendMessage}
        onToggleProfile={() => setShowProfile((prev) => !prev)}
        loggedInUserInitials={currentUserId}
        isLoading={loadingMessages}
        error={messagesError?.message}
      />

      {/* Profile Sidebar Component */}
      {profileData && (
        <ProfileSidebar profileData={profileData} isVisible={showProfile} />
      )}
    </div>
  );
}
