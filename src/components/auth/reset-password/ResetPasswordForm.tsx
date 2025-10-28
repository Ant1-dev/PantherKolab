'use client'

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as authStyles from '../auth.style';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [formData, setFormData] = useState({
    confirmationCode: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Password validation checks
  const passwordRequirements = {
    minLength: formData.newPassword.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.newPassword),
    hasLowercase: /[a-z]/.test(formData.newPassword),
    hasNumber: /\d/.test(formData.newPassword),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword),
  };

  const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);

  // Password strength calculation
  const getPasswordStrength = () => {
    const metCount = Object.values(passwordRequirements).filter(Boolean).length;
    if (metCount === 0) return { label: "", colorKey: "empty" as const, width: "0%" };
    if (metCount <= 2)
      return { label: "Weak", colorKey: "weak" as const, width: "33%" };
    if (metCount <= 4)
      return { label: "Medium", colorKey: "medium" as const, width: "66%" };
    return { label: "Strong", colorKey: "strong" as const, width: "100%" };
  };

  const passwordStrength = getPasswordStrength();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // For confirmation code, only allow digits and limit to 6 characters
    if (name === 'confirmationCode') {
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length <= 6) {
        setFormData(prev => ({ ...prev, [name]: digitsOnly }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email not found. Please request password reset again.';
    }

    if (formData.confirmationCode.length !== 6) {
      newErrors.confirmationCode = 'Please enter the 6-digit confirmation code';
    }

    if (!allRequirementsMet) {
      newErrors.newPassword = 'Password does not meet all requirements';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // TODO: Implement actual Cognito password reset confirmation
      // await confirmResetPassword({
      //   username: email,
      //   confirmationCode: formData.confirmationCode,
      //   newPassword: formData.newPassword
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // On success, redirect to login
      router.push('/auth/login?reset=success');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrors({ general: err.message || 'Failed to reset password. Please try again.' });
      } else {
        setErrors({ general: 'Failed to reset password. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-[0px_4px_16px_0px_rgba(0,0,0,0.08)] flex flex-col justify-start items-start gap-4">
      {/* Header */}
      <div className="w-full">
        <h1 className="text-sky-900 text-4xl font-bold font-['Bitter']">
          Reset Password
        </h1>
        <p className="mt-2 text-zinc-600 text-base font-semibold font-['Bitter']">
          Enter the code sent to
        </p>
        <p className="mt-1 text-sky-600 text-base font-bold font-['Bitter']">
          {email || 'your email'}
        </p>
      </div>

      {/* General Error */}
      {errors.general && (
        <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm font-semibold">{errors.general}</p>
        </div>
      )}

      {/* Confirmation Code */}
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
          value={formData.confirmationCode}
          onChange={handleChange}
          placeholder="Enter 6-digit code"
          maxLength={6}
          disabled={isLoading}
          className={`w-full h-12 px-4 mt-2 mb-2 bg-white rounded-lg border ${
            errors.confirmationCode ? 'border-red-500' : 'border-gray-200'
          } text-zinc-600 font-semibold font-['Bitter'] focus:outline-none focus:border-sky-600 disabled:bg-gray-100 disabled:cursor-not-allowed ${
            formData.confirmationCode ? 'text-2xl tracking-widest text-center' : 'text-sm text-left'
          }`}
        />
        {errors.confirmationCode && (
          <p className="text-red-500 text-xs mt-1">{errors.confirmationCode}</p>
        )}
      </div>

      {/* New Password */}
      <div className="w-full">
        <label
          htmlFor="newPassword"
          className="text-neutral-800 text-sm font-semibold font-['Bitter']"
        >
          New Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showNewPassword ? "text" : "password"}
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="Enter new password"
            disabled={isLoading}
            className={`w-full h-12 px-4 pr-12 mt-2 mb-2 bg-white rounded-lg border ${
              errors.newPassword ? 'border-red-500' : 'border-gray-200'
            } text-zinc-600 text-sm font-semibold font-['Bitter'] focus:outline-none focus:border-sky-600 disabled:bg-gray-100 disabled:cursor-not-allowed`}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 mt-1 text-gray-500 hover:text-gray-700"
          >
            {showNewPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>

        {/* Password Strength Meter */}
        {formData.newPassword && (
          <div className="mt-2">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{
                  backgroundColor: authStyles.passwordStrength[passwordStrength.colorKey].backgroundColor,
                  width: passwordStrength.width
                }}
              />
            </div>
            {passwordStrength.label && (
              <p
                className="mt-1 text-xs font-semibold"
                style={{ color: authStyles.passwordStrength[passwordStrength.colorKey].color }}
              >
                {passwordStrength.label}
              </p>
            )}
          </div>
        )}

        {/* Password Requirements */}
        <div className="mt-3 space-y-1">
          <RequirementItem met={passwordRequirements.minLength}>
            At least 8 characters
          </RequirementItem>
          <RequirementItem met={passwordRequirements.hasUppercase}>
            Contains uppercase letter
          </RequirementItem>
          <RequirementItem met={passwordRequirements.hasLowercase}>
            Contains lowercase letter
          </RequirementItem>
          <RequirementItem met={passwordRequirements.hasNumber}>
            Contains number
          </RequirementItem>
          <RequirementItem met={passwordRequirements.hasSpecial}>
            Contains special character
          </RequirementItem>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="w-full">
        <label
          htmlFor="confirmPassword"
          className="text-neutral-800 text-sm font-semibold font-['Bitter']"
        >
          Confirm New Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter new password"
            disabled={isLoading}
            className={`w-full h-12 px-4 pr-12 mt-2 mb-2 bg-white rounded-lg border ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
            } text-zinc-600 text-sm font-semibold font-['Bitter'] focus:outline-none focus:border-sky-600 disabled:bg-gray-100 disabled:cursor-not-allowed`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 mt-1 text-gray-500 hover:text-gray-700"
          >
            {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Reset Password Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || formData.confirmationCode.length !== 6 || !allRequirementsMet || formData.newPassword !== formData.confirmPassword}
        className="w-full h-12 bg-yellow-500 rounded-lg flex items-center justify-center text-sky-900 text-base font-semibold font-['Bitter'] hover:bg-yellow-600 transition-colors cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⏳</span>
            Resetting Password...
          </span>
        ) : (
          'Reset Password'
        )}
      </button>

      {/* Back to Login */}
      <div className="w-full text-center">
        <span className="text-neutral-800 text-sm font-semibold font-['Bitter']">
          Remember your password?{' '}
        </span>
        <a
          href="/auth/login"
          className="text-sky-600 text-sm font-semibold font-['Bitter'] hover:underline cursor-pointer"
        >
          Log in
        </a>
      </div>
    </div>
  );
}

// Helper component for password requirements
function RequirementItem({ met, children }: { met: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={met ? 'text-green-500' : 'text-gray-400'}>
        {met ? '✓' : '○'}
      </span>
      <span className={met ? 'text-green-600' : 'text-gray-500'}>
        {children}
      </span>
    </div>
  );
}
