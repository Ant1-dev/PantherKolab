"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/contexts/AuthContext";

export function ConfirmEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [success, setSuccess] = useState("");
  const {
    verify,
    resendVerificationCode,
    error,
    resendSuccess,
    loading,
    resending,
    setError,
  } = useAuth();
  const handleSubmit = async () => {
    // Clear previous errors
    setError("");

    // Validation
    if (!code || code.length !== 6) {
      setError("Please enter a valid 6-digit confirmation code");
      return;
    }

    if (!email) {
      setError("Email not found. Please sign up again.");
      return;
    }

    try {
      await verify({ email, code });
      setSuccess("Email verified! Redirecting to login...");
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err: unknown) {
      // Error is already set in context
      console.error("Verification error:", err);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError("Email not found. Please sign up again.");
      return;
    }

    setError("");
    setSuccess("");

    try {
      await resendVerificationCode(email);
      setSuccess("Verification code resent to your email");
    } catch (err: unknown) {
      // Error is already set in context
      console.error("Resend error:", err);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    if (value.length <= 6) {
      setCode(value);
      setError(""); // Clear error on typing
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
          {email || "your email"}
        </p>
      </div>

      {/* Confirmation Code Input */}
      <div className="w-full">
        <label
          htmlFor="code"
          className="text-neutral-800 text-sm font-semibold font-['Bitter']"
        >
          Confirmation Code <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="code"
          name="code"
          value={code}
          onChange={handleCodeChange}
          placeholder="Enter 6-digit code"
          maxLength={6}
          disabled={loading}
          className={`w-full h-12 px-4 mt-2 mb-2 bg-white rounded-lg border ${
            error ? "border-red-500" : "border-gray-200"
          } text-zinc-600 font-semibold font-['Bitter'] focus:outline-none focus:border-sky-600 disabled:bg-gray-100 disabled:cursor-not-allowed ${
            code ? "text-2xl tracking-widest text-left" : "text-sm text-left"
          }`}
        />
        {error.length > 0 && (
          <div className="w-80 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm font-semibold font-['Bitter']">
              {error}
            </p>
          </div>
        )}
      </div>

      {/* Resend Code Link */}
      <div className="w-full">
        <p className="text-zinc-600 text-sm font-semibold font-['Bitter']">
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resending || loading}
            className="text-sky-600 font-bold hover:underline disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {resending ? "Resending..." : "Resend Code"}
          </button>
        </p>
      </div>
      {(success || resendSuccess) && (
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}
      {/* Confirm Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || code.length !== 6}
        className="w-full h-12 bg-yellow-500 rounded-lg flex items-center justify-center text-sky-900 text-base font-semibold font-['Bitter'] hover:bg-yellow-600 transition-colors cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⏳</span>
            Confirming...
          </span>
        ) : (
          "Confirm Email"
        )}
      </button>

      {/* Back to Login */}
      <div className="w-full text-center">
        <span className="text-neutral-800 text-sm font-semibold font-['Bitter']">
          Wrong email?{" "}
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
