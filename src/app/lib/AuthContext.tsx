/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { 
  signIn, 
  signOut, 
  signUp,
  confirmSignUp,
  getCurrentUser, 
  fetchAuthSession, 
  SignInOutput, 
  resendSignUpCode, 
  AuthUser
} from 'aws-amplify/auth'
import { AuthContextType, VerifyParams, SignUpParams } from '../types/AuthContextTypes'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [resending, setResending] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      setIsAuthenticated(true)
    } catch {
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setError('')
    setLoading(true)
    try {
      const result: SignInOutput = await signIn({
        username: email,
        password: password,
      })
      if (result.isSignedIn) {
        await checkAuth()
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const register = async ({ name, email, password, ...additionalAttributes }: SignUpParams) => {
    setError('')
    setLoading(true)
    try {
      const result = await signUp({
        username: email,
        password: password,
        options: {
          userAttributes: {
            email: email,
            name: name,
            ...additionalAttributes,
          },
        },
      })

      if (result.userId) {
        await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: result.userId,
            email: email,
            firstName: name,
            lastName: additionalAttributes.family_name || '',
          }),
        })
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Registration failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const verify = async ({ email, code }: VerifyParams) => {
    setError('')
    setLoading(true)
    try {
      await confirmSignUp({
        username: email,
        confirmationCode: code,
      })
    } catch (err: any) {
      const errorMessage = err.message || 'Verification failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const resendVerificationCode = async (email: string) => {
    setError('')
    setResending(true)
    try {
      await resendSignUpCode({
        username: email,
      })
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to resend code'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setResending(false)
    }
  }

  const logout = async () => {
    try {
      await signOut()
      setIsAuthenticated(false)
      setUser(null)
    } catch (err: any) {
      const errorMessage = err.message || 'Logout failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const getAccessToken = async () => {
    try {
      const session = await fetchAuthSession()
      return session.tokens?.accessToken?.toString() || null
    } catch {
      return null
    }
  }

  const clearError = () => {
    setError('')
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      loading,
      user,
      error,
      resending,
      login,
      logout,
      register,
      verify,
      resendVerificationCode,
      getAccessToken,
      setError,
      clearError,
      checkAuth,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}