'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/contexts/AuthContext'

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  
  const { verify, resendVerificationCode, error, loading, resending, setError } = useAuth()
  
  const [code, setCode] = useState('')
  const [success, setSuccess] = useState('')

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await verify({ email, code })
      setSuccess('Email verified! Redirecting to login...')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: unknown) {
      // Error is already set in context
      console.error('Verification error:', err)
    }
  }

  const handleResendCode = async () => {
    setError('')
    setSuccess('')
    
    try {
      await resendVerificationCode(email)
      setSuccess('Verification code resent to your email')
    } catch (err: unknown) {
      // Error is already set in context
      console.error('Resend error:', err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We sent a verification code to <span className="font-medium">{email}</span>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
          <div>
            <label htmlFor="code" className="sr-only">
              Verification Code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter 6-digit code"
              maxLength={6}
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resending}
              className="text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50"
            >
              {resending ? 'Resending...' : "Didn't receive the code? Resend"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}