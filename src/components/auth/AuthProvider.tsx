'use client'

import { ReactNode } from 'react'

interface AuthProviderProps {
  children: ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  // Custom auth provider - no session provider needed since we use JWT cookies
  return <>{children}</>
}