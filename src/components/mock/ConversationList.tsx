/**
 * Mock ConversationList Component
 *
 * Temporary component for testing message transfer functionality
 * Will be replaced by frontend team's implementation
 */

'use client';

export interface MockConversation {
  conversationId: string;
  name: string;
  type: 'DM' | 'GROUP';
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  avatar?: string;
  participants: string[];
}

interface ConversationListProps {
  conversations: MockConversation[];
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onCreateConversation?: () => void;
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  onCreateConversation,
}: ConversationListProps) {
  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-sky-900">Messages</h2>
          {onCreateConversation && (
            <button
              onClick={onCreateConversation}
              className="w-8 h-8 rounded-full bg-sky-600 text-white hover:bg-sky-700 flex items-center justify-center"
              aria-label="New conversation"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center p-4">
            <div className="text-gray-500">
              <p className="text-4xl mb-2">💭</p>
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Start a new conversation</p>
            </div>
          </div>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.conversationId}
              onClick={() => onSelectConversation(conversation.conversationId)}
              className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                activeConversationId === conversation.conversationId ? 'bg-sky-50' : ''
              }`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-lg">
                  {conversation.type === 'GROUP' ? '👥' : conversation.name.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">{conversation.name}</h3>
                  {conversation.lastMessageTime && (
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {formatTime(conversation.lastMessageTime)}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.lastMessage || 'No messages yet'}
                  </p>
                  {conversation.unreadCount && conversation.unreadCount > 0 && (
                    <span className="ml-2 flex-shrink-0 w-5 h-5 bg-sky-600 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                      {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
