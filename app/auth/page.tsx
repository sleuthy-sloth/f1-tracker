'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/useAuth';

export default function AuthPage() {
  const { login, signup, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResetSuccess(false);

    try {
      if (isSignUp) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      await resetPassword(email);
      setResetSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-f1-carbon flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Settings */}
        <Link href="/settings" className="text-xs text-f1-silver hover:text-f1-white transition-colors flex items-center gap-1 mb-4">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Settings
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-f1-white mb-2">
            {isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
          </h1>
          <p className="text-f1-silver">
            {isSignUp ? 'Create your SectorOne account' : 'Access your account'}
          </p>
        </div>

        {/* Success Banner */}
        {resetSuccess && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-xl text-green-400 text-sm">
            Password reset email sent. Check your inbox to reset your password.
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-f1-silver mb-2 uppercase tracking-wider">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#111418] border border-white/[0.07] rounded-xl text-f1-white placeholder-f1-silver/30 focus:outline-none focus:border-f1-cyan/50 focus:ring-1 focus:ring-f1-cyan/20 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-f1-silver mb-2 uppercase tracking-wider">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#111418] border border-white/[0.07] rounded-xl text-f1-white placeholder-f1-silver/30 focus:outline-none focus:border-f1-cyan/50 focus:ring-1 focus:ring-f1-cyan/20 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {/* Forgot Password Link */}
          {!isSignUp && (
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={loading}
              className="text-xs text-f1-silver hover:text-f1-cyan transition-colors mt-2 disabled:opacity-50"
            >
              Forgot password?
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-f1-red text-white font-bold rounded-xl hover:bg-f1-red/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle Sign Up / Sign In */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setResetSuccess(false);
            }}
            className="text-sm text-f1-silver hover:text-f1-white transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}