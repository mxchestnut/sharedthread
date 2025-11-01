'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Parse URL parameters on client side
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const errorParam = urlParams.get('error');
      const messageParam = urlParams.get('message');
      
      if (errorParam) {
        if (errorParam === 'Callback') {
          setError('There was an error during the authentication process. Please try again.');
        } else if (errorParam === 'AccessDenied') {
          setError('Access denied. You may not have permission to access this application.');
        } else {
          setError(`Authentication error: ${errorParam}`);
        }
      }

      if (messageParam) {
        if (messageParam === 'signup_success') {
          setSuccessMessage('Account created successfully! Please sign in to continue.');
        } else if (messageParam === 'waitlist') {
          setSuccessMessage('Thank you for signing up! Your account is on the waitlist because you are under 18. We\'ll notify you when you can access the platform.');
        } else if (messageParam === 'account_exists') {
          setSuccessMessage('An account with this email or phone already exists. Please sign in.');
        }
      }
    }
  }, []);

  const handleKeycloakSignIn = async () => {
    setIsLoading(true);
    try {
      console.log('Starting Keycloak sign-in...');
      const result = await signIn('keycloak', { 
        callbackUrl: '/library',
        redirect: false 
      });
      
      console.log('Sign-in result:', result);
      
      if (result?.error) {
        console.error('Sign-in error:', result.error);
        setError(`Sign-in failed: ${result.error}`);
      } else if (result?.url) {
        console.log('Redirecting to:', result.url);
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Sign-in exception:', error);
      setError('An unexpected error occurred during sign-in.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-ink">Shared Thread</h1>
          <p className="text-support mt-2">Sign in to your account</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-500 text-green-800 rounded-md">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-500 text-red-800 rounded-md">
            {error}
          </div>
        )}

        {/* Sign In Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="space-y-4">
            {/* Keycloak Sign In Button */}
            <button
              onClick={handleKeycloakSignIn}
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 font-medium py-3 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  Sign in with Keycloak
                </>
              )}
            </button>

            {/* Debug Info (only in development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Debug Info</h3>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Error: {error || 'None'}</div>
                  <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
                  <div>Callback URL: /library</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-support text-sm">
            Don&apos;t have an account?{' '}
            <a href="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </a>
          </p>
          <div className="mt-4 text-xs text-support">
            <p>Shared Thread is a private workspace for creators.</p>
            <p className="mt-1">© 2025 Shared Thread</p>
          </div>
        </div>
      </div>
    </div>
  );
}