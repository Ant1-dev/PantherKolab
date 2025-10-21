import { AuthUser } from "aws-amplify/auth"

export interface SignUpParams {
  name: string
  email: string
  password: string
  [key: string]: string // Allow additional attributes
}

export interface VerifyParams {
  email: string
  code: string
}

export interface AuthContextType {
  // State for checks
  isAuthenticated: boolean
  user: AuthUser | null
  loading: boolean
  error: string
  resending: boolean
  
  // Methods
  //log the user in
  login: (email: string, password: string) => Promise<void>
  // log the user out
  logout: () => Promise<void>
  // create account
  register: (params: SignUpParams) => Promise<void>
  // Verify email code 
  verify: (params: VerifyParams) => Promise<void>
  // resend the verification code
  resendVerificationCode: (email: string) => Promise<void>
  // jwt token for api calls
  getAccessToken: () => Promise<string | null>
  // create an error message
  setError: (error: string) => void
  // clear error message
  clearError: () => void
  // re-check if the user is logged in
  checkAuth: () => Promise<void>
}