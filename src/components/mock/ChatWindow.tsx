/**
 * Mock ChatWindow Component
 *
 * Temporary component for testing message transfer functionality
 * Will be replaced by frontend team's implementation
 *
 * Combines MessageList and MessageInput into a complete chat interface
 */

'use client';

import { MessageList, type MockMessage } from './MessageList';
import { MessageInput } from './MessageInput';

interface ChatWindowProps {
  conversationId: string | null;
  conversationName: string;
  messages: MockMessage[];
  currentUserId: string;
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

export function ChatWindow({
  conversationId,
  conversationName,
  messages,
  currentUserId,
  onSendMessage,
  isLoading = false,
}: ChatWindowProps) {
  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <p className="text-6xl mb-4">💬</p>
          <h2 className="text-2xl font-bold mb-2">PantherKolab Messages</h2>
          <p className="text-lg">Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-sky-900">{conversationName}</h2>
            <p className="text-sm text-gray-600">
              {messages.length} {messages.length === 1 ? 'message' : 'messages'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Search messages"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-gray-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="More options"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-gray-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-2">
          <p className="text-sm text-yellow-800 flex items-center gap-2">
            <span className="animate-spin">⏳</span>
            Loading messages...
          </p>
        </div>
      )}

      {/* Messages */}
      <MessageList messages={messages} currentUserId={currentUserId} />

      {/* Input */}
      <MessageInput onSendMessage={onSendMessage} disabled={isLoading} />
    </div>
  );
}
