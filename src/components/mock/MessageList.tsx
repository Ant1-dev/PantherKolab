/**
 * Mock MessageList Component
 *
 * Temporary component for testing message transfer functionality
 * Will be replaced by frontend team's implementation
 */

'use client';

import { useEffect, useRef } from 'react';

export interface MockMessage {
  messageId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'TEXT' | 'AUDIO' | 'IMAGE' | 'VIDEO' | 'FILE';
  isCurrentUser: boolean;
}

interface MessageListProps {
  messages: MockMessage[];
  currentUserId: string;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center text-gray-500">
          <p className="text-4xl mb-2">💬</p>
          <p className="text-lg font-semibold">No messages yet</p>
          <p className="text-sm">Send a message to start the conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white p-6 space-y-3">
      {messages.map((message) => (
        <MessageBubble
          key={message.messageId}
          message={message}
          isCurrentUser={message.senderId === currentUserId}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

function MessageBubble({ message, isCurrentUser }: { message: MockMessage; isCurrentUser: boolean }) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Get initials for avatar
  const initials = message.senderName.substring(0, 2).toUpperCase();

  return (
    <div className="flex items-start gap-2">
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold ${
        isCurrentUser ? 'bg-yellow-500' : 'bg-blue-600'
      }`}>
        {initials}
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0">
        {/* Sender name and timestamp */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-bold text-gray-900">{message.senderName}</span>
          <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
        </div>

        {/* Message bubble */}
        <div className="inline-block max-w-full">
          <div className="bg-gray-100 rounded-lg rounded-tl-none px-3 py-2">
            <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">{message.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
