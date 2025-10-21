// services/userService.ts
import { dynamoDb } from "../lib/dynamodb"
import { PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { UserProfile } from "../types/UserProfile"

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'Users'


export const userService = {
  // Create user profile
  async createUser(userData: Partial<UserProfile>) {
    const params = {
      TableName: TABLE_NAME,
      Item: {
        userId: userData.userId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        fullName: `${userData.firstName} ${userData.lastName}`,
        emailVerified: false,
        profilePicture: null,
        major: null,
        year: null,
        bio: null,
        interests: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...userData // Allow any additional fields
      },
    }
    
    await dynamoDb.send(new PutCommand(params))
    return params.Item
  },

  // Get user profile
  async getUser(userId: string) {
    const params = {
      TableName: TABLE_NAME,
      Key: { userId },
    }
    
    const result = await dynamoDb.send(new GetCommand(params))
    return result.Item as UserProfile | undefined
  },

  // Update user profile
  async updateUser(userId: string, updates: Partial<UserProfile>) {
    const updateExpression: string[] = []
    const expressionAttributeNames: Record<string, string> = {}
    const expressionAttributeValues: Record<string, unknown> = {}

    // Build update expression dynamically
    Object.keys(updates).forEach((key, index) => {
      if (key !== 'userId' && key !== 'email') { // Prevent updating userId and email
        updateExpression.push(`#attr${index} = :val${index}`)
        expressionAttributeNames[`#attr${index}`] = key
        expressionAttributeValues[`:val${index}`] = updates[key]
      }
    })

    // Add updatedAt
    updateExpression.push(`#updatedAt = :updatedAt`)
    expressionAttributeNames['#updatedAt'] = 'updatedAt'
    expressionAttributeValues[':updatedAt'] = new Date().toISOString()

    const params = {
      TableName: TABLE_NAME,
      Key: { userId },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW' as const,
    }

    const result = await dynamoDb.send(new UpdateCommand(params))
    return result.Attributes as UserProfile
  },

  // Check if user exists
  async userExists(userId: string): Promise<boolean> {
    const user = await this.getUser(userId)
    return !!user
  },
}