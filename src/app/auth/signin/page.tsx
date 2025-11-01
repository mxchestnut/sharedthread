'use client'

import { signIn, getSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    console.log('SignInPage mounted')
    // Check if already signed in
    getSession().then((session) => {
      console.log('Current session:', session)
      if (session) {
        router.push('/library')
      }
    })
  }, [router])

  const handleKeycloakSignIn = async () => {
    console.log('handleKeycloakSignIn called')
    setLoading(true)
    try {
      console.log('Calling signIn...')
      const result = await signIn('keycloak', { 
        callbackUrl: '/library',
        redirect: true 
      })
      console.log('signIn result:', result)
    } catch (error) {
      console.error('Sign in error:', error)
      setLoading(false)
    }
  }

  const handleDirectLink = () => {
    console.log('Direct link clicked')
    window.location.href = '/api/auth/signin/keycloak?callbackUrl=' + encodeURIComponent('https://sharedthread.co/library')
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Shared Thread
          </h1>
          <p className="text-gray-600 mb-8">
            A private workspace for thoughtful collaboration
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleKeycloakSignIn}
            disabled={loading}
            className="w-full flex justify-center items-center gap-3 px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
              />
            </svg>
            {loading ? 'Signing in...' : 'Sign in with Keycloak'}
          </button>
          
          {/* Debug: Direct OAuth link */}
          <button
            onClick={handleDirectLink}
            className="w-full flex justify-center items-center gap-3 px-4 py-3 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
              />
            </svg>
            🚨 DEBUG: Direct OAuth Link
          </button>
        </div>

        {/* Debug Section */}
        <div className="bg-gray-50 p-4 rounded-md text-xs">
          <p><strong>Debug Info:</strong></p>
          <p>Page loaded: {new Date().toLocaleTimeString()}</p>
          <p>Loading state: {loading ? 'true' : 'false'}</p>
          <p>Check browser console for detailed logs</p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            By signing in, you agree to our{' '}
            <a href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}