// Database Models for PantherKolab DynamoDB Tables

/**
 * User Profile
 * Table: PantherKolab-Users-{env}
 * Primary Key: userId (Cognito sub)
 */
export interface UserProfile {
  userId: string              // Partition key (Cognito sub)
  email: string              // FIU email address
  firstName: string          // User's first name
  lastName: string           // User's last name
  fullName: string           // Combined full name
  emailVerified: boolean     // Email verification status
  profilePicture: string | null  // S3 URL to profile picture
  major: string | null       // Academic major
  year: AcademicYear | null  // Academic year
  bio: string | null         // Personal bio (max 500 chars)
  interests: string[]        // Array of interests/tags
  portfolioUrl: string | null // Personal portfolio/website
  createdAt: string          // ISO timestamp
  updatedAt: string          // ISO timestamp
}

export type AcademicYear = 'Freshman' | 'Sophomore' | 'Junior' | 'Senior' | 'Graduate'

/**
 * Conversation
 * Table: PantherKolab-Conversations-{env}
 * Primary Key: conversationId
 */
export interface Conversation {
  conversationId: string     // UUID - Partition key
  type: ConversationType     // DM or GROUP
  name: string | null        // Group name (null for DMs)
  description: string | null // Group description
  participants: string[]     // Array of userIds
  admins: string[]          // Array of admin userIds (for groups)
  createdBy: string         // Creator userId
  createdAt: string         // ISO timestamp
  updatedAt: string         // ISO timestamp
  lastMessageAt: string     // ISO timestamp for sorting
  avatar: string | null     // S3 URL for group avatar
}

export type ConversationType = 'DM' | 'GROUP'

/**
 * Message
 * Table: PantherKolab-Messages-{env}
 * Primary Key: conversationId (PK) + timestamp (SK)
 */
export interface Message {
  conversationId: string    // Partition key
  timestamp: string        // Sort key (ISO timestamp)
  messageId: string        // UUID
  senderId: string         // User ID who sent the message
  type: MessageType        // Message content type
  content: string | null   // Text content (for text messages)
  mediaUrl: string | null  // S3 URL for media files
  fileName: string | null  // Original file name
  fileSize: number | null  // File size in bytes
  duration: number | null  // Duration for audio/video (seconds)
  readBy: string[]         // Array of userIds who read the message
  reactions: MessageReactions // emoji -> [userId]
  replyTo: string | null   // messageId being replied to
  deleted: boolean         // Soft delete flag
  createdAt: string        // ISO timestamp (same as timestamp usually)
}

export type MessageType = 'TEXT' | 'AUDIO' | 'IMAGE' | 'VIDEO' | 'FILE'

export type MessageReactions = Record<string, string[]> // emoji -> userIds

/**
 * Group
 * Table: PantherKolab-Groups-{env}
 * Primary Key: groupId
 */
export interface Group {
  groupId: string           // Same as conversationId for groups
  classCode: string | null  // Associated class code (e.g., "COP4520")
  semester: string | null   // Semester (e.g., "Fall 2025")
  isClassGroup: boolean     // Auto-created for classes
  tags: string[]            // Tags for discoverability
  settings: GroupSettings   // Group configuration
  memberCount: number       // Current member count
  createdAt: string
  updatedAt: string
}

export interface GroupSettings {
  isPublic: boolean         // Can anyone join?
  requireApproval: boolean  // Admin approval needed?
  maxMembers: number        // Member limit (0 = unlimited)
}

/**
 * Create User Input (for signup)
 */
export interface CreateUserInput {
  userId: string
  email: string
  firstName: string
  lastName: string
}

/**
 * Update User Input (partial update)
 */
export type UpdateUserInput = Partial<Omit<UserProfile, 'userId' | 'email' | 'createdAt'>>

/**
 * Create Conversation Input
 */
export interface CreateConversationInput {
  type: ConversationType
  name?: string
  description?: string
  participants: string[]
  createdBy: string
  avatar?: string
}

/**
 * Create Message Input
 */
export interface CreateMessageInput {
  conversationId: string
  senderId: string
  type: MessageType
  content?: string
  mediaUrl?: string
  fileName?: string
  fileSize?: number
  duration?: number
  replyTo?: string
}

/**
 * Create Group Input
 */
export interface CreateGroupInput {
  conversationId: string  // Must match an existing conversation
  classCode?: string
  semester?: string
  isClassGroup?: boolean
  tags?: string[]
  settings?: Partial<GroupSettings>
}

/**
 * Database Table Names
 */
export const TABLE_NAMES = {
  USERS: process.env.DYNAMODB_USERS_TABLE || 'PantherKolab-Users-dev',
  CONVERSATIONS: process.env.DYNAMODB_CONVERSATIONS_TABLE || 'PantherKolab-Conversations-dev',
  MESSAGES: process.env.DYNAMODB_MESSAGES_TABLE || 'PantherKolab-Messages-dev',
  GROUPS: process.env.DYNAMODB_GROUPS_TABLE || 'PantherKolab-Groups-dev',
} as const

/**
 * Index Names
 */
export const INDEX_NAMES = {
  USERS: {
    EMAIL: 'EmailIndex',
    MAJOR: 'MajorIndex',
  },
  MESSAGES: {
    MESSAGE_ID: 'MessageIdIndex',
  },
  GROUPS: {
    CLASS_CODE: 'ClassCodeIndex',
  },
} as const
