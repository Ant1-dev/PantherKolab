/**
 * Messages Test Page
 *
 * This page provides a complete UI for testing message transfer functionality
 * Uses real hooks and Socket.IO for real-time messaging with mock components
 *
 * Access at: http://localhost:3000/test/messages
 */

"use client";

import { useCallback, useMemo, useState } from "react";
import { useConversations } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/components/contexts/AuthContext";
import type {
  Message,
  Conversation,
  CreateConversationInput,
} from "@/types/database";
import { ConversationList, type MockConversation } from "@/components/mock/ConversationList";
import { ChatWindow } from "@/components/mock/ChatWindow";
import { type MockMessage } from "@/components/mock/MessageList";
import { ProfileList, type ProfileInfo } from "@/components/mock/ProfileList";
import {
  MessageSquare,
  Phone,
  Settings,
  User,
  X,
  Plus,
} from "lucide-react";

interface NewConversationModal {
  isOpen: boolean;
  name: string;
  type: "DM" | "GROUP";
  participants: string;
}

export default function MessagesTestPage() {
  const { user } = useAuth();
  const currentUserId = user?.userId || "";
  const [showProfile, setShowProfile] = useState(true);
  const [newConvModal, setNewConvModal] = useState<NewConversationModal>({
    isOpen: false,
    name: "",
    type: "GROUP",
    participants: "",
  });

  const {
    conversations,
    loading: conversationsLoading,
    activeConversationId,
    selectConversation,
    createConversation,
  } = useConversations();

  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    sendMessage: realSendMessage,
  } = useMessages({
    conversationId: activeConversationId,
    currentUserId,
  });

  // Convert real conversations to mock format
  const mockConversations: MockConversation[] = useMemo(() => {
    return conversations.map((conv) => ({
      conversationId: conv.conversationId,
      name: conv.name || "Unnamed Conversation",
      type: conv.type,
      participants: conv.participants || [],
      lastMessage: undefined, // Not available in Conversation type
      lastMessageTime: conv.lastMessageAt,
    }));
  }, [conversations]);

  // Convert real messages to mock format
  const mockMessages: MockMessage[] = useMemo(() => {
    return messages.map((msg) => ({
      messageId: msg.messageId,
      senderId: msg.senderId,
      senderName: msg.senderId.substring(0, 8), // Use first 8 chars as name
      content: msg.content || "", // Ensure content is never null
      timestamp: msg.timestamp,
      type: msg.type,
      isCurrentUser: msg.senderId === currentUserId,
    }));
  }, [messages, currentUserId]);

  const activeConversation = conversations.find(
    (c) => c.conversationId === activeConversationId
  );

  // Mock profile data for the current user
  const profileInfo: ProfileInfo = useMemo(() => ({
    name: user?.username || "Roary FIU",
    email: "roary@fiu.edu", // Email would come from user profile in production
    location: "Miami, FL, USA",
    status: "Going to the football game later!",
    aboutMe: "FIU Panther 🐾 | Game day energy, all day | Roaring for the team 💙🧡",
    isOnline: true,
    groupsInCommon: activeConversation ? [
      activeConversation.name || "",
      "BSC2010 - Biology 1"
    ] : ["BSC2010 - Biology 1"],
  }), [user, activeConversation]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!activeConversationId || !currentUserId) return;

      try {
        await realSendMessage(content, "TEXT");
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [activeConversationId, currentUserId, realSendMessage]
  );

  const handleSelectConversation = useCallback(
    (conversationId: string) => {
      selectConversation(conversationId);
    },
    [selectConversation]
  );

  const handleCreateConversation = useCallback(async () => {
    if (!newConvModal.name.trim() || !newConvModal.participants.trim()) {
      alert("Please provide a name and participants");
      return;
    }

    const participantIds = newConvModal.participants
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p);

    if (participantIds.length === 0) {
      alert("Please provide at least one participant");
      return;
    }

    const input: CreateConversationInput = {
      type: newConvModal.type,
      name: newConvModal.name,
      participants: [currentUserId, ...participantIds],
      createdBy: currentUserId,
    };

    try {
      await createConversation(input);
      setNewConvModal({
        isOpen: false,
        name: "",
        type: "GROUP",
        participants: "",
      });
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  }, [newConvModal, currentUserId, createConversation]);

  return (
    <div className="h-screen flex bg-white">
      {/* Left Sidebar - Navigation */}
      <div className="w-16 bg-blue-600 flex flex-col items-center py-6">
        <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center mb-8">
          <User className="w-6 h-6 text-gray-800" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center space-y-8">
          <button className="p-2 text-white hover:bg-blue-700 rounded-lg transition-colors">
            <MessageSquare className="w-6 h-6" />
          </button>
          <button className="p-2 text-white hover:bg-blue-700 rounded-lg transition-colors">
            <Phone className="w-6 h-6" />
          </button>
          <button className="p-2 text-white hover:bg-blue-700 rounded-lg transition-colors">
            <Settings className="w-6 h-6" />
          </button>
        </div>

        <button className="p-2 text-white hover:bg-blue-700 rounded-lg transition-colors">
          <User className="w-6 h-6" />
        </button>
      </div>

      {/* Conversation List - Using Mock Component */}
      <ConversationList
        conversations={mockConversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onCreateConversation={() => setNewConvModal({ ...newConvModal, isOpen: true })}
      />

      {/* Chat Window - Using Mock Component */}
      <ChatWindow
        conversationId={activeConversationId}
        conversationName={activeConversation?.name || ""}
        messages={mockMessages}
        currentUserId={currentUserId}
        onSendMessage={handleSendMessage}
        isLoading={messagesLoading}
        memberCount={activeConversation?.participants?.length || 0}
      />

      {/* Profile Sidebar - Using Mock Component */}
      {showProfile && <ProfileList profile={profileInfo} />}

      {/* New Conversation Modal */}
      {newConvModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-96 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Create New Conversation
              </h2>
              <button
                onClick={() =>
                  setNewConvModal({
                    isOpen: false,
                    name: "",
                    type: "GROUP",
                    participants: "",
                  })
                }
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conversation Name
                </label>
                <input
                  type="text"
                  value={newConvModal.name}
                  onChange={(e) =>
                    setNewConvModal({ ...newConvModal, name: e.target.value })
                  }
                  placeholder="Enter conversation name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() =>
                      setNewConvModal({ ...newConvModal, type: "GROUP" })
                    }
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      newConvModal.type === "GROUP"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Group
                  </button>
                  <button
                    onClick={() =>
                      setNewConvModal({ ...newConvModal, type: "DM" })
                    }
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      newConvModal.type === "DM"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    DM
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Participants (comma-separated user IDs)
                </label>
                <input
                  type="text"
                  value={newConvModal.participants}
                  onChange={(e) =>
                    setNewConvModal({
                      ...newConvModal,
                      participants: e.target.value,
                    })
                  }
                  placeholder="user1, user2, user3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() =>
                    setNewConvModal({
                      isOpen: false,
                      name: "",
                      type: "GROUP",
                      participants: "",
                    })
                  }
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancell
                </button>
                <button
                  onClick={handleCreateConversation}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
