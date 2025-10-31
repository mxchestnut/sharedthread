'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to our custom login page
    router.replace('/login')
  }, [router])

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center">
      <div className="text-center">
        <p className="text-support">Redirecting to login...</p>
      </div>
    </div>
  )
}