# Audio/Video Calls Documentation

## Overview

PantherKolab supports real-time audio/video calling using AWS Chime SDK and Socket.IO for signaling. The implementation supports both one-on-one direct calls and group calls within conversations.

---

## Architecture

### Components

1. **Socket.IO Signaling** - Real-time call signaling and presence detection
2. **AWS Chime SDK** - WebRTC infrastructure for audio/video streaming
3. **DynamoDB** - Call metadata and history storage
4. **React Hooks** - `useCall` hook for managing call state
5. **UI Components** - `CallWindow`, `IncomingCallModal`, `CallControls`

### Call Flow

#### Direct Call (One-on-One)

```
1. Caller initiates call
   ├─> Create call record in DynamoDB
   ├─> Check if recipient is online via Socket.IO
   └─> Send "incoming-call" event to recipient

2. Recipient receives incoming call notification
   ├─> Accept: Join Chime meeting
   └─> Reject: Notify caller

3. If accepted:
   ├─> Create Chime meeting
   ├─> Both parties join as attendees
   └─> Establish WebRTC connection

4. During call:
   ├─> Toggle mute/unmute
   ├─> Toggle video on/off
   └─> Add participants (if converting to group call)

5. End call:
   ├─> Delete Chime meeting
   ├─> Update call record with duration
   └─> Notify all participants
```

#### Group Call

```
1. Caller initiates group call from conversation
   ├─> Validate all participants are in conversation
   ├─> Create call record in DynamoDB
   ├─> Check which participants are online
   └─> Send "incoming-call" to all online participants

2. Each participant can:
   ├─> Accept and join the meeting
   ├─> Reject and notify others
   └─> Ignore (auto-reject after timeout)

3. Call proceeds with all accepted participants

Note: Cannot add users outside the group to a group call
```

---

## Database Schema

### Calls Table

```typescript
interface Call {
  sessionId: string; // UUID - Partition key
  timestamp: string; // ISO timestamp - Sort key
  chimeMeetingId: string; // AWS Chime Meeting ID
  conversationId: string | null; // Null for direct calls
  callType: "DIRECT" | "GROUP";
  initiatedBy: string; // User ID
  participants: CallParticipant[];
  status: "RINGING" | "ACTIVE" | "ENDED" | "MISSED" | "REJECTED";
  startedAt: string | null; // ISO timestamp
  endedAt: string | null; // ISO timestamp
  createdAt: string; // ISO timestamp
  duration: number | null; // Seconds
}

interface CallParticipant {
  userId: string;
  attendeeId: string | null; // Chime Attendee ID
  joinedAt: string | null;
  leftAt: string | null;
  status: "RINGING" | "JOINED" | "LEFT" | "REJECTED";
}
```

### Create Table (DynamoDB)

```bash
aws dynamodb create-table \
  --table-name PantherKolab-CallSessions-dev \
  --attribute-definitions \
    AttributeName=sessionId,AttributeType=S \
    AttributeName=timestamp,AttributeType=S \
  --key-schema \
    AttributeName=sessionId,KeyType=HASH \
    AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

---

## Socket.IO Events

### Client → Server

#### `call-user`

Initiate a call to specific users.

```typescript
socket.emit('call-user', {
  sessionId: string
  recipientIds: string[]
  callType: 'DIRECT' | 'GROUP'
  conversationId?: string
}, (response) => {
  // response.onlineRecipients: string[]
  // response.offlineRecipients: string[]
})
```

#### `accept-call`

Accept an incoming call.

```typescript
socket.emit('accept-call', {
  sessionId: string
  callerId: string
})
```

#### `reject-call`

Reject an incoming call.

```typescript
socket.emit('reject-call', {
  sessionId: string
  callerId: string
})
```

#### `end-call`

End an active call.

```typescript
socket.emit('end-call', {
  sessionId: string
  participantIds: string[]
})
```

### Server → Client

#### `incoming-call`

Notification of an incoming call.

```typescript
socket.on("incoming-call", (data) => {
  // data.sessionId: string
  // data.callerId: string
  // data.callerName: string
  // data.callType: 'DIRECT' | 'GROUP'
  // data.conversationId?: string
});
```

#### `call-accepted`

Notification that someone accepted the call.

```typescript
socket.on("call-accepted", (data) => {
  // data.sessionId: string
  // data.acceptedBy: string
});
```

#### `call-rejected`

Notification that someone rejected the call.

```typescript
socket.on("call-rejected", (data) => {
  // data.sessionId: string
  // data.rejectedBy: string
});
```

#### `call-ended`

Notification that the call has ended.

```typescript
socket.on("call-ended", (data) => {
  // data.sessionId: string
  // data.endedBy: string
});
```

---

## API Endpoints

### POST /api/calls/initiate

Create a call record and return call details.

**Request Body:**

```json
{
  "callType": "DIRECT" | "GROUP",
  "initiatedBy": "user-id",
  "participantIds": ["user-id-1", "user-id-2"],
  "conversationId": "conv-id" // Required for GROUP calls
}
```

**Response:**

```json
{
  "success": true,
  "call": {
    "sessionId": "uuid",
    "callType": "DIRECT",
    "initiatedBy": "user-id",
    "participants": [...],
    "status": "RINGING",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

### POST /api/calls/meeting

Manage Chime meetings.

**Actions:**

#### CREATE_MEETING

```json
{
  "action": "CREATE_MEETING",
  "sessionId": "call-uuid",
  "userId": "user-id",
  "userName": "John Doe"
}
```

#### JOIN_MEETING

```json
{
  "action": "JOIN_MEETING",
  "sessionId": "call-uuid",
  "userId": "user-id",
  "userName": "Jane Smith"
}
```

#### LEAVE_MEETING

```json
{
  "action": "LEAVE_MEETING",
  "meetingId": "chime-meeting-id",
  "attendeeId": "chime-attendee-id",
  "sessionId": "call-uuid",
  "userId": "user-id"
}
```

#### END_MEETING

```json
{
  "action": "END_MEETING",
  "sessionId": "call-uuid"
}
```

---

## Usage Examples

### useCall Hook

```tsx
import { useCall } from "@/hooks/useCall";
import { IncomingCallModal } from "@/components/calls/IncomingCallModal";
import { CallWindow } from "@/components/calls/CallWindow";

function MyComponent() {
  const {
    currentCall,
    incomingCall,
    isInCall,
    isMuted,
    isVideoEnabled,
    participants,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
  } = useCall({
    onIncomingCall: (call) => {
      console.log("Incoming call from:", call.callerName);
    },
    onCallEnded: () => {
      console.log("Call ended");
    },
  });

  // Initiate a direct call
  const handleCallUser = async (userId: string) => {
    try {
      const result = await initiateCall([userId], "DIRECT");
      console.log("Call initiated:", result);
    } catch (error) {
      console.error("Failed to initiate call:", error);
    }
  };

  // Initiate a group call
  const handleCallGroup = async (conversationId: string, userIds: string[]) => {
    try {
      const result = await initiateCall(userIds, "GROUP", conversationId);
      console.log("Group call initiated:", result);
    } catch (error) {
      console.error("Failed to initiate group call:", error);
    }
  };

  return (
    <>
      {/* Show incoming call modal */}
      {incomingCall && (
        <IncomingCallModal
          callerName={incomingCall.callerName}
          callType={incomingCall.callType}
          onAccept={acceptCall}
          onReject={rejectCall}
        />
      )}

      {/* Show call window when in call */}
      {isInCall && (
        <CallWindow
          participants={participants}
          isMuted={isMuted}
          isVideoEnabled={isVideoEnabled}
          onToggleMute={toggleMute}
          onToggleVideo={toggleVideo}
          onEndCall={endCall}
        />
      )}

      {/* Your UI */}
      <button onClick={() => handleCallUser("some-user-id")}>Call User</button>
    </>
  );
}
```

---

## Environment Variables

Add to `.env.local`:

```bash
# AWS Chime Configuration
AWS_CHIME_REGION=us-east-1

# DynamoDB Calls Table
DYNAMODB_CALLS_TABLE=PantherKolab-CallSessions-dev
```

---

## Security Considerations

1. **Online Status Check**

   - Socket.IO checks if recipient is connected before ringing
   - Prevents unnecessary call notifications to offline users

2. **Group Call Validation**

   - Server validates all participants are members of the conversation
   - Cannot add users outside the group

3. **Authentication**

   - All Socket.IO connections require JWT authentication
   - Chime meeting API calls validate user permissions

4. **Call History**
   - All calls stored in DynamoDB with timestamps and participants
   - Can implement call logs and analytics

---

## Troubleshooting

### Call doesn't ring for recipient

- Check if recipient is connected to Socket.IO
- Verify JWT token is valid
- Check browser console for errors

### Video/audio not working

- Ensure browser has permissions for camera/microphone
- Check if AWS Chime region is correct
- Verify Chime SDK is properly initialized

### Group call validation error

- Ensure all participants are members of the conversation
- Check conversationId is provided for GROUP calls

---

## Future Enhancements

1. **Screen Sharing** - Add screen sharing capability
2. **Call Recording** - Record calls to S3
3. **Call History UI** - Show past calls in conversation
4. **Push Notifications** - Notify offline users of missed calls
5. **Call Quality Stats** - Display network quality indicators
6. **Background Blur** - Virtual background support
7. **Reactions** - Add emoji reactions during calls
8. **Waiting Room** - Hold participants before joining group calls

---

## References

- [AWS Chime SDK Documentation](https://docs.aws.amazon.com/chime-sdk/latest/dg/what-is-chime-sdk.html)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [WebRTC Best Practices](https://webrtc.org/getting-started/peer-connections)
