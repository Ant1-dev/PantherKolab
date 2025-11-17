import Link from "next/link";
import * as styles from "./notFound.style";

export function NotFoundPage() {
  return (
    <div
      className="w-full h-screen relative bg-sky-600 flex items-center justify-center overflow-hidden"
      style={styles.root}
    >
      {/* Decorative panther paws overlay */}
      <div
        className="absolute top-[39px] left-1/2 -translate-x-1/2 w-[503px] h-[639px] pointer-events-none z-10"
        style={styles.decorativePaws}
      />

      {/* 404 Content Card */}
      <div className="relative z-20 w-full max-w-2xl mx-8 p-12 bg-white/95 backdrop-blur-sm rounded-2xl shadow-[0px_8px_32px_0px_rgba(0,0,0,0.12)] flex flex-col items-center text-center gap-6">
        {/* 404 Number */}
        <div className="text-sky-600 text-9xl font-bold font-['Bitter']">
          404
        </div>

        {/* Heading */}
        <h1 className="text-sky-900 text-4xl font-bold font-['Bitter']">
          Page Not Found
        </h1>

        {/* Message */}
        <p className="text-zinc-600 text-lg font-semibold font-['Bitter'] max-w-md">
          Oops! The page you&apos;re looking for doesn&apos;t exist. It might have been moved or deleted.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
          <Link
            href="/dashboard"
            className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-sky-900 text-base font-semibold font-['Bitter'] rounded-lg transition-colors flex items-center justify-center"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white text-base font-semibold font-['Bitter'] rounded-lg transition-colors flex items-center justify-center"
          >
            Back to Login
          </Link>
        </div>

        {/* Footer text */}
        <p className="mt-4 text-zinc-500 text-sm font-semibold font-['Bitter']">
          Need help? Contact support at{" "}
          <a href="mailto:support@pantherkolab.com" className="text-sky-600 hover:underline">
            support@pantherkolab.com
          </a>
        </p>
      </div>
    </div>
  );
}