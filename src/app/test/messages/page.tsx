/**
 * Messages Test Page
 *
 * This page provides a complete UI for testing message transfer functionality
 * Uses real hooks and Socket.IO for real-time messaging
 *
 * Access at: http://localhost:3000/test/messages
 */

'use client';

import { useCallback, useMemo } from 'react';
import { ConversationList, type MockConversation } from '@/components/mock/ConversationList';
import { ChatWindow } from '@/components/mock/ChatWindow';
import type { MockMessage } from '@/components/mock/MessageList';
import { useConversations } from '@/hooks/useConversations';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/components/contexts/AuthContext';
import type { Message, Conversation } from '@/types/database';

/**
 * Convert Conversation (database type) to MockConversation (UI type)
 */
function convertConversation(conv: Conversation, currentUserId: string): MockConversation {
  return {
    conversationId: conv.conversationId,
    name: conv.name || 'Unnamed Conversation',
    type: conv.type === 'GROUP' ? 'GROUP' : 'DM',
    lastMessage: undefined, // TODO: Get from API response or calculate from last message
    lastMessageTime: conv.lastMessageAt || undefined,
    unreadCount: 0, // TODO: Calculate unread count from messages
    participants: conv.participants,
    avatar: conv.avatar || undefined,
  };
}

/**
 * Convert Message (database type) to MockMessage (UI type)
 */
function convertMessage(message: Message, currentUserId: string): MockMessage {
  // Message.timestamp is always a string (ISO timestamp)
  const timestamp = message.timestamp || new Date().toISOString();

  return {
    messageId: message.messageId,
    senderId: message.senderId,
    senderName: message.senderId === currentUserId ? 'You' : message.senderId, // TODO: Get actual user name
    content: message.content || '',
    timestamp,
    type: message.type,
    isCurrentUser: message.senderId === currentUserId,
  };
}

export default function MessagesTestPage() {
  const { user } = useAuth();
  const currentUserId = user?.userId || '';

  const {
    conversations: realConversations,
    loading: conversationsLoading,
    activeConversationId,
    selectConversation,
    createConversation,
  } = useConversations();

  const {
    messages: realMessages,
    loading: messagesLoading,
    error: messagesError,
    sendMessage: realSendMessage,
  } = useMessages({
    conversationId: activeConversationId,
    currentUserId,
  });

  const conversations: MockConversation[] = useMemo(
    () => realConversations.map((conv) => convertConversation(conv, currentUserId)),
    [realConversations, currentUserId]
  );

  const messages: MockMessage[] = useMemo(
    () => realMessages.map((msg) => convertMessage(msg, currentUserId)),
    [realMessages, currentUserId]
  );

  // Get active conversation
  const activeConversation = conversations.find(
    (conv) => conv.conversationId === activeConversationId
  );

  // Handle sending a message
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!activeConversationId || !currentUserId) return;

      try {
        await realSendMessage(content, 'TEXT');
      } catch (error) {
        console.error('Failed to send message:', error);
        // Error is already handled in the hook
      }
    },
    [activeConversationId, currentUserId, realSendMessage]
  );

  // Handle selecting a conversation
  const handleSelectConversation = useCallback(
    (conversationId: string) => {
      selectConversation(conversationId);
    },
    [selectConversation]
  );

  // Handle creating a new conversation
  const handleCreateConversation = useCallback(() => {
    // TODO: Implement create conversation UI/modal
    alert('Create conversation feature coming soon!');
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-sky-900 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">PantherKolab Messages</h1>
            <p className="text-sky-200 text-sm">Real-time messaging with Socket.IO</p>
          </div>
          <div className="flex items-center gap-3">
            {(conversationsLoading || messagesLoading) && (
              <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold text-sm">
                Loading...
              </div>
            )}
            {messagesError && (
              <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold text-sm">
                Error: {messagesError.message}
              </div>
            )}

          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversation list */}
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onCreateConversation={handleCreateConversation}
        />

        {/* Chat window */}
        <ChatWindow
          conversationId={activeConversationId}
          conversationName={activeConversation?.name || ''}
          messages={messages}
          currentUserId={currentUserId}
          onSendMessage={handleSendMessage}
          isLoading={messagesLoading}
        />
      </div>


    </div>
  );
}
