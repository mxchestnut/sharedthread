'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LoginFormWrapper from '@/components/auth/LoginFormWrapper';
import TOTPForm from '@/components/auth/TOTPForm';

function LoginContent() {
  const [currentStep, setCurrentStep] = useState<'login' | 'totp'>('login');
  const [sessionId, setSessionId] = useState<string>('');
  const searchParams = useSearchParams();

  const getSuccessMessage = () => {
    const message = searchParams.get('message');
    if (message === 'signup_success') {
      return 'Account created successfully! Please sign in to continue.';
    } else if (message === 'waitlist') {
      return 'Thank you for signing up! Your account is on the waitlist because you are under 18. We\'ll notify you when you can access the platform.';
    } else if (message === 'account_exists') {
      return 'An account with this email or phone already exists. Please sign in.';
    }
    return '';
  };

  const successMessage = getSuccessMessage();

  const handleTOTPRequired = (id: string) => {
    setSessionId(id);
    setCurrentStep('totp');
  };

  const handleBackToLogin = () => {
    setCurrentStep('login');
    setSessionId('');
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-ink">Shared Thread</h1>
          <p className="text-support mt-2">
            {currentStep === 'login' ? 'Sign in to your account' : 'Two-factor authentication'}
          </p>
        </div>

        <div className="card">
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border-2 border-green-500 text-green-800 rounded">
              {successMessage}
            </div>
          )}
          
          {currentStep === 'login' ? (
            <LoginFormWrapper onTOTPRequired={handleTOTPRequired} />
          ) : (
            <TOTPForm sessionId={sessionId} onBack={handleBackToLogin} />
          )}
        </div>

        <div className="mt-6 text-center text-sm text-support">
          <p>Shared Thread is a private workspace for creators.</p>
          <p className="mt-1">© 2025 Shared Thread</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-paper flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-support">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}