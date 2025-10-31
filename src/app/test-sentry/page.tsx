'use client';

import { useState } from 'react';
import { logError, logWarning, logInfo, setUserContext } from '@/lib/error-logger';

export default function TestSentryPage() {
  const [result, setResult] = useState<string>('');

  const testClientError = () => {
    try {
      // This will throw an error
      throw new Error('Test client-side error from Sentry test page');
    } catch (error) {
      logError('Client error test', error, { source: 'test-page', action: 'client-error' });
      setResult('✅ Client error logged! Check your Sentry dashboard.');
    }
  };

  const testWarning = () => {
    logWarning('Test warning message', { severity: 'low', source: 'test-page' });
    setResult('✅ Warning logged! Check your Sentry dashboard.');
  };

  const testInfo = () => {
    logInfo('Test info message', { action: 'info-test', source: 'test-page' });
    setResult('✅ Info logged! Check your Sentry dashboard.');
  };

  const testUserContext = () => {
    setUserContext({
      id: 'test-user-123',
      email: 'test@example.com',
      username: 'testuser'
    });
    logInfo('User context set', { userId: 'test-user-123' });
    setResult('✅ User context set! Future errors will include user info.');
  };

  const testServerError = async () => {
    try {
      const response = await fetch('/api/test-sentry');
      const data = await response.json();
      setResult(`✅ Server error triggered! ${data.message}`);
    } catch (err) {
      setResult('❌ Failed to call API endpoint');
      console.error(err);
    }
  };

  const testUncaughtError = () => {
    // This will be caught by Sentry automatically
    setTimeout(() => {
      throw new Error('Uncaught test error - should be caught by Sentry');
    }, 100);
    setResult('✅ Uncaught error thrown! Check Sentry in a moment...');
  };

  return (
    <div className="min-h-screen bg-[#F9F7F4] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Sentry Error Monitoring Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <p className="text-gray-600 mb-4">
            Click the buttons below to test different types of errors and logging.
            Check your Sentry dashboard at{' '}
            <a 
              href="https://sentry.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              sentry.io
            </a>
            {' '}to see the results.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={testClientError}
              className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Test Client Error
            </button>
            
            <button
              onClick={testServerError}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition"
            >
              Test Server Error (API)
            </button>
            
            <button
              onClick={testUncaughtError}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
              Test Uncaught Error
            </button>
            
            <button
              onClick={testWarning}
              className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
            >
              Test Warning
            </button>
            
            <button
              onClick={testInfo}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Test Info Log
            </button>
            
            <button
              onClick={testUserContext}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Set User Context
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">{result}</p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h2 className="font-semibold text-blue-900 mb-2">What to expect:</h2>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• <strong>Development mode:</strong> Errors logged to console only (Sentry disabled)</li>
            <li>• <strong>Production mode:</strong> Errors sent to Sentry dashboard</li>
            <li>• <strong>Session replay:</strong> Video replay for errors (in production)</li>
            <li>• <strong>User context:</strong> User info attached to errors</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
