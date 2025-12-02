"use client";

import { useState, useRef } from "react";
import { MessageSquare, Phone, Settings, User, Menu } from "lucide-react";
import { useAuth } from "@/components/contexts/AuthContext";
import { useChat } from "@/hooks/useChat";
import { getRecentUsers } from "@/components/chat/utils/conversationUtils";
import { getProfileData } from "@/components/chat/utils/profileUtils";
import ConversationList from "@/components/chat/conversationList";
import MainChatArea, {
  type MainChatAreaRef,
} from "@/components/chat/mainChatArea";
import ProfileSidebar from "@/components/chat/profilesidebar";

/**
 * Production Chat Page
 * Integrates real-time messaging with AppSync Events and DynamoDB
 */
export default function ChatPage() {
  const auth = useAuth();
  const currentUserId = auth.user?.userId || "";
  const mainChatAreaRef = useRef<MainChatAreaRef>(null);

  const {
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
  } = useChat(currentUserId);

  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const profileData = getProfileData(selectedConversation, currentUserId);

  const handleFocusMessageInput = () => {
    mainChatAreaRef.current?.focusInput();
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
    <div className="h-screen w-screen flex bg-white font-sans overflow-hidden">
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
          recentUsers={getRecentUsers(conversations, currentUserId)}
          onSelectUser={handleSelectUser}
          onCreateGroup={handleCreateGroup}
        />
      )}

      {/* Main Chat Area Component */}
      <MainChatArea
        ref={mainChatAreaRef}
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
      <ProfileSidebar
        profileData={profileData}
        isVisible={showProfile}
        onMessageClick={handleFocusMessageInput}
      />
    </div>
  );
}