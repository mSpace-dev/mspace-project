'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password reset instructions have been sent to your email.');
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-black/80" />
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-green-900/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-56 h-56 bg-green-800/3 rounded-full blur-2xl animate-pulse delay-1000" />
      </div>

      {/* Back to Login Button */}
      <div className="absolute top-4 left-4 z-50">
        <a
          href="/login"
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-200 bg-black/20 hover:bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back to Login</span>
        </a>
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-md mx-auto py-12 px-4 flex items-center min-h-screen">
        <div className="w-full bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-green-500/10 border border-green-500/20 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-green-100 to-green-200 bg-clip-text text-transparent mb-2">
              Forgot Password?
            </h1>
            <p className="text-gray-400">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
                placeholder="Enter your email address"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Remember your password?{' '}
              <a
                href="/login"
                className="text-green-400 hover:text-green-300 transition-colors font-medium underline underline-offset-2 decoration-green-400/50 hover:decoration-green-300"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
