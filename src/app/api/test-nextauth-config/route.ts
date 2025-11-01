import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check environment variables
    const keycloakConfig = {
      clientIdExists: !!process.env.KEYCLOAK_CLIENT_ID,
      clientSecretExists: !!process.env.KEYCLOAK_CLIENT_SECRET,
      issuerExists: !!process.env.KEYCLOAK_ISSUER,
      issuerValue: process.env.KEYCLOAK_ISSUER ? process.env.KEYCLOAK_ISSUER.substring(0, 50) + '...' : 'undefined'
    };

    return NextResponse.json({
      success: true,
      message: "NextAuth configuration check",
      keycloakConfig,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('NextAuth config check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check NextAuth configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}