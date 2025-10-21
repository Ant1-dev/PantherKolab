# Authentication Documentation

## Overview
AWS Amplify + Cognito for auth, DynamoDB for user profiles. All auth logic is in `AuthContext`.

---

## Quick Setup

### 1. Install Dependencies
```bash
npm install aws-amplify @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

### 2. Environment Variables (`.env.local`)
```bash
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your_pool_id
NEXT_PUBLIC_COGNITO_CLIENT_ID=your_client_id
NEXT_PUBLIC_AWS_REGION=your_region
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your_key
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your_secret
DYNAMODB_TABLE_NAME=Users
```

### 3. Wrap App with AuthProvider
```typescript
// app/layout.tsx
import { AuthProvider } from '@/lib/AuthContext'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
```

---

## Using Auth in Components
```typescript
'use client'
import { useAuth } from '@/lib/AuthContext'

export default function MyComponent() {
  const { 
    isAuthenticated,  // boolean
    user,             // user object
    loading,          // boolean
    error,            // string
    login,            // function
    logout,           // function
    register          // function
  } = useAuth()
    // Not all is required ex: {login, logout} = useAuth()
  return (
    <div>
      {isAuthenticated ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <button onClick={() => login('email', 'pass')}>Login</button>
      )}
    </div>
  )
}
```

---

## Protecting Routes
```typescript
import ProtectedRoute from '@/components/ProtectedRoute'

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  )
}
```

---

## Available Functions
```typescript
// Login
await login(email, password)

// Register (creates Cognito user + DynamoDB profile)
await register({ name, email, password })

// Verify email
await verify({ email, code })

// Resend verification code
await resendVerificationCode(email)

// Logout
await logout()

// Get access token for API calls
const token = await getAccessToken()
```

---

## API Endpoints

### `POST /api/auth/signup`
Creates user profile in DynamoDB after Cognito signup.

**Request Body:**
```json
{
  "userId": "cognito-sub",
  "email": "user@email.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:** `201 Created`
```json
{
  "message": "User profile created successfully",
  "user": {
    "userId": "cognito-sub",
    "email": "user@email.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "emailVerified": false,
    "profilePicture": null,
    "major": null,
    "year": null,
    "bio": null,
    "interests": [],
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Missing required fields (userId, email, firstName, lastName)
- `409` - User already exists
- `500` - Internal server error

### `GET /api/users/:userId`
Get user profile (must be authenticated).

### `PUT /api/users/:userId`
Update user profile (must be authenticated, can only update own profile).

---

## File Structure
```
lib/
├── AuthContext.tsx       # All auth logic
├── amplify-config.ts     # Amplify config
└── dynamodb.ts           # DynamoDB client

components/
└── ProtectedRoute.tsx    # Route protection wrapper

services/
└── userService.ts        # DynamoDB operations

app/api/
├── auth/signup/route.ts  # Create user in DB
└── users/[userId]/route.ts  # Get/Update user
```

---

## Common Errors

- **"User is not authenticated"** - User needs to login
- **"NotAuthorizedException"** - Wrong password
- **"UserNotConfirmedException"** - Email not verified yet
- **"UsernameExistsException"** - Email already registered

---

## Testing

**Test API directly (Postman):**
```
POST http://localhost:3000/api/auth/signup
GET http://localhost:3000/api/users/:userId
PUT http://localhost:3000/api/users/:userId
```

**Test full flow:**
1. Register at `/auth/register`
2. Verify email at `/auth/verify`
3. Login at `/auth/login`
4. Access protected routes