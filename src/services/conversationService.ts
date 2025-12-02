import { dynamoDb } from "@/lib/dynamodb";
import {
  PutCommand,
  GetCommand,
  UpdateCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { TABLE_NAMES, type Conversation } from "@/types/database";
import { userService } from "./userService";

interface CreateConversationInput {
  type: "DM" | "GROUP";
  name?: string;
  description?: string;
  participants: string[];
  createdBy: string;
  avatar?: string;
}

export const conversationService = {
  async createConversation(
    input: CreateConversationInput,
    conversationId?: string
  ): Promise<Conversation> {
    const now = new Date().toISOString();

    const conversation: Conversation = {
      conversationId: conversationId || crypto.randomUUID(),
      type: input.type,
      name: input.name || "anon",
      description: input.description || null,
      participants: input.participants,
      admins: input.type === "GROUP" ? [input.createdBy] : [], // Creator is admin for groups
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
      lastMessageAt: now,
      avatar: input.avatar || null,
    };

    console.log("Creating conversation:", conversation);

    await dynamoDb.send(
      new PutCommand({
        TableName: TABLE_NAMES.CONVERSATIONS,
        Item: conversation,
      })
    );
    console.log("Conversation successfully saved to DynamoDB");

    return conversation;
  },

  async getConversation(conversationId: string): Promise<Conversation | null> {
    console.log("Fetching conversation with ID:", conversationId);

    const result = await dynamoDb.send(
      new GetCommand({
        TableName: TABLE_NAMES.CONVERSATIONS,
        Key: { conversationId },
      })
    );

    console.log("Fetched conversation:", result.Item);

    return (result.Item as Conversation) || null;
  },

  async listConversations(userId: string): Promise<Conversation[]> {
    console.log("Listing conversations for userId:", userId);

    const result = await dynamoDb.send(
      new ScanCommand({
        TableName: TABLE_NAMES.CONVERSATIONS,
        FilterExpression: "contains(participants, :userId)",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      })
    );

    const conversations = (result.Items as Conversation[]) || [];

    // Map over conversations to enrich DM names
    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        if (conv.type === "DM") {
          const otherUserId = conv.participants.find((p) => p !== userId);
          if (otherUserId) {
            const otherUser = await userService.getUser(otherUserId);
            if (otherUser) {
              conv.name = `${otherUser.firstName} ${otherUser.lastName}`;
            }
          }
        }
        return conv;
      })
    );

    console.log(
      "Total conversations found:",
      enrichedConversations.length || 0
    );

    return enrichedConversations;
  },

  async updateLastMessage(
    conversationId: string,
    timestamp: string
  ): Promise<void> {
    console.log(
      "Updating last message for conversation:",
      conversationId,
      "to",
      timestamp
    );

    await dynamoDb.send(
      new UpdateCommand({
        TableName: TABLE_NAMES.CONVERSATIONS,
        Key: { conversationId },
        UpdateExpression: "SET lastMessageAt = :timestamp, updatedAt = :now",
        ExpressionAttributeValues: {
          ":timestamp": timestamp,
          ":now": new Date().toISOString(),
        },
      })
    );

    console.log("Last message updated successfully");
  },

  /**
   * Find an existing DM conversation between two users, or create a new one
   */
  async findOrCreateDM(
    userId1: string,
    userId2: string,
    userName: string
  ): Promise<Conversation> {
    console.log("Finding or creating DM between:", userId1, "and", userId2);

    // Create a deterministic conversationId for DMs
    const sortedIds = [userId1, userId2].sort();
    const dmConversationId = `dm_${sortedIds[0]}_${sortedIds[1]}`;

    // 1. Try to get conversation directly
    const existingDM = await this.getConversation(dmConversationId);

    if (existingDM) {
      console.log("Found existing DM:", existingDM.conversationId);
      return existingDM;
    }

    // 2. Create new DM conversation if it doesn't exist
    console.log("Creating new DM conversation with deterministic ID");
    const newConversation = await this.createConversation(
      {
        type: "DM",
        name: userName, // Name of the other user
        participants: [userId1, userId2],
        createdBy: userId1,
      },
      dmConversationId // Pass the deterministic ID
    );

    return newConversation;
  },

  async createGroupConversation(
    name: string,
    participantIds: string[],
    createdBy: string
  ): Promise<Conversation> {
    console.log(`Creating group conversation "${name}" by ${createdBy}`);

    // Ensure the creator is included in the participants list
    const finalParticipants = Array.from(new Set([...participantIds, createdBy]));

    const newConversation = await this.createConversation({
      type: "GROUP",
      name: name,
      participants: finalParticipants,
      createdBy: createdBy,
    });

    return newConversation;
  },
};
