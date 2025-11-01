'use client';

import { useEffect, useState } from 'react';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('Loading...');

  useEffect(() => {
    // Parse URL parameters to check for errors
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const errorParam = urlParams.get('error');
      
      // Set debug info showing all URL parameters
      const allParams = Array.from(urlParams.entries())
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      
      // Update states in a callback to avoid cascading renders
      setTimeout(() => {
        setDebugInfo(allParams || 'No URL parameters');
        
        if (errorParam) {
          if (errorParam === 'Callback') {
            setError('There was an error during the authentication process. Please try again.');
          } else if (errorParam === 'AccessDenied') {
            setError('Access denied. You may not have permission to access this application.');
          } else {
            setError(`Authentication error: ${errorParam}`);
          }
        }
      }, 0);
    }
  }, []);

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-ink">Shared Thread</h1>
          <p className="text-support mt-2">Sign in to your account</p>
        </div>

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
              onClick={() => window.location.href = '/api/auth/signin/keycloak?callbackUrl=%2Flibrary'}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 font-medium py-3 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-3"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Sign in with Keycloak
            </button>

            {/* Debug Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Debug Info</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <div>URL Parameters: {debugInfo}</div>
                <div>Callback URL: /library</div>
                <div>Error: {error || 'None'}</div>
              </div>
            </div>
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