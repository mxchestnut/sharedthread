'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { TOTPVerification, AuthResponse } from '@/types/auth';

interface TOTPFormProps {
  sessionId: string;
  onBack: () => void;
}

export default function TOTPForm({ sessionId, onBack }: TOTPFormProps) {
  const [totpCode, setTotpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/totp-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, totpCode } as TOTPVerification),
      });

      const result: AuthResponse = await response.json();

      if (result.success) {
        router.push('/library');
        router.refresh();
      } else {
        setError(result.error || 'TOTP verification failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="totp-code" className="block text-sm font-medium text-secondary mb-2">
          Authentication Code
        </label>
        <input
          id="totp-code"
          type="text"
          required
          value={totpCode}
          onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="Enter 6-digit code"
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-center text-lg tracking-widest"
          disabled={isLoading}
          maxLength={6}
        />
      </div>

      <div className="text-sm text-support">
        Enter the 6-digit code from your authenticator app.
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-panel focus:outline-none focus:ring-2 focus:ring-accent"
          disabled={isLoading}
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading || totpCode.length !== 6}
          className="flex-1 px-4 py-2 bg-accent text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'Verifying...' : 'Verify'}
        </button>
      </div>

      <div className="text-sm text-support text-center">
        Demo TOTP: Use code <code className="bg-gray-100 px-1 rounded">123456</code> or any 6 digits
      </div>
    </form>
  );
}