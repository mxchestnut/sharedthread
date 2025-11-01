import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test NextAuth signin flow
    const baseUrl = process.env.NEXTAUTH_URL || 'https://sharedthread.co'
    const testUrl = `${baseUrl}/api/auth/signin/keycloak`
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'SharedThread-Test',
      },
    })
    
    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      redirected: response.redirected,
      headers: Object.fromEntries(response.headers.entries()),
      body: response.status === 200 ? await response.text() : null
    })
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}