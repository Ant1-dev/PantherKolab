# Mock Components for Testing

This directory contains temporary mock UI components for testing message transfer functionality. These will be **replaced by the frontend team's implementation**.

## ⚠️ Important Note

**DO NOT** use these components in production. They are only for:
- Testing backend message transfer functionality
- Development and debugging
- Demonstrating features to stakeholders

## Components

### 1. MessageList.tsx

Displays a list of messages in a chat interface.

**Props:**
```typescript
interface MessageListProps {
  messages: MockMessage[];
  currentUserId: string;
}

interface MockMessage {
  messageId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'TEXT' | 'AUDIO' | 'IMAGE' | 'VIDEO' | 'FILE';
  isCurrentUser: boolean;
}
```

**Features:**
- Auto-scroll to bottom on new messages
- Different styling for current user vs others
- Timestamp formatting
- Empty state

### 2. MessageInput.tsx

Input field for sending messages.

**Props:**
```typescript
interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}
```

**Features:**
- Textarea with auto-resize
- Send button
- Enter to send, Shift+Enter for new line
- Disabled state for loading

### 3. ConversationList.tsx

Sidebar showing list of conversations.

**Props:**
```typescript
interface ConversationListProps {
  conversations: MockConversation[];
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onCreateConversation?: () => void;
}

interface MockConversation {
  conversationId: string;
  name: string;
  type: 'DM' | 'GROUP';
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  avatar?: string;
  participants: string[];
}
```

**Features:**
- List of conversations with last message preview
- Unread count badges
- Active conversation highlighting
- Create new conversation button
- Empty state

### 4. ChatWindow.tsx

Complete chat interface combining MessageList and MessageInput.

**Props:**
```typescript
interface ChatWindowProps {
  conversationId: string | null;
  conversationName: string;
  messages: MockMessage[];
  currentUserId: string;
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}
```

**Features:**
- Header with conversation name
- Message list
- Message input
- Loading indicator
- Empty state

## Test Page

Access the test page at: `http://localhost:3000/test/messages`

**Location:** `src/app/test/messages/page.tsx`

**Features:**
- Complete messaging interface
- Mock conversations and messages
- Simulated message sending (500ms delay)
- Visual "TEST MODE" indicator

## Usage Example

```tsx
'use client';

import { useState } from 'react';
import { ConversationList } from '@/components/mock/ConversationList';
import { ChatWindow } from '@/components/mock/ChatWindow';

export default function TestPage() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MockMessage[]>([]);

  const handleSendMessage = (content: string) => {
    // Add message logic here
    const newMessage = {
      messageId: Date.now().toString(),
      senderId: 'current-user',
      senderName: 'You',
      content,
      timestamp: new Date().toISOString(),
      type: 'TEXT' as const,
      isCurrentUser: true,
    };
    setMessages([...messages, newMessage]);
  };

  return (
    <div className="h-screen flex">
      <ConversationList
        conversations={mockConversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
      />
      <ChatWindow
        conversationId={activeConversationId}
        conversationName="Test Chat"
        messages={messages}
        currentUserId="current-user"
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
```

## Styling

All components use Tailwind CSS classes compatible with the project's design system:
- Colors: `sky-*` for primary, `gray-*` for neutral
- Rounded corners: `rounded-lg`, `rounded-full`
- Spacing follows standard Tailwind scale
- Responsive: Mobile-first approach

## Testing Real-Time Features

When you implement AppSync subscriptions, you can replace the mock data with real data:

1. **Keep the same component structure**
2. **Replace mock data with real data from AppSync**
3. **Add subscription logic in the test page**
4. **Test with multiple browser tabs**

Example:
```tsx
// Before (mock)
const handleSendMessage = (content: string) => {
  setMessages([...messages, newMessage]);
};

// After (real)
const handleSendMessage = async (content: string) => {
  await API.graphql({
    query: sendMessageMutation,
    variables: { input: { conversationId, content } }
  });
};

// Subscribe to new messages
useEffect(() => {
  const subscription = API.graphql({
    query: onMessageAddedSubscription,
    variables: { conversationId }
  }).subscribe({
    next: ({ value }) => {
      setMessages(prev => [...prev, value.data.onMessageAdded]);
    }
  });

  return () => subscription.unsubscribe();
}, [conversationId]);
```

## Migration Path

When the frontend team is ready:

1. They create real components in `src/components/chat/`
2. Test with the same test page
3. Gradually replace mock components
4. Delete this entire `mock/` directory

## Future Enhancements

These mock components don't include:
- ❌ Read receipts
- ❌ Typing indicators
- ❌ Message reactions
- ❌ File uploads
- ❌ Voice messages
- ❌ Message editing/deletion
- ❌ Search functionality
- ❌ Media previews

These will be added by the frontend team in the real implementation.

## File Structure

```
src/components/mock/
├── README.md                 # This file
├── MessageList.tsx           # Message display component
├── MessageInput.tsx          # Message input component
├── ConversationList.tsx      # Conversation sidebar
└── ChatWindow.tsx            # Complete chat interface

src/app/test/messages/
└── page.tsx                  # Test page
```

## Questions?

For questions about:
- **Mock UI**: Refer to this README
- **Real Implementation**: Ask the frontend team
- **Backend Integration**: See message transfer documentation

---

**Created**: October 28, 2025
**Status**: ✅ Ready for testing
**Lifecycle**: Temporary - Will be replaced
