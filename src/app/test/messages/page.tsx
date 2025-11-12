/**
 * Messages Test Page
 *
 * This page provides a complete UI for testing message transfer functionality
 * Uses real hooks and Socket.IO for real-time messaging
 *
 * Access at: http://localhost:3000/test/messages
 */

"use client";

import { useCallback, useMemo, useState } from "react";
import { useConversations } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/components/contexts/AuthContext";
import type { Message, Conversation, CreateConversationInput } from "@/types/database";
import {
  MessageSquare,
  Phone,
  Settings,
  User,
  Search,
  MoreVertical,
  PhoneCall,
  Video,
  MoreHorizontal,
  Paperclip,
  Image as ImageIcon,
  Send,
  Plus,
  X,
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
  const [activeTab, setActiveTab] = useState<"All" | "Groups" | "DMs">("All");
  const [showProfile, setShowProfile] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
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

  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    if (activeTab === "Groups") {
      filtered = conversations.filter((c) => c.type === "GROUP");
    } else if (activeTab === "DMs") {
      filtered = conversations.filter((c) => c.type === "DM");
    }

    if (searchQuery) {
      filtered = filtered.filter((c) =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [conversations, activeTab, searchQuery]);

  const activeConversation = conversations.find(
    (c) => c.conversationId === activeConversationId
  );

  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!activeConversationId || !currentUserId || !messageInput.trim()) return;

      try {
        await realSendMessage(messageInput, "TEXT");
        setMessageInput("");
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [activeConversationId, currentUserId, messageInput, realSendMessage]
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
      setNewConvModal({ isOpen: false, name: "", type: "GROUP", participants: "" });
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

      {/* Conversation List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-900">PantherKolab</h1>
            <button
              onClick={() => setNewConvModal({ ...newConvModal, isOpen: true })}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Create new conversation"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex border-b border-gray-200">
            {(["All", "Groups", "DMs"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 pb-2 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => {
            const initials = conversation.name
              ?.substring(0, 3)
              .toUpperCase() || "???";

            return (
              <button
                key={conversation.conversationId}
                onClick={() => handleSelectConversation(conversation.conversationId)}
                className={`w-full p-4 flex items-start space-x-3 hover:bg-gray-50 transition-colors ${
                  activeConversationId === conversation.conversationId
                    ? "bg-blue-50 border-l-4 border-blue-600"
                    : ""
                }`}
              >
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="font-semibold text-gray-900 truncate">
                    {conversation.name}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {conversation.participants?.length || 0} members
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {activeConversation ? (
          <>
            <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  {activeConversation.name?.substring(0, 3).toUpperCase() || "???"}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {activeConversation.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {activeConversation.participants?.length || 0} members
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <PhoneCall className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <Search className="w-5 h-5" />
                </button>
                <button
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  onClick={() => setShowProfile(!showProfile)}
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => {
                const isCurrentUser = message.senderId === currentUserId;
                return (
                  <div
                    key={message.messageId}
                    className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-md ${isCurrentUser ? "flex-row-reverse space-x-reverse" : ""}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${isCurrentUser ? "bg-yellow-500" : "bg-blue-600"}`}>
                        {message.senderId.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className={`px-4 py-2 rounded-2xl ${isCurrentUser ? "bg-blue-600 text-white" : "bg-white text-gray-900"}`}>
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 px-2">
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <button
                  type="submit"
                  className="p-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>

      {/* Right Sidebar - Profile */}
      {showProfile && (
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-100">
              <div className="text-center mb-4">
                <div className="w-full h-64 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg mx-auto mb-3 flex items-center justify-center text-6xl">
                  {user?.username?.[0]?.toUpperCase() || "🐾"}
                </div>

                <div className="flex items-center justify-center space-x-2 mb-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    {user?.username || currentUserId || "User"}
                  </h3>
                </div>
                <div className="flex items-center justify-center space-x-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-green-600 font-medium">
                    Online
                  </span>
                </div>
              </div>

              <div className="flex justify-center space-x-3 pt-2">
                <button className="flex flex-col items-center space-y-1">
                  <div className="w-12 h-12 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-xs text-gray-700 font-medium">
                    Message
                  </span>
                </button>
                <button className="flex flex-col items-center space-y-1">
                  <div className="w-12 h-12 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors">
                    <PhoneCall className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-xs text-gray-700 font-medium">
                    Audio
                  </span>
                </button>
                <button className="flex flex-col items-center space-y-1">
                  <div className="w-12 h-12 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors">
                    <Video className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-xs text-gray-700 font-medium">
                    Video
                  </span>
                </button>
                <button className="flex flex-col items-center space-y-1">
                  <div className="w-12 h-12 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-xs text-gray-700 font-medium">
                    More
                  </span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6">
                <h4 className="text-xs font-bold text-gray-500 mb-2 tracking-wide">
                  STATUS:
                </h4>
                <p className="text-sm text-gray-900">
                  Going to the football game later!
                </p>
              </div>

              <div className="mb-6">
                <h4 className="text-xs font-bold text-gray-500 mb-3 tracking-wide">
                  INFO:
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Username</p>
                    <p className="text-sm text-gray-900 font-medium">
                      {user?.username || currentUserId}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">User ID:</p>
                    <p className="text-sm text-gray-900">{currentUserId}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-yellow-400 my-6"></div>

              <div className="mb-6">
                <h4 className="text-xs font-bold text-gray-500 mb-3 tracking-wide">
                  GROUP IN COMMON
                </h4>
                <div className="space-y-2">
                  {activeConversation && (
                    <div className="text-sm text-gray-900 font-medium pb-2 border-b border-yellow-400">
                      {activeConversation.name}
                    </div>
                  )}
                  <div className="text-sm text-gray-900 font-medium">
                    BSC2010 - Biology 1
                  </div>
                </div>
              </div>

              <div className="border-t border-yellow-400 my-6"></div>

              <div>
                <h4 className="text-xs font-bold text-gray-500 mb-3 tracking-wide">
                  ABOUT ME
                </h4>
                <p className="text-sm text-gray-900 leading-relaxed">
                  FIU Panther 🐾 | Game day energy, all day | Roaring for the
                  team 🧡💙
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  setNewConvModal({ isOpen: false, name: "", type: "GROUP", participants: "" })
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
                    onClick={() => setNewConvModal({ ...newConvModal, type: "GROUP" })}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      newConvModal.type === "GROUP"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Group
                  </button>
                  <button
                    onClick={() => setNewConvModal({ ...newConvModal, type: "DM" })}
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
                    setNewConvModal({ ...newConvModal, participants: e.target.value })
                  }
                  placeholder="user1, user2, user3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() =>
                    setNewConvModal({ isOpen: false, name: "", type: "GROUP", participants: "" })
                  }
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
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
