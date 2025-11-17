/**
 * Mock MessageInput Component
 *
 * Temporary component for testing message transfer functionality
 * Will be replaced by frontend team's implementation
 */

'use client';

import { useState, KeyboardEvent } from 'react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSendMessage,
  disabled = false,
  placeholder = 'Type a message...',
}: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed && !disabled) {
      onSendMessage(trimmed);
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="flex items-end gap-2">
        {/* Message input */}
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            className="w-full px-4 py-3 bg-gray-100 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-gray-200 disabled:cursor-not-allowed text-sm"
            style={{
              minHeight: '48px',
              maxHeight: '120px',
            }}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="flex-shrink-0 w-12 h-12 rounded-full bg-sky-600 text-white hover:bg-sky-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          aria-label="Send message"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
            />
          </svg>
        </button>
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-500 mt-2 ml-4">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
}
