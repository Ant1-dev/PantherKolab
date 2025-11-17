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
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <p className="text-4xl mb-2">💬</p>
          <p className="text-lg font-semibold">No messages yet</p>
          <p className="text-sm">Send a message to start the conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
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

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Sender name (only for other users) */}
        {!isCurrentUser && (
          <span className="text-xs text-gray-600 mb-1 ml-3">{message.senderName}</span>
        )}

        {/* Message bubble */}
        <div
          className={`rounded-2xl px-4 py-2 ${
            isCurrentUser
              ? 'bg-sky-600 text-white rounded-br-sm'
              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {/* Timestamp */}
        <span className={`text-xs text-gray-500 mt-1 ${isCurrentUser ? 'mr-3' : 'ml-3'}`}>
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}
