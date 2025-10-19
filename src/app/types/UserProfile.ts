export interface UserProfile {
  userId: string
  email: string
  firstName: string
  lastName: string
  createdAt: string
  updatedAt: string
  [key: string]: unknown
}