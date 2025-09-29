'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const errorMessages = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The verification token has expired or has already been used.',
  Default: 'An unexpected error occurred.',
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const errorParam = searchParams.get('error');
    setError(errorParam || 'Default');
  }, [searchParams]);

  const errorMessage = errorMessages[error as keyof typeof errorMessages] || errorMessages.Default;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 bg-gray-900 p-8 rounded-xl border border-gray-800 text-center">
        <div className="space-y-4">
          <div className="text-red-400 text-6xl">⚠️</div>
          <h1 className="text-3xl font-bold text-white">Authentication Error</h1>
          <p className="text-gray-400 text-lg">{errorMessage}</p>
        </div>

        <div className="space-y-3">
          <Link
            href="/signup"
            className="block w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300"
          >
            Try Signing Up Again
          </Link>
          <Link
            href="/login"
            className="block w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300"
          >
            Go to Login
          </Link>
          <Link
            href="/"
            className="block w-full text-green-400 hover:text-green-300 font-semibold py-3 px-4 transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
