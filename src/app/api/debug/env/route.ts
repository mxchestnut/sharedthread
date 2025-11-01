import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasKeycloakClientId: !!process.env.KEYCLOAK_CLIENT_ID,
      hasKeycloakClientSecret: !!process.env.KEYCLOAK_CLIENT_SECRET,
      hasKeycloakIssuer: !!process.env.KEYCLOAK_ISSUER,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      keycloakIssuer: process.env.KEYCLOAK_ISSUER,
      nodeEnv: process.env.NODE_ENV
    })
  } catch {
    return NextResponse.json({ error: 'Failed to check environment' }, { status: 500 })
  }
}