'use client'

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function ConfirmEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [confirmationCode, setConfirmationCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleSubmit = async () => {
    // Clear previous errors
    setError('');

    // Validation
    if (!confirmationCode || confirmationCode.length !== 6) {
      setError('Please enter a valid 6-digit confirmation code');
      return;
    }

    if (!email) {
      setError('Email not found. Please sign up again.');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement actual Cognito confirmation
      // const result = await confirmSignUp({ username: email, confirmationCode });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // On success, redirect to login or dashboard
      router.push('/auth/login?verified=true');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Invalid confirmation code. Please try again.');
      } else {
        setError('Invalid confirmation code. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError('Email not found. Please sign up again.');
      return;
    }

    setIsResending(true);
    setError('');
    setResendSuccess(false);

    try {
      // TODO: Implement actual Cognito resend code
      // await resendSignUpCode({ username: email });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000); // Hide success message after 5s
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to resend code. Please try again.');
      } else {
        setError('Failed to resend code. Please try again.');
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setConfirmationCode(value);
      setError(''); // Clear error on typing
    }
  };

  return (
    <div className="w-96 p-8 bg-white rounded-xl shadow-[0px_4px_16px_0px_rgba(0,0,0,0.08)] flex flex-col justify-start items-start gap-5">
      {/* Header */}
      <div className="w-full">
        <h1 className="text-sky-900 text-4xl font-bold font-['Bitter']">
          Confirm Your Email
        </h1>
        <p className="mt-2 text-zinc-600 text-base font-semibold font-['Bitter']">
          We sent a verification code to
        </p>
        <p className="mt-1 text-sky-600 text-base font-bold font-['Bitter']">
          {email || 'your email'}
        </p>
      </div>

      {/* Confirmation Code Input */}
      <div className="w-full">
        <label
          htmlFor="confirmationCode"
          className="text-neutral-800 text-sm font-semibold font-['Bitter']"
        >
          Confirmation Code <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="confirmationCode"
          name="confirmationCode"
          value={confirmationCode}
          onChange={handleCodeChange}
          placeholder="Enter 6-digit code"
          maxLength={6}
          disabled={isLoading}
          className={`w-full h-12 px-4 mt-2 mb-2 bg-white rounded-lg border ${
            error ? 'border-red-500' : 'border-gray-200'
          } text-zinc-600 text-sm font-semibold font-['Bitter'] text-center tracking-widest text-2xl focus:outline-none focus:border-sky-600 disabled:bg-gray-100 disabled:cursor-not-allowed`}
        />
        {error && (
          <p className="text-red-500 text-xs mt-1">{error}</p>
        )}
        {resendSuccess && (
          <p className="text-green-600 text-xs mt-1">
            ✓ Verification code sent successfully!
          </p>
        )}
      </div>

      {/* Resend Code Link */}
      <div className="w-full">
        <p className="text-zinc-600 text-sm font-semibold font-['Bitter']">
          Didn&apos;t receive the code?{' '}
          <button
            type="button"
            onClick={handleResendCode}
            disabled={isResending || isLoading}
            className="text-sky-600 font-bold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? 'Resending...' : 'Resend Code'}
          </button>
        </p>
      </div>

      {/* Confirm Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || confirmationCode.length !== 6}
        className="w-full h-12 bg-yellow-500 rounded-lg flex items-center justify-center text-sky-900 text-base font-semibold font-['Bitter'] hover:bg-yellow-600 transition-colors cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⏳</span>
            Confirming...
          </span>
        ) : (
          'Confirm Email'
        )}
      </button>

      {/* Back to Login */}
      <div className="w-full text-center">
        <span className="text-neutral-800 text-sm font-semibold font-['Bitter']">
          Wrong email?{' '}
        </span>
        <a
          href="/auth/signup"
          className="text-sky-600 text-sm font-semibold font-['Bitter'] hover:underline cursor-pointer"
        >
          Sign up again
        </a>
      </div>

      {/* Footer */}
      <div className="w-full text-center text-zinc-600 text-xs font-semibold font-['Bitter']">
        Check your spam folder if you don&apos;t see the email
      </div>
    </div>
  );
}