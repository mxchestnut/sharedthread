import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'
import { logError } from '@/lib/error-logger';


export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const token = authHeader.substring(7)
    const payload = await verifyJWT(token)
    const userId = payload.userId
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    // Validate required fields
    const { agreedToHouseRules, agreedToTerms, isOver18 } = data
    
    if (!agreedToHouseRules || !agreedToTerms || !isOver18) {
      return NextResponse.json(
        { error: 'Missing required agreements' }, 
        { status: 400 }
      )
    }

    // For now, we'll simulate updating the user record
    // In a real implementation, this would update the database
    console.log('Onboarding completed for user:', {
      userId: userId,
      agreedToHouseRules,
      agreedToTerms,
      isOver18,
      wantsNewsletter: data.wantsNewsletter,
      resumeUrl: data.resumeUrl,
      timestamp: new Date().toISOString()
    })

    // In a real implementation, you would:
    // 1. Update user record with onboarding data
    // 2. Set isApproved to false (requires staff approval)
    // 3. Send notification to staff for review
    // 4. Send confirmation email to user

    return NextResponse.json({ 
      success: true,
      message: 'Onboarding completed successfully' 
    })
    
  } catch (error) {
    logError('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}