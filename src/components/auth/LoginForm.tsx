'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { LoginCredentials, AuthResponse } from '@/types/auth';
import { logError } from '@/lib/error-logger';


interface LoginFormProps {
  onTOTPRequired?: (sessionId: string) => void;
}

export default function LoginForm({ onTOTPRequired }: LoginFormProps) {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const result: AuthResponse = await response.json();

      if (result.success) {
        if (result.requiresTOTP && result.sessionId) {
          // Redirect to TOTP verification
          onTOTPRequired?.(result.sessionId);
        } else {
          // Login successful, redirect to intended page or library
          // Force a hard refresh to ensure cookies are picked up
          window.location.href = redirectTo;
        }
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      logError('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-secondary mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={credentials.email}
          onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-secondary mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={credentials.password}
          onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-accent text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>

      <div className="text-sm text-support text-center">
        <a href="/register" className="text-accent hover:underline">
          Need an account? Sign up
        </a>
      </div>
    </form>
  );
}