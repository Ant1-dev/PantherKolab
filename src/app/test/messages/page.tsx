/**
 * Mock Messages Test Page
 *
 * This page provides a complete UI for testing message transfer functionality
 * Uses mock components that will be replaced by the frontend team
 *
 * Access at: http://localhost:3000/test/messages
 */

'use client';

import { useState, useCallback } from 'react';
import { ConversationList, type MockConversation } from '@/components/mock/ConversationList';
import { ChatWindow } from '@/components/mock/ChatWindow';
import type { MockMessage } from '@/components/mock/MessageList';

// Mock data - will be replaced with real data from AWS
const MOCK_CONVERSATIONS: MockConversation[] = [
  {
    conversationId: 'conv-1',
    name: 'John Doe',
    type: 'DM',
    lastMessage: 'Hey, did you finish the project?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min ago
    unreadCount: 2,
    participants: ['user-1', 'user-2'],
  },
  {
    conversationId: 'conv-2',
    name: 'COP4520 Study Group',
    type: 'GROUP',
    lastMessage: 'Meeting at 3pm today',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    unreadCount: 0,
    participants: ['user-1', 'user-3', 'user-4', 'user-5'],
  },
  {
    conversationId: 'conv-3',
    name: 'Jane Smith',
    type: 'DM',
    lastMessage: 'Thanks for your help!',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    unreadCount: 0,
    participants: ['user-1', 'user-3'],
  },
];

const MOCK_MESSAGES: Record<string, MockMessage[]> = {
  'conv-1': [
    {
      messageId: 'msg-1',
      senderId: 'user-2',
      senderName: 'John Doe',
      content: 'Hey! How are you doing?',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      type: 'TEXT',
      isCurrentUser: false,
    },
    {
      messageId: 'msg-2',
      senderId: 'user-1',
      senderName: 'You',
      content: 'I\'m good! Working on the Kolab project.',
      timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
      type: 'TEXT',
      isCurrentUser: true,
    },
    {
      messageId: 'msg-3',
      senderId: 'user-2',
      senderName: 'John Doe',
      content: 'Nice! Hey, did you finish the project?',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      type: 'TEXT',
      isCurrentUser: false,
    },
  ],
  'conv-2': [
    {
      messageId: 'msg-4',
      senderId: 'user-3',
      senderName: 'Alice Johnson',
      content: 'Anyone available for a study session?',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      type: 'TEXT',
      isCurrentUser: false,
    },
    {
      messageId: 'msg-5',
      senderId: 'user-1',
      senderName: 'You',
      content: 'I can join! What time?',
      timestamp: new Date(Date.now() - 1000 * 60 * 118).toISOString(),
      type: 'TEXT',
      isCurrentUser: true,
    },
    {
      messageId: 'msg-6',
      senderId: 'user-4',
      senderName: 'Bob Martinez',
      content: 'Meeting at 3pm today. Library 2nd floor.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      type: 'TEXT',
      isCurrentUser: false,
    },
  ],
  'conv-3': [
    {
      messageId: 'msg-7',
      senderId: 'user-3',
      senderName: 'Jane Smith',
      content: 'Thanks for your help with the assignment!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      type: 'TEXT',
      isCurrentUser: false,
    },
    {
      messageId: 'msg-8',
      senderId: 'user-1',
      senderName: 'You',
      content: 'No problem! Happy to help 😊',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
      type: 'TEXT',
      isCurrentUser: true,
    },
  ],
};

const CURRENT_USER_ID = 'user-1';

export default function MessagesTestPage() {
  const [conversations] = useState<MockConversation[]>(MOCK_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState<string | null>('conv-1');
  const [messages, setMessages] = useState<Record<string, MockMessage[]>>(MOCK_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);

  // Get active conversation
  const activeConversation = conversations.find(
    (conv) => conv.conversationId === activeConversationId
  );

  // Get messages for active conversation
  const activeMessages = activeConversationId ? messages[activeConversationId] || [] : [];

  // Handle sending a message
  const handleSendMessage = useCallback(
    (content: string) => {
      if (!activeConversationId) return;

      // Simulate sending message (will be replaced with real API call)
      setIsLoading(true);

      const newMessage: MockMessage = {
        messageId: `msg-${Date.now()}`,
        senderId: CURRENT_USER_ID,
        senderName: 'You',
        content,
        timestamp: new Date().toISOString(),
        type: 'TEXT',
        isCurrentUser: true,
      };

      // Add message after short delay (simulating network)
      setTimeout(() => {
        setMessages((prev) => ({
          ...prev,
          [activeConversationId]: [...(prev[activeConversationId] || []), newMessage],
        }));
        setIsLoading(false);
      }, 500);
    },
    [activeConversationId]
  );

  // Handle selecting a conversation
  const handleSelectConversation = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId);
  }, []);

  // Handle creating a new conversation
  const handleCreateConversation = useCallback(() => {
    alert('Create conversation feature coming soon!');
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-sky-900 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">PantherKolab Messages</h1>
            <p className="text-sky-200 text-sm">Mock UI for Testing Message Transfer</p>
          </div>
          <div className="bg-yellow-500 text-sky-900 px-4 py-2 rounded-lg font-semibold text-sm">
            TEST MODE
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
          messages={activeMessages}
          currentUserId={CURRENT_USER_ID}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>

      {/* Footer note */}
      <footer className="bg-yellow-50 border-t border-yellow-200 px-6 py-3">
        <p className="text-sm text-yellow-800 text-center">
          ⚠️ This is a temporary mock UI for testing. Real implementation will come from the frontend team.
        </p>
      </footer>
    </div>
  );
}
